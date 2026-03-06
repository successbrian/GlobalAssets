/**
 * NOVUSFERRE - SHADOW LAB
 * Vaporization Protocol & Intelligence Paywall
 * 
 * "Behind the curtain, the Empire never sleeps."
 */

import { 
  Asset, 
  User, 
  CONSTANTS,
  BackstageEntry,
  VaporizationRecord,
  USER_STATUS,
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

interface ShadowDashboardData {
  total_seized: number;
  pending_acquisitions: number;
  backstage_count: number;
  recently_seized: VaporizationRecord[];
}

interface IntelligenceRequest {
  requester_id: string;
  target_user_id: string;
  cost_credits: number;
  revealed_identity: string | null;
  revealed_at: string | null;
}

interface UserRelationship {
  follower_id: string;
  following_id: string;
  created_at: string;
}

// ============================================
// VAPORIZATION ENGINE
// ============================================

export class VaporizationEngine {
  private db: Database;
  private readonly LAB_ACCOUNT = CONSTANTS.BRIAN_LAB_ACCOUNT;

  constructor(db: Database) {
    this.db = db;
  }

  /**
   * Execute full vaporization protocol
   */
  async executeAcquisition(asset: Asset, reason: 'floor_acquisition' | 'manual' | 'timeout'): Promise<VaporizationRecord> {
    const followersDeleted = await this.deleteAllFollowers(asset.owner_id);
    const messagesDeleted = await this.deleteAllMessages(asset.owner_id);
    
    // Transfer ownership to Brian's Lab
    await this.db.table('assets')
      .where('id', asset.id)
      .update({
        owner_id: this.LAB_ACCOUNT,
        is_lab_owned: true,
        is_public: false,
        is_vaporized: true,
        status: USER_STATUS.PURGED,
        current_price: 0,
        last_price_update: new Date().toISOString(),
      });

    // Move creator to Backstage Lounge
    await this.db.table('users')
      .where('id', asset.owner_id)
      .update({
        is_backstage: true,
        status: USER_STATUS.BACKSTAGE,
        followers_count: 0,
        following_count: 0,
      });

    // Log the acquisition
    const record: VaporizationRecord = {
      id: crypto.randomUUID(),
      user_id: asset.owner_id,
      reason: reason,
      followers_deleted: followersDeleted,
      messages_deleted: messagesDeleted,
      ownership_transferred_to: this.LAB_ACCOUNT,
      executed_by: 'cron',
      executed_at: new Date().toISOString(),
      notes: `Acquired via ${reason}`,
    };

    await this.db.table('vaporization_records').insert(record);

    return record;
  }

  /**
   * Delete all followers for a user
   */
  private async deleteAllFollowers(userId: string): Promise<number> {
    const followers = await this.db.table('followers')
      .where('follower_id', userId)
      .select('id');

    for (const f of followers) {
      await this.db.table('followers').where('id', f.id).delete();
    }

    return followers.length;
  }

  /**
   * Delete all messages for a user (including locked)
   */
  private async deleteAllMessages(userId: string): Promise<number> {
    const sentMessages = await this.db.table('messages')
      .where('sender_id', userId)
      .select('id');

    const receivedMessages = await this.db.table('messages')
      .where('recipient_id', userId)
      .select('id');

    for (const m of sentMessages) {
      await this.db.table('messages').where('id', m.id).delete();
    }

    for (const m of receivedMessages) {
      await this.db.table('messages').where('id', m.id).delete();
    }

    return sentMessages.length + receivedMessages.length;
  }

  /**
   * Manual purge by admin
   */
  async manualPurge(userId: string, adminId: string, reason: string): Promise<VaporizationRecord> {
    const asset = await this.db.table('assets').where('owner_id', userId).first();
    if (!asset) {
      throw new Error('No asset found for user');
    }

    asset.is_vaporized = true;
    return this.executeAcquisition(asset, 'manual');
  }

  /**
   * Release from Backstage Lounge
   */
  async releaseFromBackstage(userId: string): Promise<void> {
    await this.db.table('users')
      .where('id', userId)
      .update({
        is_backstage: false,
        status: USER_STATUS.ACTIVE,
      });
  }
}

// ============================================
// SHADOW DASHBOARD ENGINE
// ============================================

export class ShadowDashboardEngine {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  /**
   * Get lab dashboard data
   */
  async getDashboard(): Promise<ShadowDashboardData> {
    const totalSeized = await this.db.table('vaporization_records').count();
    const pendingAcquisitions = await this.db.table('assets')
      .where('is_lab_owned', true)
      .count();
    const backstageCount = await this.db.table('users')
      .where('is_backstage', true)
      .count();
    const recentlySeized = await this.db.table('vaporization_records')
      .orderBy('executed_at', 'desc')
      .limit(10)
      .select('*');

    return {
      total_seized: totalSeized,
      pending_acquisitions: pendingAcquisitions,
      backstage_count: backstageCount,
      recently_seized: recentlySeized,
    };
  }

  /**
   * Get users approaching purge (48 hours warning)
   */
  async getPurgeWarnings(): Promise<any[]> {
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    
    return await this.db.table('assets')
      .where('lab_timer_start', '!=', null)
      .where('lab_timer_start', '>', fortyEightHoursAgo)
      .select('*');
  }
}

// ============================================
// INTELLIGENCE PAYWALL ENGINE
// ============================================

export class IntelligencePaywallEngine {
  private db: Database;
  private readonly REVEAL_COST = CONSTANTS.IDENTITY_REVEAL_COST;

  constructor(db: Database) {
    this.db = db;
  }

  /**
   * Request to reveal owner identity
   */
  async requestIdentityReveal(requesterId: string, assetId: string): Promise<{
    success: boolean;
    cost: number;
    error?: string;
    revealed_identity?: string;
  }> {
    const wallet = await this.db.table('wallets').where('user_id', requesterId).first();
    if (!wallet || wallet.balance_credits < this.REVEAL_COST) {
      return { 
        success: false, 
        cost: this.REVEAL_COST, 
        error: `Insufficient credits. Cost: ${this.REVEAL_COST} Credits` 
      };
    }

    const asset = await this.db.table('assets').where('id', assetId).first();
    if (!asset) {
      return { success: false, cost: this.REVEAL_COST, error: 'Asset not found' };
    }

    if (asset.is_lab_owned) {
      return { success: false, cost: this.REVEAL_COST, error: 'Lab-owned assets cannot be revealed' };
    }

    // Deduct credits
    await this.db.table('wallets')
      .where('user_id', requesterId)
      .update({ balance_credits: wallet.balance_credits - this.REVEAL_COST });

    // Log the intelligence request
    const user = await this.db.table('users').where('id', asset.owner_id).first();
    const identity = user ? `${user.email}` : 'Anonymous';

    await this.db.table('intelligence_requests').insert({
      requester_id: requesterId,
      target_user_id: asset.owner_id,
      asset_id: assetId,
      cost_credits: this.REVEAL_COST,
      revealed_identity: identity,
      revealed_at: new Date().toISOString(),
    });

    return {
      success: true,
      cost: this.REVEAL_COST,
      revealed_identity: identity,
    };
  }

  /**
   * Check if identity is already purchased
   */
  async checkExistingPurchase(requesterId: string, assetId: string): Promise<{
    already_purchased: boolean;
    revealed_identity?: string;
  }> {
    const existing = await this.db.table('intelligence_requests')
      .where('requester_id', requesterId)
      .where('asset_id', assetId)
      .first();

    return {
      already_purchased: !!existing,
      revealed_identity: existing?.revealed_identity,
    };
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

let vaporizationEngineInstance: VaporizationEngine | null = null;
let shadowDashboardEngineInstance: ShadowDashboardEngine | null = null;
let intelligencePaywallEngineInstance: IntelligencePaywallEngine | null = null;

export function getVaporizationEngine(db: Database): VaporizationEngine {
  if (!vaporizationEngineInstance) {
    vaporizationEngineInstance = new VaporizationEngine(db);
  }
  return vaporizationEngineInstance;
}

export function getShadowDashboardEngine(db: Database): ShadowDashboardEngine {
  if (!shadowDashboardEngineInstance) {
    shadowDashboardEngineInstance = new ShadowDashboardEngine(db);
  }
  return shadowDashboardEngineInstance;
}

export function getIntelligencePaywallEngine(db: Database): IntelligencePaywallEngine {
  if (!intelligencePaywallEngineInstance) {
    intelligencePaywallEngineInstance = new IntelligencePaywallEngine(db);
  }
  return intelligencePaywallEngineInstance;
}

export { ShadowDashboardData, IntelligenceRequest, UserRelationship };
