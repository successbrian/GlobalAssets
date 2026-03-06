/**
 * NOVUSFERRE - PHOTO BATTLE ENGINE
 * "Hot or Not" Judging Module
 * 
 * "Judge. Vote. Rise."
 */

import { 
  PhotoBattle, 
  BattleVote, 
  BATTLE_STATUS, 
  CONSTANTS,
  Asset,
  User,
} from './novusferreTypes';

// ============================================
// DATABASE INTERFACE
// ============================================

interface Database {
  table(name: string): {
    where(col: string, val: unknown): any;
    select(...cols: string[]): any;
    update(data: Record<string, unknown>): any;
    insert(data: Record<string, unknown>): any;
    first(): any;
    count(): Promise<number>;
  };
}

// ============================================
// TYPES
// ============================================

interface BattleResult {
  battle_id: string;
  winner_id: string;
  loser_id: string;
  votes_winner: number;
  votes_loser: number;
  market_jitter_applied: boolean;
  jitter_amount: number;
}

interface BattleEligibility {
  eligible: boolean;
  reason?: string;
}

// ============================================
// PHOTO BATTLE ENGINE
// ============================================

export class PhotoBattleEngine {
  private db: Database;
  private readonly VOTE_COST = 0.10; // 0.10 Credits per vote
  private readonly JITTER_BONUS = 0.03; // +3% market jitter for winner

  constructor(db: Database) {
    this.db = db;
  }

  /**
   * Check if user is eligible for battle
   */
  async checkEligibility(userId: string): Promise<BattleEligibility> {
    const user = await this.db.table('users').where('id', userId).first();
    if (!user) {
      return { eligible: false, reason: 'User not found' };
    }

    if (user.is_backstage) {
      return { eligible: false, reason: 'Backstage Lounge members cannot battle' };
    }

    if (user.is_banned) {
      return { eligible: false, reason: 'Banned users cannot battle' };
    }

    const wallet = await this.db.table('wallets').where('user_id', userId).first();
    if (!wallet || wallet.balance_credits < this.VOTE_COST) {
      return { eligible: false, reason: `Insufficient credits. Vote costs ${this.VOTE_COST} Credits` };
    }

    // Check if already in active battle
    const activeBattle = await this.db.table('photo_battles')
      .where('contender_1_id', userId)
      .where('status', BATTLE_STATUS.ACTIVE)
      .first();

    if (activeBattle) {
      return { eligible: false, reason: 'Already in an active battle' };
    }

    return { eligible: true };
  }

  /**
   * Get random opponent (balanced Boys & Girls)
   */
  async getRandomOpponent(
    requesterId: string,
    requesterPreference?: 'BOYS' | 'GIRLS' | 'ALL'
  ): Promise<{
    found: boolean;
    opponent?: User;
    reason?: string;
  }> {
    // Get requester's gender preference
    const requester = await this.db.table('users').where('id', requesterId).first();
    const preference = requesterPreference || requester?.gender_preference || 'ALL';

    // Get eligible users excluding requester and recent battles
    let query = this.db.table('users')
      .where('id', '!=', requesterId)
      .where('is_backstage', false)
      .where('is_banned', false);

    // Filter by preference if specified
    if (preference !== 'ALL') {
      // Note: Would need a gender field to filter properly
      // For now, just return any eligible user
    }

    const opponents = await query.select('*');
    
    if (opponents.length === 0) {
      return { found: false, reason: 'No eligible opponents found' };
    }

    // Pick random opponent
    const opponent = opponents[Math.floor(Math.random() * opponents.length)];
    return { found: true, opponent };
  }

  /**
   * Create a new battle
   */
  async createBattle(
    contender1Id: string,
    contender2Id: string,
    image1Url: string,
    image2Url: string
  ): Promise<{ success: boolean; battle?: PhotoBattle; error?: string }> {
    try {
      // Verify both users are eligible
      const eligibility1 = await this.checkEligibility(contender1Id);
      const eligibility2 = await this.checkEligibility(contender2Id);

      if (!eligibility1.eligible) {
        return { success: false, error: `Contender 1: ${eligibility1.reason}` };
      }

      if (!eligibility2.eligible) {
        return { success: false, error: `Contender 2: ${eligibility2.reason}` };
      }

      const battle: PhotoBattle = {
        id: crypto.randomUUID(),
        contender_1_id: contender1Id,
        contender_2_id: contender2Id,
        image_1_url: image1Url,
        image_2_url: image2Url,
        votes_1: 0,
        votes_2: 0,
        total_credits_spent: 0,
        status: BATTLE_STATUS.ACTIVE,
        winner_id: null,
        started_at: new Date().toISOString(),
        ended_at: null,
        market_jitter_applied: false,
      };

      await this.db.table('photo_battles').insert({
        id: battle.id,
        contender_1_id: contender1Id,
        contender_2_id: contender2Id,
        image_1_url: image1Url,
        image_2_url: image2Url,
        votes_1: 0,
        votes_2: 0,
        total_credits_spent: 0,
        status: BATTLE_STATUS.ACTIVE,
        winner_id: null,
        started_at: battle.started_at,
        ended_at: null,
        market_jitter_applied: false,
      });

      return { success: true, battle };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Cast a vote in a battle
   */
  async castVote(
    voterId: string,
    battleId: string,
    votedForId: '1' | '2'
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const battle = await this.db.table('photo_battles').where('id', battleId).first();
      if (!battle) {
        return { success: false, error: 'Battle not found' };
      }

      if (battle.status !== BATTLE_STATUS.ACTIVE) {
        return { success: false, error: 'Battle is no longer active' };
      }

      // Check eligibility
      const eligibility = await this.checkEligibility(voterId);
      if (!eligibility.eligible) {
        return { success: false, error: eligibility.reason };
      }

      // Check if already voted
      const existingVote = await this.db.table('battle_votes')
        .where('voter_id', voterId)
        .where('battle_id', battleId)
        .first();

      if (existingVote) {
        return { success: false, error: 'Already voted in this battle' };
      }

      // Deduct credits
      const wallet = await this.db.table('wallets').where('user_id', voterId).first();
      await this.db.table('wallets')
        .where('user_id', voterId)
        .update({ balance_credits: wallet.balance_credits - this.VOTE_COST });

      // Record vote
      await this.db.table('battle_votes').insert({
        id: crypto.randomUUID(),
        battle_id: battleId,
        voter_id: voterId,
        voted_for_id: votedForId === '1' ? battle.contender_1_id : battle.contender_2_id,
        credits_spent: this.VOTE_COST,
        created_at: new Date().toISOString(),
      });

      // Update battle
      if (votedForId === '1') {
        await this.db.table('photo_battles')
          .where('id', battleId)
          .update({ 
            votes_1: battle.votes_1 + 1,
            total_credits_spent: battle.total_credits_spent + this.VOTE_COST,
          });
      } else {
        await this.db.table('photo_battles')
          .where('id', battleId)
          .update({ 
            votes_2: battle.votes_2 + 1,
            total_credits_spent: battle.total_credits_spent + this.VOTE_COST,
          });
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * End battle and apply market jitter
   */
  async endBattle(battleId: string): Promise<{
    success: boolean;
    result?: BattleResult;
    error?: string;
  }> {
    try {
      const battle = await this.db.table('photo_battles').where('id', battleId).first();
      if (!battle) {
        return { success: false, error: 'Battle not found' };
      }

      if (battle.status !== BATTLE_STATUS.ACTIVE) {
        return { success: false, error: 'Battle is already ended' };
      }

      // Determine winner
      let winnerId: string;
      let loserId: string;

      if (battle.votes_1 > battle.votes_2) {
        winnerId = battle.contender_1_id;
        loserId = battle.contender_2_id;
      } else if (battle.votes_2 > battle.votes_1) {
        winnerId = battle.contender_2_id;
        loserId = battle.contender_1_id;
      } else {
        // Tie - no jitter applied
        await this.db.table('photo_battles')
          .where('id', battleId)
          .update({
            status: BATTLE_STATUS.COMPLETED,
            ended_at: new Date().toISOString(),
          });

        return {
          success: true,
          result: {
            battle_id: battleId,
            winner_id: 'TIE',
            loser_id: 'TIE',
            votes_winner: battle.votes_1,
            votes_loser: battle.votes_2,
            market_jitter_applied: false,
            jitter_amount: 0,
          },
        };
      }

      // Apply market jitter to winner (+3%)
      const winnerAsset = await this.db.table('assets').where('owner_id', winnerId).first();
      let jitterAmount = 0;

      if (winnerAsset) {
        jitterAmount = winnerAsset.current_price * this.JITTER_BONUS;
        await this.db.table('assets')
          .where('id', winnerAsset.id)
          .update({
            current_price: winnerAsset.current_price + jitterAmount,
            last_price_update: new Date().toISOString(),
          });
      }

      // Update battle status
      await this.db.table('photo_battles')
        .where('id', battleId)
        .update({
          status: BATTLE_STATUS.COMPLETED,
          winner_id: winnerId,
          ended_at: new Date().toISOString(),
          market_jitter_applied: true,
        });

      return {
        success: true,
        result: {
          battle_id: battleId,
          winner_id: winnerId,
          loser_id: loserId,
          votes_winner: winnerId === battle.contender_1_id ? battle.votes_1 : battle.votes_2,
          votes_loser: winnerId === battle.contender_1_id ? battle.votes_2 : battle.votes_1,
          market_jitter_applied: true,
          jitter_amount: jitterAmount,
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get active battles
   */
  async getActiveBattles(): Promise<PhotoBattle[]> {
    return await this.db.table('photo_battles')
      .where('status', BATTLE_STATUS.ACTIVE)
      .select('*');
  }

  /**
   * Get user's battle history
   */
  async getUserBattles(userId: string): Promise<PhotoBattle[]> {
    return await this.db.table('photo_battles')
      .where('contender_1_id', userId)
      .orWhere('contender_2_id', userId)
      .orderBy('started_at', 'desc')
      .select('*');
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

let photoBattleEngineInstance: PhotoBattleEngine | null = null;

export function getPhotoBattleEngine(db: Database): PhotoBattleEngine {
  if (!photoBattleEngineInstance) {
    photoBattleEngineInstance = new PhotoBattleEngine(db);
  }
  return photoBattleEngineInstance;
}

export { BattleResult, BattleEligibility };
