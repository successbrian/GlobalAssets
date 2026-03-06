/**
 * NOVUSFERRE - ENGAGEMENT HUB
 * Circles, Broadcasts, and Intelligence Paywall
 * 
 * "Connect. Judge. Trade."
 */

import { 
  Circle, 
  CircleMembership, 
  Broadcast, 
  Message,
  User,
  CONSTANTS,
  GENDER_PREFERENCE,
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

interface BroadcastReply {
  id: string;
  broadcast_id: string;
  sender_id: string;
  content: string;
  is_free: boolean;
  credits_required: number;
  created_at: string;
}

interface IntelligenceRequest {
  requester_id: string;
  target_user_id: string;
  cost_credits: number;
  revealed_identity: string | null;
  revealed_at: string | null;
}

interface FeeConstants {
  BROADCAST_COST: number;
  DM_REPLY_COST: number;
  IDENTITY_REVEAL_COST: number;
}

interface TimeConstants {
  BROADCAST_COOLDOWN_DAYS: number;
  CIRCLE_RETENTION_DAYS: number;
  MESSAGE_PURGE_DAYS: number;
}

const FEE_CONSTANTS: FeeConstants = {
  BROADCAST_COST: 100,
  DM_REPLY_COST: 10,
  IDENTITY_REVEAL_COST: 2,
};

const TIME_CONSTANTS: TimeConstants = {
  BROADCAST_COOLDOWN_DAYS: 7,
  CIRCLE_RETENTION_DAYS: 90,
  MESSAGE_PURGE_DAYS: 14,
};

// ============================================
// CIRCLE ENGINE
// ============================================

export class CircleEngine {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  /**
   * Create a new circle
   */
  async createCircle(
    ownerId: string,
    name: string,
    description: string,
    isPrivate: boolean = false
  ): Promise<{ success: boolean; circle?: Circle; error?: string }> {
    try {
      const circle: Circle = {
        id: crypto.randomUUID(),
        owner_id: ownerId,
        name: name,
        description: description,
        is_private: isPrivate,
        member_count: 1,
        created_at: new Date().toISOString(),
      };

      await this.db.table('circles').insert({
        id: circle.id,
        owner_id: ownerId,
        name: name,
        description: description,
        is_private: isPrivate,
        member_count: 1,
        created_at: circle.created_at,
      });

      // Auto-add owner as member
      await this.db.table('circle_memberships').insert({
        circle_id: circle.id,
        user_id: ownerId,
        joined_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + TIME_CONSTANTS.CIRCLE_RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString(),
      });

      return { success: true, circle };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Join a circle
   */
  async joinCircle(userId: string, circleId: string): Promise<{ success: boolean; error?: string }> {
    const circle = await this.db.table('circles').where('id', circleId).first();
    if (!circle) {
      return { success: false, error: 'Circle not found' };
    }

    // Check if already member
    const existing = await this.db.table('circle_memberships')
      .where('user_id', userId)
      .where('circle_id', circleId)
      .first();

    if (existing) {
      return { success: false, error: 'Already a member' };
    }

    // Add membership
    await this.db.table('circle_memberships').insert({
      circle_id: circleId,
      user_id: userId,
      joined_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + TIME_CONSTANTS.CIRCLE_RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString(),
    });

    // Update member count
    await this.db.table('circles')
      .where('id', circleId)
      .update({ member_count: circle.member_count + 1 });

    return { success: true };
  }

  /**
   * Get user's circles
   */
  async getUserCircles(userId: string): Promise<Circle[]> {
    const memberships = await this.db.table('circle_memberships')
      .where('user_id', userId)
      .select('circle_id');

    const circleIds = memberships.map((m: any) => m.circle_id);
    const circles = await Promise.all(
      circleIds.map(async (id: string) => {
        const circle = await this.db.table('circles').where('id', id).first();
        return circle;
      })
    );

    return circles.filter(Boolean);
  }

  /**
   * Get public circles
   */
  async getPublicCircles(genderPreference: GENDER_PREFERENCE = GENDER_PREFERENCE.ALL): Promise<Circle[]> {
    const circles = await this.db.table('circles')
      .where('is_private', false)
      .select('*');

    // Filter by gender preference if applicable
    return circles;
  }
}

// ============================================
// BROADCAST ENGINE
// ============================================

export class BroadcastEngine {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  /**
   * Create a broadcast (costs 100 Credits)
   */
  async createBroadcast(
    senderId: string,
    content: string
  ): Promise<{ success: boolean; broadcast?: Broadcast; error?: string }> {
    try {
      // Check wallet balance
      const wallet = await this.db.table('wallets').where('user_id', senderId).first();
      if (!wallet || wallet.balance_credits < FEE_CONSTANTS.BROADCAST_COST) {
        return { 
          success: false, 
          error: `Insufficient credits. Broadcast costs ${FEE_CONSTANTS.BROADCAST_COST} Credits` 
        };
      }

      // Check cooldown (7 days)
      const lastBroadcast = await this.db.table('broadcasts')
        .where('sender_id', senderId)
        .orderBy('created_at', 'desc')
        .first();

      if (lastBroadcast) {
        const lastDate = new Date(lastBroadcast.created_at);
        const daysSince = (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSince < TIME_CONSTANTS.BROADCAST_COOLDOWN_DAYS) {
          const daysRemaining = Math.ceil(TIME_CONSTANTS.BROADCAST_COOLDOWN_DAYS - daysSince);
          return { 
            success: false, 
            error: `Broadcast cooldown active. Try again in ${daysRemaining} days` 
          };
        }
      }

      // Deduct credits
      await this.db.table('wallets')
        .where('user_id', senderId)
        .update({ balance_credits: wallet.balance_credits - FEE_CONSTANTS.BROADCAST_COST });

      // Create broadcast
      const broadcast: Broadcast = {
        id: crypto.randomUUID(),
        sender_id: senderId,
        content: content,
        credits_cost: FEE_CONSTANTS.BROADCAST_COST,
        reach_count: 0,
        engagement_count: 0,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      };

      await this.db.table('broadcasts').insert({
        id: broadcast.id,
        sender_id: senderId,
        content: content,
        credits_cost: FEE_CONSTANTS.BROADCAST_COST,
        reach_count: 0,
        engagement_count: 0,
        created_at: broadcast.created_at,
        expires_at: broadcast.expires_at,
      });

      return { success: true, broadcast };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Reply to a broadcast (DM)
   */
  async replyToBroadcast(
    senderId: string,
    broadcastId: string,
    content: string,
    giftAmount?: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const broadcast = await this.db.table('broadcasts').where('id', broadcastId).first();
      if (!broadcast) {
        return { success: false, error: 'Broadcast not found' };
      }

      const dmFee = broadcast.dm_fee || 0;
      const feeRequired = dmFee > 0;

      if (feeRequired && (!giftAmount || giftAmount < dmFee)) {
        return { 
          success: false, 
          error: `DM fee required: ${dmFee} Credits` 
        };
      }

      // Create message
      await this.db.table('messages').insert({
        sender_id: senderId,
        recipient_id: broadcast.sender_id,
        broadcast_id: broadcastId,
        content: content,
        is_locked: feeRequired,
        is_read: false,
        expires_at: null,
        created_at: new Date().toISOString(),
      });

      // Update engagement
      await this.db.table('broadcasts')
        .where('id', broadcastId)
        .update({ engagement_count: broadcast.engagement_count + 1 });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

// ============================================
// INTELLIGENCE ENGINE
// ============================================

export class IntelligenceEngine {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  /**
   * Purchase identity reveal (2 Credits)
   */
  async revealIdentity(requesterId: string, targetUserId: string): Promise<{
    success: boolean;
    identity?: string;
    error?: string;
  }> {
    const COST = FEE_CONSTANTS.IDENTITY_REVEAL_COST;

    // Check wallet
    const wallet = await this.db.table('wallets').where('user_id', requesterId).first();
    if (!wallet || wallet.balance_credits < COST) {
      return { success: false, error: `Insufficient credits. Cost: ${COST} Credits` };
    }

    // Check if already purchased
    const existing = await this.db.table('intelligence_requests')
      .where('requester_id', requesterId)
      .where('target_user_id', targetUserId)
      .first();

    if (existing) {
      return { 
        success: true, 
        identity: existing.revealed_identity || 'Anonymous',
        error: 'Already purchased - see previous reveal',
      };
    }

    // Get target user
    const target = await this.db.table('users').where('id', targetUserId).first();
    if (!target) {
      return { success: false, error: 'User not found' };
    }

    // Deduct credits
    await this.db.table('wallets')
      .where('user_id', requesterId)
      .update({ balance_credits: wallet.balance_credits - COST });

    // Record purchase
    await this.db.table('intelligence_requests').insert({
      requester_id: requesterId,
      target_user_id: targetUserId,
      cost_credits: COST,
      revealed_identity: target.email,
      revealed_at: new Date().toISOString(),
    });

    return { success: true, identity: target.email };
  }
}

// ============================================
// SINGLETON INSTANCES
// ============================================

let circleEngineInstance: CircleEngine | null = null;
let broadcastEngineInstance: BroadcastEngine | null = null;
let intelligenceEngineInstance: IntelligenceEngine | null = null;

export function getCircleEngine(db: Database): CircleEngine {
  if (!circleEngineInstance) {
    circleEngineInstance = new CircleEngine(db);
  }
  return circleEngineInstance;
}

export function getBroadcastEngine(db: Database): BroadcastEngine {
  if (!broadcastEngineInstance) {
    broadcastEngineInstance = new BroadcastEngine(db);
  }
  return broadcastEngineInstance;
}

export function getIntelligenceEngine(db: Database): IntelligenceEngine {
  if (!intelligenceEngineInstance) {
    intelligenceEngineInstance = new IntelligenceEngine(db);
  }
  return intelligenceEngineInstance;
}

export { BroadcastReply, IntelligenceRequest, FEE_CONSTANTS, TIME_CONSTANTS };
