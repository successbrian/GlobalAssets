/**
 * GLOBAL ASSETS - AMOEBRIDGE
 * Cross-Site Traffic Bridge: VextorGrid ↔ Novusferre
 * 
 * "The Viral Bridge"
 * 
 * Features:
 * - VG-XXXXXX code format
 * - $4,999.99 jackpot cap with overflow handling
 * - Central amoe_ledger table
 */

// ============================================
// TYPES
// ============================================

export enum BridgeCodeStatus {
  PENDING = 'PENDING',
  ENTERED = 'ENTERED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

export interface AmoeCodeRecord {
  id: string;
  code: string;              // Format: VG-XXXXXX
  user_id: string;           // VextorGrid user
  source_site: string;
  target_site: string;
  status: BridgeCodeStatus;
  jackpot_value: number;
  novusferre_user_id?: string;
  created_at: string;
  expires_at: string;
  entered_at?: string;
}

export interface JackpotEntryRecord {
  id: string;
  user_id: string;          // Novusferre user
  code_id: string;
  jackpot_pool: number;
  entries_count: number;
  created_at: string;
}

export interface VextorLedgerRecord {
  id: string;
  user_id: string;
  type: string;
  target: string;
  status: BridgeCodeStatus;
  jackpot_value: number;
  details: string;
  created_at: string;
}

export interface JackpotPoolState {
  current_pool: number;
  capped_at: number;
  overflow_diverted: number;
  last_updated: string;
}

// ============================================
// CONSTANTS
// ============================================

export const BRIDGE_CONSTANTS = {
  CODE_PREFIX: 'VG-',
  CODE_LENGTH: 8,           // VG-XXXXXX = 8 chars
  CODE_EXPIRY_HOURS: 24,
  JACKPOT_CAP: 4999.99,
  DAILY_ENTRY_LIMIT: 1,
  OVERFLOW_TARGET: 'burn_pool', // or 'seed_pool'
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
// AMOEBRIDGE ENGINE
// ============================================

export class AmoeBridgeEngine {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  // ============================================
  // CODE GENERATION (VextorGrid)
  // ============================================

  /**
   * Generate unique VG-XXXXXX code
   */
  async generateCode(userId: string): Promise<{
    success: boolean;
    code?: string;
    error?: string;
  }> {
    try {
      // Check for existing pending code
      const existing = await this.db.table('amoe_codes')
        .where('user_id', userId)
        .where('status', BridgeCodeStatus.PENDING)
        .first();

      if (existing) {
        return { success: true, code: existing.code };
      }

      // Generate unique VG-XXXXXX code
      const generatedCode = await this.findUniqueVGCode();
      if (!generatedCode) {
        return { success: false, error: 'Failed to generate unique code' };
      }

      // Create code record
      await this.db.table('amoe_codes').insert({
        id: crypto.randomUUID(),
        code: generatedCode,
        user_id: userId,
        source_site: 'VEXTORGRID',
        target_site: 'NOVUSFERRE',
        status: BridgeCodeStatus.PENDING,
        jackpot_value: BRIDGE_CONSTANTS.JACKPOT_CAP,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + BRIDGE_CONSTANTS.CODE_EXPIRY_HOURS * 60 * 60 * 1000).toISOString(),
      });

      // Record in VextorGrid ledger
      await this.db.table('vextor_ledger').insert({
        id: crypto.randomUUID(),
        user_id: userId,
        type: 'AMOE_CODE_GEN',
        target: 'NOVUSFERRE',
        status: BridgeCodeStatus.PENDING,
        jackpot_value: BRIDGE_CONSTANTS.JACKPOT_CAP,
        details: `Code: ${generatedCode}`,
        created_at: new Date().toISOString(),
      });

      return { success: true, code: generatedCode };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Find unique VG-XXXXXX code
   */
  private async findUniqueVGCode(): Promise<string | null> {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    
    for (let attempt = 0; attempt < 10; attempt++) {
      let code = BRIDGE_CONSTANTS.CODE_PREFIX;
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const existing = await this.db.table('amoe_codes')
        .where('code', code)
        .first();

      if (!existing) {
        return code;
      }
    }
    
    return null;
  }

  // ============================================
  // CODE REDEMPTION (Novusferre)
  // ============================================

  /**
   * Redeem code for jackpot entry
   */
  async redeemCode(
    code: string, 
    novusferreUserId: string,
    captchaToken?: string
  ): Promise<{
    success: boolean;
    entry?: JackpotEntryRecord;
    error?: string;
  }> {
    try {
      // 1. Validate code format
      const normalizedCode = code.toUpperCase();
      if (!this.validateVGCodeFormat(normalizedCode)) {
        return { success: false, error: 'Invalid code format' };
      }

      // 2. Check code validity
      const amoeCode = await this.db.table('amoe_codes')
        .where('code', normalizedCode)
        .first();

      if (!amoeCode) {
        return { success: false, error: 'Invalid code' };
      }

      if (amoeCode.status === BridgeCodeStatus.ENTERED) {
        return { success: false, error: 'Code already used' };
      }

      if (amoeCode.status === BridgeCodeStatus.EXPIRED) {
        return { success: false, error: 'Code has expired' };
      }

      // 3. Check expiry
      if (new Date(amoeCode.expires_at) < new Date()) {
        await this.db.table('amoe_codes')
          .where('id', amoeCode.id)
          .update({ status: BridgeCodeStatus.EXPIRED });
        return { success: false, error: 'Code has expired' };
      }

      // 4. Verify captcha
      if (!captchaToken) {
        return { success: false, error: 'Captcha verification required' };
      }

      // 5. Check daily entry limit
      const today = new Date().toISOString().split('T')[0];
      const todayEntry = await this.db.table('jackpot_entries')
        .where('user_id', novusferreUserId)
        .where('created_at', 'like', `${today}%`)
        .first();

      if (todayEntry) {
        return { success: false, error: 'Daily entry limit reached' };
      }

      // 6. Process redemption with jackpot cap logic
      const poolState = await this.getJackpotPoolState();
      const entryValue = this.calculateEntryValue(poolState);

      // Update code status
      await this.db.table('amoe_codes')
        .where('id', amoeCode.id)
        .update({
          status: BridgeCodeStatus.ENTERED,
          novusferre_user_id: novusferreUserId,
          entered_at: new Date().toISOString(),
        });

      // Create jackpot entry
      const entry: JackpotEntryRecord = {
        id: crypto.randomUUID(),
        user_id: novusferreUserId,
        code_id: amoeCode.id,
        jackpot_pool: entryValue,
        entries_count: 1,
        created_at: new Date().toISOString(),
      };

      await this.db.table('jackpot_entries').insert({
        id: entry.id,
        user_id: entry.user_id,
        code_id: entry.code_id,
        jackpot_pool: entry.jackpot_pool,
        entries_count: entry.entries_count,
        created_at: entry.created_at,
      });

      // Update jackpot pool
      await this.updateJackpotPool(entryValue);

      // Update VextorGrid ledger
      await this.db.table('vextor_ledger')
        .where('user_id', amoeCode.user_id)
        .where('details', 'like', `%${normalizedCode}%`)
        .update({
          status: BridgeCodeStatus.ENTERED,
          jackpot_value: BRIDGE_CONSTANTS.JACKPOT_CAP,
          updated_at: new Date().toISOString(),
        });

      return { success: true, entry };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // JACKPOOL CAP LOGIC
  // ============================================

  /**
   * Get current jackpot pool state
   */
  async getJackpotPoolState(): Promise<JackpotPoolState> {
    const pool = await this.db.table('jackpot_pool')
      .orderBy('last_updated', 'desc')
      .first();

    if (!pool) {
      return {
        current_pool: 0,
        capped_at: BRIDGE_CONSTANTS.JACKPOT_CAP,
        overflow_diverted: 0,
        last_updated: new Date().toISOString(),
      };
    }

    return {
      current_pool: pool.current_pool || 0,
      capped_at: BRIDGE_CONSTANTS.JACKPOT_CAP,
      overflow_diverted: pool.overflow_diverted || 0,
      last_updated: pool.last_updated,
    };
  }

  /**
   * Calculate entry value (respects cap)
   */
  private calculateEntryValue(poolState: JackpotPoolState): number {
    const remaining = BRIDGE_CONSTANTS.JACKPOT_CAP - poolState.current_pool;
    
    if (remaining <= 0) {
      return 0; // Pool is full
    }
    
    return Math.min(BRIDGE_CONSTANTS.JACKPOT_CAP, remaining);
  }

  /**
   * Update jackpot pool with cap enforcement
   */
  private async updateJackpotPool(entryValue: number): Promise<void> {
    const current = await this.db.table('jackpot_pool')
      .orderBy('id', 'desc')
      .first();

    let newPool = (current?.current_pool || 0) + entryValue;
    let overflow = 0;

    // Cap at JACKPOT_CAP, divert overflow
    if (newPool > BRIDGE_CONSTANTS.JACKPOT_CAP) {
      overflow = newPool - BRIDGE_CONSTANTS.JACKPOT_CAP;
      newPool = BRIDGE_CONSTANTS.JACKPOT_CAP;
    }

    // Update or insert pool record
    if (current) {
      await this.db.table('jackpot_pool')
        .where('id', current.id)
        .update({
          current_pool: newPool,
          overflow_diverted: (current.overflow_diverted || 0) + overflow,
          last_updated: new Date().toISOString(),
        });
    } else {
      await this.db.table('jackpot_pool').insert({
        current_pool: newPool,
        capped_at: BRIDGE_CONSTANTS.JACKPOT_CAP,
        overflow_diverted: overflow,
        last_updated: new Date().toISOString(),
      });
    }

    // If overflow, divert to burn/seed pool
    if (overflow > 0) {
      await this.db.table('pool_overflow').insert({
        id: crypto.randomUUID(),
        source: 'jackpot_pool',
        amount: overflow,
        target: BRIDGE_CONSTANTS.OVERFLOW_TARGET,
        created_at: new Date().toISOString(),
      });
    }
  }

  // ============================================
  // UTILITIES
  // ============================================

  /**
   * Validate VG-XXXXXX format
   */
  validateVGCodeFormat(code: string): boolean {
    const regex = /^VG-[A-Z0-9]{6}$/;
    return regex.test(code.toUpperCase());
  }

  /**
   * Get user's pending code
   */
  async getPendingCode(userId: string): Promise<AmoeCodeRecord | null> {
    return await this.db.table('amoe_codes')
      .where('user_id', userId)
      .where('status', BridgeCodeStatus.PENDING)
      .first();
  }

  /**
   * Get jackpot stats
   */
  async getJackpotStats(): Promise<{
    currentPool: number;
    jackpotCap: number;
    totalEntries: number;
    pendingCodes: number;
    redeemedToday: number;
    overflowDiverted: number;
  }> {
    const today = new Date().toISOString().split('T')[0];
    const pool = await this.db.table('jackpot_pool').orderBy('id', 'desc').first();

    return {
      currentPool: pool?.current_pool || 0,
      jackpotCap: BRIDGE_CONSTANTS.JACKPOT_CAP,
      totalEntries: await this.db.table('jackpot_entries').count(),
      pendingCodes: await this.db.table('amoe_codes')
        .where('status', BridgeCodeStatus.PENDING)
        .count(),
      redeemedToday: await this.db.table('amoe_codes')
        .where('status', BridgeCodeStatus.ENTERED)
        .where('entered_at', 'like', `${today}%`)
        .count(),
      overflowDiverted: pool?.overflow_diverted || 0,
    };
  }

  /**
   * Reset jackpot pool (admin function)
   */
  async resetJackpotPool(): Promise<void> {
    await this.db.table('jackpot_pool').insert({
      current_pool: 0,
      capped_at: BRIDGE_CONSTANTS.JACKPOT_CAP,
      overflow_diverted: 0,
      last_updated: new Date().toISOString(),
      reset_by: 'admin',
    });
  }
}

// ============================================
// SINGLETON
// ============================================

let amoeBridgeInstance: AmoeBridgeEngine | null = null;

export function getAmoeBridge(db: Database): AmoeBridgeEngine {
  if (!amoeBridgeInstance) {
    amoeBridgeInstance = new AmoeBridgeEngine(db);
  }
  return amoeBridgeInstance;
}
