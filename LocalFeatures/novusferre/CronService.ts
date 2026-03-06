/**
 * NOVUSFERRE - CRON SERVICE
 * Automated Distress Asset Management & Vaporization
 * 
 * "The Floor Watch & Shadow Lab Automation"
 */

import { 
  Asset, 
  CONSTANTS,
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
// DATABASE TYPES
// ============================================

interface Follower {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
}

interface VaporizationRecord {
  id: string;
  user_id: string;
  reason: 'floor_acquisition' | 'manual' | 'timeout';
  followers_deleted: number;
  messages_deleted: number;
  ownership_transferred_to: string;
  executed_by: 'cron' | 'admin';
  executed_at: string;
  notes: string | null;
}

// ============================================
// CRON SERVICE
// ============================================

export class CronService {
  private db: Database;
  private isRunning: boolean = false;
  private readonly LAB_ACCOUNT = CONSTANTS.BRIAN_LAB_ACCOUNT;
  private readonly FLOOR_PRICE = CONSTANTS.FLOOR_PRICE;
  private readonly RESET_THRESHOLD = CONSTANTS.RESET_THRESHOLD;
  private readonly ACQUISITION_HOURS = CONSTANTS.ACQUISITION_HOURS;

  constructor(db: Database) {
    this.db = db;
  }

  /**
   * MAIN: Floor Watch - Run hourly
   */
  async runFloorWatch(): Promise<{
    processed: number;
    clockStarted: number;
    acquisitions: number;
    resets: number;
    errors: string[];
  }> {
    if (this.isRunning) {
      return { processed: 0, clockStarted: 0, acquisitions: 0, resets: 0, errors: [] };
    }

    this.isRunning = true;
    const results = {
      processed: 0,
      clockStarted: 0,
      acquisitions: 0,
      resets: 0,
      errors: [] as string[],
    };

    try {
      // Fetch all assets
      const assets = await this.db.table('assets')
        .select('id', 'owner_id', 'creator_id', 'current_price', 'lab_timer_start');

      for (const asset of assets) {
        results.processed++;

        try {
          // Check reset condition ($8+)
          if (asset.current_price >= this.RESET_THRESHOLD) {
            if (asset.lab_timer_start) {
              // Reset the clock
              await this.resetAcquisitionClock(asset.id);
              results.resets++;
            }
            continue;
          }

          // Check floor condition ($5 or below)
          if (asset.current_price <= this.FLOOR_PRICE) {
            if (!asset.lab_timer_start) {
              // Start the 14-day clock
              await this.startAcquisitionClock(asset.id);
              results.clockStarted++;
            } else {
              // Check if 14 days have passed
              const hoursElapsed = this.calculateHoursElapsed(asset.lab_timer_start);
              if (hoursElapsed >= this.ACQUISITION_HOURS) {
                // Execute full vaporization
                await this.executeFullVaporization(asset);
                results.acquisitions++;
              }
            }
          }
        } catch (err: any) {
          results.errors.push(`Asset ${asset.id}: ${err.message}`);
        }
      }
    } finally {
      this.isRunning = false;
    }

    return results;
  }

  /**
   * Start Acquisition Clock (Floor Watch trigger)
   */
  private async startAcquisitionClock(assetId: string): Promise<void> {
    await this.db.table('assets')
      .where('id', assetId)
      .update({ lab_timer_start: new Date().toISOString() });

    console.log(`[FloorWatch] Clock started for asset: ${assetId}`);
  }

  /**
   * Reset Acquisition Clock ($8 Reset)
   */
  private async resetAcquisitionClock(assetId: string): Promise<void> {
    await this.db.table('assets')
      .where('id', assetId)
      .update({ lab_timer_start: null });

    console.log(`[FloorWatch] Clock reset for asset: ${assetId} (price > $8)`);
  }

  /**
   * EXECUTE FULL VAPORIZATION PROTOCOL
   * Deletes ALL followers, ALL messages, transfers ownership to BRIAN_LAB
   */
  private async executeFullVaporization(asset: Asset): Promise<void> {
    console.log(`[Vaporization] Executing full purge for asset: ${asset.id}`);

    try {
      // 1. DELETE ALL FOLLOWERS (both directions)
      const followersDeleted = await this.deleteAllFollowers(asset.owner_id);
      const followingDeleted = await this.deleteFollowing(asset.owner_id);
      
      // 2. DELETE ALL MESSAGES (sent and received, even "locked" ones)
      const messagesDeleted = await this.deleteAllMessages(asset.owner_id);
      
      // 3. DELETE BROADCASTS
      await this.deleteAllBroadcasts(asset.owner_id);
      
      // 4. DELETE CIRCLE MEMBERSHIPS
      await this.deleteCircleMemberships(asset.owner_id);
      
      // 5. DELETE BATTLE HISTORY
      await this.deleteBattleHistory(asset.owner_id);

      // 6. TRANSFER OWNERSHIP TO BRIAN'S LAB
      await this.db.table('assets')
        .where('id', asset.id)
        .update({
          owner_id: this.LAB_ACCOUNT,
          lab_timer_start: null,
          is_public: false,
          is_lab_owned: true,
          is_vaporized: true,
          status: USER_STATUS.PURGED,
          current_price: 0,
          last_price_update: new Date().toISOString(),
        });

      // 7. MOVE USER TO BACKSTAGE LOUNGE
      await this.db.table('users')
        .where('id', asset.owner_id)
        .update({
          is_backstage: true,
          status: USER_STATUS.BACKSTAGE,
          followers_count: 0,
          following_count: 0,
        });

      // 8. LOG TO BRIAN'S PRIVATE ADMIN LEDGER
      await this.logVaporization({
        id: crypto.randomUUID(),
        user_id: asset.owner_id,
        reason: 'floor_acquisition',
        followers_deleted: followersDeleted + followingDeleted,
        messages_deleted: messagesDeleted,
        ownership_transferred_to: this.LAB_ACCOUNT,
        executed_by: 'cron',
        executed_at: new Date().toISOString(),
        notes: `Full vaporization: ${followersDeleted + followingDeleted} followers, ${messagesDeleted} messages deleted`,
      });

      // 9. MUMBLE SATOSHI GHOST (announce purge)
      await this.announcePurgeExecution(asset.owner_id);

      console.log(`[Vaporization] Complete for asset: ${asset.id}`);
    } catch (err: any) {
      console.error(`[Vaporization] Failed for ${asset.id}: ${err.message}`);
      throw err;
    }
  }

  /**
   * Delete all followers where user is being followed
   */
  private async deleteAllFollowers(userId: string): Promise<number> {
    const followers = await this.db.table('followers')
      .where('following_id', userId)
      .select('id');

    for (const f of followers) {
      await this.db.table('followers').where('id', f.id).delete();
    }

    return followers.length;
  }

  /**
   * Delete all following records
   */
  private async deleteFollowing(userId: string): Promise<number> {
    const following = await this.db.table('followers')
      .where('follower_id', userId)
      .select('id');

    for (const f of following) {
      await this.db.table('followers').where('id', f.id).delete();
    }

    return following.length;
  }

  /**
   * Delete all messages (sent and received, including "locked")
   */
  private async deleteAllMessages(userId: string): Promise<number> {
    let deleted = 0;

    // Sent messages
    const sentMessages = await this.db.table('messages')
      .where('sender_id', userId)
      .select('id');

    for (const m of sentMessages) {
      await this.db.table('messages').where('id', m.id).delete();
      deleted++;
    }

    // Received messages
    const receivedMessages = await this.db.table('messages')
      .where('recipient_id', userId)
      .select('id');

    for (const m of receivedMessages) {
      await this.db.table('messages').where('id', m.id).delete();
      deleted++;
    }

    return deleted;
  }

  /**
   * Delete all broadcasts
   */
  private async deleteAllBroadcasts(userId: string): Promise<void> {
    const broadcasts = await this.db.table('broadcasts')
      .where('sender_id', userId)
      .select('id');

    for (const b of broadcasts) {
      await this.db.table('broadcasts').where('id', b.id).delete();
    }
  }

  /**
   * Delete circle memberships
   */
  private async deleteCircleMemberships(userId: string): Promise<void> {
    const memberships = await this.db.table('circle_memberships')
      .where('user_id', userId)
      .select('circle_id');

    for (const m of memberships) {
      // Update member count
      const circle = await this.db.table('circles').where('id', m.circle_id).first();
      if (circle) {
        await this.db.table('circles')
          .where('id', m.circle_id)
          .update({ member_count: Math.max(0, circle.member_count - 1) });
      }
      await this.db.table('circle_memberships').where('circle_id', m.circle_id).delete();
    }
  }

  /**
   * Delete battle history
   */
  private async deleteBattleHistory(userId: string): Promise<void> {
    // Remove from pending battles
    const battles = await this.db.table('photo_battles')
      .where('contender_1_id', userId)
      .orWhere('contender_2_id', userId)
      .select('id', 'status');

    for (const b of battles) {
      if (b.status === 'ACTIVE') {
        // Cancel active battles
        await this.db.table('photo_battles')
          .where('id', b.id)
          .update({ status: 'CANCELLED', ended_at: new Date().toISOString() });
      }
    }
  }

  /**
   * Log vaporization to Brian's ledger
   */
  private async logVaporization(record: VaporizationRecord): Promise<void> {
    await this.db.table('vaporization_records').insert({
      id: record.id,
      user_id: record.user_id,
      reason: record.reason,
      followers_deleted: record.followers_deleted,
      messages_deleted: record.messages_deleted,
      ownership_transferred_to: record.ownership_transferred_to,
      executed_by: record.executed_by,
      executed_at: record.executed_at,
      notes: record.notes,
    });
  }

  /**
   * Announce purge via SatoshiGhost
   */
  private async announcePurgeExecution(userId: string): Promise<void> {
    const user = await this.db.table('users').where('id', userId).first();
    const userName = user?.email?.split('@')[0] || 'Someone';

    await this.db.table('ghost_notifications').insert({
      id: crypto.randomUUID(),
      type: 'PURGE_EXECUTED',
      title: "👋 Bye Bye!",
      content: `${userName} has been moved to the Backstage Lounge. Out of sight, never forgotten!`,
      tone: 'cheeky',
      target_audience: 'all',
      is_public: true,
      created_at: new Date().toISOString(),
    });
  }

  /**
   * Calculate hours elapsed since timestamp
   */
  private calculateHoursElapsed(timestamp: string): number {
    const start = new Date(timestamp).getTime();
    const now = Date.now();
    return (now - start) / (1000 * 60 * 60);
  }

  /**
   * Get pending acquisitions (for Brian's dashboard)
   */
  async getPendingAcquisitions(): Promise<{
    atRisk: number;
    readyToSeize: number;
    recentlySeized: number;
  }> {
    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - this.ACQUISITION_HOURS * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Count at risk (clock started, < 14 days)
    const atRisk = await this.db.table('assets')
      .where('lab_timer_start', '!=', null)
      .where('lab_timer_start', '>', fourteenDaysAgo.toISOString())
      .count();

    // Count ready to seize (clock started, >= 14 days)
    const readyToSeize = await this.db.table('assets')
      .where('lab_timer_start', '!=', null)
      .where('lab_timer_start', '<=', fourteenDaysAgo.toISOString())
      .count();

    // Count recently seized
    const recentlySeized = await this.db.table('vaporization_records')
      .where('executed_at', '>', oneDayAgo.toISOString())
      .count();

    return { atRisk, readyToSeize, recentlySeized };
  }

  /**
   * Get dashboard summary for Brian
   */
  async getLabDashboard(): Promise<{
    totalSeized: number;
    pendingClock: number;
    todaySeized: number;
    totalFollowersDeleted: number;
    totalMessagesDeleted: number;
  }> {
    const totalSeized = await this.db.table('vaporization_records').count();
    const pendingClock = await this.db.table('assets')
      .where('lab_timer_start', '!=', null)
      .count();

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayRecords = await this.db.table('vaporization_records')
      .where('executed_at', '>', todayStart.toISOString())
      .select('*');

    let totalFollowersDeleted = 0;
    let totalMessagesDeleted = 0;

    for (const record of todayRecords) {
      totalFollowersDeleted += record.followers_deleted;
      totalMessagesDeleted += record.messages_deleted;
    }

    return {
      totalSeized,
      pendingClock,
      todaySeized: todayRecords.length,
      totalFollowersDeleted,
      totalMessagesDeleted,
    };
  }
}

// ============================================
// CONSTANTS EXPORT
// ============================================

export const FLOOR_PRICE = CONSTANTS.FLOOR_PRICE;
export const RESET_THRESHOLD = CONSTANTS.RESET_THRESHOLD;
export const ACQUISITION_HOURS = CONSTANTS.ACQUISITION_HOURS;
export const BRIAN_LAB_ACCOUNT = CONSTANTS.BRIAN_LAB_ACCOUNT;
