/**
 * GLOBAL ASSETS - UNIVERSAL JACKPOT SYNC
 * UTC-Based Daily Reset & Multi-Loop Verification
 * 
 * "The Timekeeper's Ledger"
 * 
 * Features:
 * - UTC 00:00 reset logic
 * - Multi-loop verification (Wheel → Email → Dashboard)
 * - Jackpot Receipt system with snapshots
 * - SatoshiGhost timekeeper messages
 */

// ============================================
// TYPES
// ============================================

export interface DailyResetState {
  userId: string;
  lastResetAt: string;      // UTC timestamp
  nextResetAt: string;       // UTC timestamp
  entriesToday: number;
  spinsToday: number;
  isEligible: boolean;
}

export interface JackpotReceipt {
  id: string;
  userId: string;
  sourceSite: 'VEXTORGRID' | 'CIVITASRESERVE';
  targetSite: 'NOVUSFERRE' | 'CRYPTOBOTCRAZE';
  jackpotValue: number;
  megaJackpotStanding: number;
  dailyStashStanding: number;
  timestamp: string;         // UTC
  txHash?: string;
}

export interface WheelSpinRecord {
  id: string;
  userId: string;
  siteId: string;           // AOEM, DoughDiamonds
  spinResult: number;
  timestamp: string;         // UTC
  verified: boolean;
}

export interface ActivityLogEntry {
  id: string;
  userId: string;
  type: 'WHEEL_SPIN' | 'CODE_GENERATED' | 'JACKPOT_RECEIPT' | 'ENTRY_VERIFIED';
  site: string;
  details: string;
  jackpotValue: number;
  timestamp: string;         // UTC
}

export interface CountdownTimer {
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  nextResetTime: string;    // UTC
}

// ============================================
// CONSTANTS
// ============================================

export const SYNC_CONSTANTS = {
  UTC_RESET_HOUR: 0,         // 00:00 UTC
  MAX_DAILY_ENTRIES: 1,
  MAX_DAILY_SPINS: 1,
  CACHE_TTL_SECONDS: 60,
} as const;

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
// UNIVERSAL JACKPOT SYNC ENGINE
// ============================================

export class UniversalJackpotSync {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  // ============================================
  // UTC RESET LOGIC
  // ============================================

  /**
   * Get countdown to next UTC reset
   */
  getCountdown(): CountdownTimer {
    const now = new Date();
    const utcNow = new Date(now.toISOString());
    
    // Calculate next reset (00:00 UTC tomorrow)
    const nextReset = new Date(utcNow);
    nextReset.setUTCHours(0, 0, 0, 0);
    nextReset.setUTCDate(nextReset.getUTCDate() + 1);

    const diffMs = nextReset.getTime() - utcNow.getTime();
    
    if (diffMs <= 0) {
      return {
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true,
        nextResetTime: nextReset.toISOString(),
      };
    }

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    return {
      hours,
      minutes,
      seconds,
      isExpired: false,
      nextResetTime: nextReset.toISOString(),
    };
  }

  /**
   * Format countdown for display
   */
  formatCountdown(timer: CountdownTimer): string {
    if (timer.isExpired) {
      return 'Resetting now...';
    }
    
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(timer.hours)}:${pad(timer.minutes)}:${pad(timer.seconds)} (UTC)`;
  }

  /**
   * Check if user is eligible for daily actions
   */
  async checkEligibility(userId: string): Promise<DailyResetState> {
    const today = this.getUTCDateString();
    const now = this.getUTCTimestamp();
    
    // Get user's last reset state
    const userState = await this.db.table('daily_reset_state')
      .where('user_id', userId)
      .first();

    // Calculate next reset
    const nextReset = new Date(now);
    nextReset.setUTCHours(0, 0, 0, 0);
    nextReset.setUTCDate(nextReset.getUTCDate() + 1);

    // Check if reset needed
    if (userState?.last_reset_date !== today) {
      // Reset for new day
      await this.db.table('daily_reset_state')
        .where('user_id', userId)
        .upsert({
          user_id: userId,
          last_reset_date: today,
          last_reset_at: now,
          next_reset_at: nextReset.toISOString(),
          entries_today: 0,
          spins_today: 0,
        });
    }

    return {
      userId,
      lastResetAt: userState?.last_reset_at || now,
      nextResetAt: nextReset.toISOString(),
      entriesToday: userState?.entries_today || 0,
      spinsToday: userState?.spins_today || 0,
      isEligible: (userState?.entries_today || 0) < SYNC_CONSTANTS.MAX_DAILY_ENTRIES,
    };
  }

  /**
   * Reset daily counters (called at 00:00 UTC)
   */
  async resetDailyCounters(): Promise<{ reset: number }> {
    const today = this.getUTCDateString();
    
    const result = await this.db.table('daily_reset_state')
      .where('last_reset_date', '<', today)
      .update({
        entries_today: 0,
        spins_today: 0,
        last_reset_date: today,
        last_reset_at: this.getUTCTimestamp(),
      });

    return { reset: result };
  }

  // ============================================
  // MULTI-ENTRY VERIFICATION (VextorGrid Hub)
  // ============================================

  /**
   * Process claim with full verification
   */
  async processClaim(
    userId: string,
    sourceSite: 'VEXTORGRID' | 'CIVITASRESERVE',
    targetSite: 'NOVUSFERRE' | 'CRYPTOBOTCRAZE',
    wheelSpinSiteId?: string
  ): Promise<{
    success: boolean;
    code?: string;
    error?: string;
    receipt?: JackpotReceipt;
  }> {
    try {
      // Step A: Verify eligibility
      const eligibility = await this.checkEligibility(userId);
      
      if (!eligibility.isEligible) {
        return { 
          success: false, 
          error: 'Daily limit reached. Reset at 00:00 UTC.' 
        };
      }

      // Step B: Verify wheel spin if required
      if (wheelSpinSiteId) {
        const spinVerified = await this.verifyWheelSpin(userId, wheelSpinSiteId);
        if (!spinVerified) {
          return { 
            success: false, 
            error: 'Wheel spin verification required from ' + wheelSpinSiteId 
          };
        }
      }

      // Step C: Generate code via AmoeBridge
      const codeResult = await this.generateAndRecordCode(userId, sourceSite, targetSite);
      
      if (!codeResult.success) {
        return { success: false, error: codeResult.error };
      }

      // Step D: Update User Status Dashboard
      await this.updateDashboard(userId, {
        lastAction: 'CODE_GENERATED',
        site: sourceSite,
        timestamp: this.getUTCTimestamp(),
      });

      // Step E: Create receipt
      const receipt = await this.createReceipt(userId, sourceSite, targetSite, codeResult.code!);

      // Update daily counters
      await this.incrementDailyCounter(userId, 'entries');

      return { 
        success: true, 
        code: codeResult.code,
        receipt,
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Verify wheel spin from AOEM/DoughDiamonds
   */
  private async verifyWheelSpin(userId: string, siteId: string): Promise<boolean> {
    const today = this.getUTCDateString();
    
    const spin = await this.db.table('wheel_spins')
      .where('user_id', userId)
      .where('site_id', siteId)
      .where('created_at', 'like', `${today}%`)
      .first();

    return !!spin && !spin.verified;
  }

  /**
   * Generate and record code
   */
  private async generateAndRecordCode(
    userId: string,
    sourceSite: string,
    targetSite: string
  ): Promise<{ success: boolean; code?: string; error?: string }> {
    const code = this.generateUTCCode();
    
    await this.db.table('amoe_codes').insert({
      id: crypto.randomUUID(),
      code: code,
      user_id: userId,
      source_site: sourceSite,
      target_site: targetSite,
      status: 'PENDING',
      created_at: this.getUTCTimestamp(),
      expires_at: this.getExpiryTimestamp(24),
    });

    return { success: true, code };
  }

  /**
   * Create jackpot receipt
   */
  private async createReceipt(
    userId: string,
    sourceSite: string,
    targetSite: string,
    code: string
  ): Promise<JackpotReceipt> {
    // Get current jackpot standings
    const megaJackpot = await this.getJackpotStanding('mega');
    const dailyStash = await this.getJackpotStanding('daily');

    const receipt: JackpotReceipt = {
      id: crypto.randomUUID(),
      userId,
      sourceSite,
      targetSite,
      jackpotValue: 4999.99,
      megaJackpotStanding: megaJackpot,
      dailyStashStanding: dailyStash,
      timestamp: this.getUTCTimestamp(),
      txHash: crypto.randomUUID(), // Simulation
    };

    await this.db.table('jackpot_receipts').insert({
      id: receipt.id,
      user_id: receipt.userId,
      source_site: receipt.sourceSite,
      target_site: receipt.targetSite,
      jackpot_value: receipt.jackpotValue,
      mega_standing: receipt.megaJackpotStanding,
      daily_standing: receipt.dailyStashStanding,
      timestamp: receipt.timestamp,
      tx_hash: receipt.txHash,
    });

    return receipt;
  }

  // ============================================
  // ACTIVITY LOG & RECEIPT DISPLAY
  // ============================================

  /**
   * Get user's activity log
   */
  async getActivityLog(userId: string, limit: number = 20): Promise<ActivityLogEntry[]> {
    return await this.db.table('activity_log')
      .where('user_id', userId)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .select('*');
  }

  /**
   * Format activity for display
   */
  formatActivityEntry(entry: ActivityLogEntry): string {
    const timestamp = this.formatUTCTimestamp(entry.timestamp);
    
    switch (entry.type) {
      case 'WHEEL_SPIN':
        return `🎰 Wheel Spin: ${entry.details} | ${timestamp} UTC`;
      case 'CODE_GENERATED':
        return `🔑 Code Generated: ${entry.site} | ${timestamp} UTC`;
      case 'JACKPOT_RECEIPT':
        return `✓ Entry Verified: $${entry.jackpotValue.toFixed(2)} | ${timestamp} UTC`;
      case 'ENTRY_VERIFIED':
        return `💰 ${entry.site} Standing: $${entry.jackpotValue.toFixed(2)} | ${timestamp} UTC`;
      default:
        return `${entry.type}: ${entry.details}`;
    }
  }

  /**
   * Get formatted dashboard data
   */
  async getDashboardData(userId: string): Promise<{
    countdown: string;
    isEligible: boolean;
    todayEntries: number;
    todaySpins: number;
    megaJackpot: number;
    dailyStash: number;
    recentActivity: ActivityLogEntry[];
  }> {
    const countdown = this.formatCountdown(this.getCountdown());
    const eligibility = await this.checkEligibility(userId);
    const megaJackpot = await this.getJackpotStanding('mega');
    const dailyStash = await this.getJackpotStanding('daily');
    const recentActivity = await this.getActivityLog(userId, 5);

    return {
      countdown,
      isEligible: eligibility.isEligible,
      todayEntries: eligibility.entriesToday,
      todaySpins: eligibility.spinsToday,
      megaJackpot,
      dailyStash,
      recentActivity,
    };
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private getUTCDateString(): string {
    return new Date().toISOString().split('T')[0];
  }

  private getUTCTimestamp(): string {
    return new Date().toISOString();
  }

  private getExpiryTimestamp(hours: number): string {
    return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
  }

  private formatUTCTimestamp(timestamp: string): string {
    return new Date(timestamp).toISOString().replace('T', ' ').substring(0, 19);
  }

  private generateUTCCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'VG-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  private async getJackpotStanding(type: 'mega' | 'daily'): Promise<number> {
    const pool = await this.db.table('jackpot_pool')
      .orderBy('id', 'desc')
      .first();
    
    return pool?.current_pool || 0;
  }

  private async incrementDailyCounter(userId: string, type: 'entries' | 'spins'): Promise<void> {
    const today = this.getUTCDateString();
    const field = type === 'entries' ? 'entries_today' : 'spins_today';
    
    await this.db.table('daily_reset_state')
      .where('user_id', userId)
      .where('last_reset_date', today)
      .update({
        [field]: this.db.table('daily_reset_state').select(field).where('user_id', userId).first()[field] + 1,
      });
  }

  private async updateDashboard(userId: string, data: any): Promise<void> {
    await this.db.table('user_dashboard_status')
      .where('user_id', userId)
      .upsert({
        user_id: userId,
        ...data,
        updated_at: this.getUTCTimestamp(),
      });
  }
}

// ============================================
// SATOSHI GHOST TIMEKEEPER
// ============================================

export class SatoshiTimekeeper {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  /**
   * Get timekeeper gossip message
   */
  getTimekeeperMessage(hoursUntilReset: number): string {
    if (hoursUntilReset <= 0) {
      return `SatoshiGhost: The clock just struck midnight in UTC! The wheels are fresh and the codes are waiting. Who's first? 🕛`;
    }
    
    if (hoursUntilReset <= 2) {
      return `SatoshiGhost: Only ${hoursUntilReset} hours left until reset! Better hurry if you want that daily entry! ⏰`;
    }
    
    if (hoursUntilReset <= 6) {
      return `SatoshiGhost: The sun is setting in the States, but the Empire's clock just hit 00:00. The wheels are fresh and the codes are waiting. Who's first? 🕒`;
    }
    
    if (hoursUntilReset <= 12) {
      return `SatoshiGhost: Halfway through the day! Still time to spin, claim, and play. Don't let UTC pass you by! ⏳`;
    }
    
    return `SatoshiGhost: Fresh start! The daily wheel and entries are ready. Who wants to be the first player of the day? 🎰`;
  }

  /**
   * Get streak gossip message
   */
  async getStreakGossip(userId: string): Promise<string | null> {
    const today = new Date().toISOString().split('T')[0];
    
    const streak = await this.db.table('activity_log')
      .where('user_id', userId)
      .where('created_at', 'like', `${today}%`)
      .count();

    if (streak >= 7) {
      return `GOSSIP: Someone's been playing both loops for 7 days straight. That's a lot of tickets in the hat. 🎩`;
    }

    return null;
  }

  /**
   * Announce reset
   */
  async announceReset(): Promise<void> {
    await this.db.table('ghost_notifications').insert({
      id: crypto.randomUUID(),
      type: 'UTC_RESET',
      title: '🕛 Daily Reset',
      content: this.getTimekeeperMessage(0),
      tone: 'timekeeper',
      target_audience: 'all',
      is_public: true,
      created_at: new Date().toISOString(),
    });
  }
}

// ============================================
// SINGLETON
// ============================================

let syncInstance: UniversalJackpotSync | null = null;
let timekeeperInstance: SatoshiTimekeeper | null = null;

export function getUniversalJackpotSync(db: Database): UniversalJackpotSync {
  if (!syncInstance) {
    syncInstance = new UniversalJackpotSync(db);
  }
  return syncInstance;
}

export function getSatoshiTimekeeper(db: Database): SatoshiTimekeeper {
  if (!timekeeperInstance) {
    timekeeperInstance = new SatoshiTimekeeper(db);
  }
  return timekeeperInstance;
}

export { DailyResetState, JackpotReceipt, ActivityLogEntry, CountdownTimer };
