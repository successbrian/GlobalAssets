/**
 * NOVUSFERRE - EMPIRE ENGINE
 * Market Logic: Pricing, Yields, Splits, Jitter
 * 
 * "Trust. Iron. Empire."
 */

import { 
  GIFT_SPLIT, 
  SALE_SPLIT,
  TIER,
  CONSTANTS,
  Asset,
  User,
  Transaction,
  Gift,
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

interface PriceResult {
  base_price: number;
  markup_price: number;
  jitter_amount: number;
  final_price: number;
  creator_earn: number;
  owner_earn: number;
  brian_earn: number;
  burn_amount: number;
}

interface YieldResult {
  daily_yield: number;
  weekly_yield: number;
  monthly_yield: number;
  tier: TIER;
}

interface GiftSplit {
  creator_amount: number;
  owner_amount: number;
  brian_amount: number;
  burn_amount: number;
}

interface SaleSplit {
  seller_amount: number;
  previous_owner_amount: number;
  platform_amount: number;
}

// ============================================
// GIFT SPLIT ENGINE
// ============================================

export class GiftSplitEngine {
  /**
   * Calculate gift split (30% Creator | 5% Owner | 5% Brian | 60% BURN)
   */
  calculate(giftAmount: number): GiftSplit {
    const split: GiftSplit = {
      creator_amount: Math.floor(giftAmount * (GIFT_SPLIT.CREATOR / 100)),
      owner_amount: Math.floor(giftAmount * (GIFT_SPLIT.OWNER / 100)),
      brian_amount: Math.floor(giftAmount * (GIFT_SPLIT.BRIAN / 100)),
      burn_amount: Math.floor(giftAmount * (GIFT_SPLIT.BURN / 100)),
    };
    return split;
  }

  /**
   * Validate gift amount minimum
   */
  validateMinimum(giftAmount: number): { valid: boolean; error?: string } {
    if (giftAmount < 1) {
      return { valid: false, error: 'Minimum gift amount is 1 Credit' };
    }
    return { valid: true };
  }
}

// ============================================
// SALE SPLIT ENGINE
// ============================================

export class SaleSplitEngine {
  /**
   * Calculate sale split (80% Seller | 10% Previous Owner | 10% Platform)
   */
  calculate(salePrice: number): SaleSplit {
    const split: SaleSplit = {
      seller_amount: Math.floor(salePrice * (SALE_SPLIT.SELLER / 100)),
      previous_owner_amount: Math.floor(salePrice * (SALE_SPLIT.PREVIOUS_OWNER / 100)),
      platform_amount: Math.floor(salePrice * (SALE_SPLIT.PLATFORM / 100)),
    };
    return split;
  }
}

// ============================================
// ACQUISITION MONITOR
// ============================================

export class AcquisitionMonitor {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  /**
   * Check if asset is at floor ($5 or below)
   */
  async checkFloor(assetId: string): Promise<boolean> {
    const asset = await this.db.table('assets').where('id', assetId).first();
    return asset?.current_price <= CONSTANTS.FLOOR_PRICE;
  }

  /**
   * Check if asset has recovered ($8 or above)
   */
  async checkRecovery(assetId: string): Promise<boolean> {
    const asset = await this.db.table('assets').where('id', assetId).first();
    return asset?.current_price >= CONSTANTS.RESET_THRESHOLD;
  }

  /**
   * Get hours remaining until acquisition
   */
  async getHoursRemaining(assetId: string): Promise<number | null> {
    const asset = await this.db.table('assets').where('id', assetId).first();
    if (!asset?.lab_timer_start) return null;
    
    const start = new Date(asset.lab_timer_start).getTime();
    const elapsed = (Date.now() - start) / (1000 * 60 * 60);
    return Math.max(0, CONSTANTS.ACQUISITION_HOURS - elapsed);
  }
}

// ============================================
// EMPIRE ENGINE (MAIN)
// ============================================

export class EmpireEngine {
  private db: Database;
  private giftSplitEngine: GiftSplitEngine;
  private saleSplitEngine: SaleSplitEngine;
  private acquisitionMonitor: AcquisitionMonitor;

  constructor(db: Database) {
    this.db = db;
    this.giftSplitEngine = new GiftSplitEngine();
    this.saleSplitEngine = new SaleSplitEngine();
    this.acquisitionMonitor = new AcquisitionMonitor(db);
  }

  /**
   * Calculate gift price with 30% markup and ±3% jitter
   */
  calculateGiftPrice(baseAmount: number): PriceResult {
    // Validate minimum
    const validation = this.giftSplitEngine.validateMinimum(baseAmount);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // 30% markup
    const markupPrice = baseAmount * 1.30;

    // ±3% jitter (min $0.01, max $0.50)
    const jitterPercent = (Math.random() * 6 - 3) / 100;
    const jitterAmount = Math.max(
      CONSTANTS.PRICE_JITTER_MIN,
      Math.min(CONSTANTS.PRICE_JITTER_MAX, Math.abs(markupPrice * jitterPercent))
    );
    const finalPrice = Number((markupPrice + jitterAmount).toFixed(2));

    // Calculate splits
    const split = this.giftSplitEngine.calculate(baseAmount);

    return {
      base_price: baseAmount,
      markup_price: Number(markupPrice.toFixed(2)),
      jitter_amount: Number(jitterAmount.toFixed(2)),
      final_price: finalPrice,
      creator_earn: split.creator_amount,
      owner_earn: split.owner_amount,
      brian_earn: split.brian_amount,
      burn_amount: split.burn_amount,
    };
  }

  /**
   * Calculate per-asset yield based on tier
   */
  calculateYield(assetValue: number, tier: TIER = TIER.STANDARD): YieldResult {
    let yieldRate: number;
    
    switch (tier) {
      case TIER.WHALE:
        yieldRate = CONSTANTS.WHALE_YIELD;
        break;
      case TIER.LEGENDARY:
        yieldRate = CONSTANTS.LEGENDARY_YIELD;
        break;
      default:
        yieldRate = CONSTANTS.STANDARD_YIELD;
    }

    const dailyYield = assetValue * yieldRate;
    
    return {
      daily_yield: Number(dailyYield.toFixed(2)),
      weekly_yield: Number((dailyYield * 7).toFixed(2)),
      monthly_yield: Number((dailyYield * 30).toFixed(2)),
      tier: tier,
    };
  }

  /**
   * Process gift transaction
   */
  async processGift(
    senderId: string,
    recipientId: string,
    assetId: string,
    baseAmount: number
  ): Promise<{
    success: boolean;
    transaction?: Transaction;
    error?: string;
  }> {
    try {
      // Calculate pricing
      const price = this.calculateGiftPrice(baseAmount);
      
      // Get asset info
      const asset = await this.db.table('assets').where('id', assetId).first();
      if (!asset) {
        return { success: false, error: 'Asset not found' };
      }

      // Execute gift transaction
      const gift: Transaction = {
        id: crypto.randomUUID(),
        sender_id: senderId,
        recipient_id: recipientId,
        asset_id: assetId,
        amount: price.final_price,
        type: 'GIFT',
        status: 'COMPLETED',
        created_at: new Date().toISOString(),
      };

      // Record transaction
      await this.db.table('transactions').insert(gift);

      // Update balances
      await this.db.table('users')
        .where('id', senderId)
        .update({ total_spent: (await this.db.table('users').where('id', senderId).first()).total_spent + price.final_price });

      await this.db.table('users')
        .where('id', recipientId)
        .update({ total_earned: (await this.db.table('users').where('id', recipientId).first()).total_earned + price.creator_earn });

      // Update asset price (slight increase from gift)
      await this.db.table('assets')
        .where('id', assetId)
        .update({ 
          current_price: asset.current_price + (baseAmount * 0.01),
          last_price_update: new Date().toISOString(),
        });

      return { success: true, transaction: gift };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Process sale transaction
   */
  async processSale(
    sellerId: string,
    buyerId: string,
    assetId: string,
    salePrice: number
  ): Promise<{
    success: boolean;
    transaction?: Transaction;
    error?: string;
  }> {
    try {
      const split = this.saleSplitEngine.calculate(salePrice);
      
      // Get current owner
      const asset = await this.db.table('assets').where('id', assetId).first();
      if (!asset) {
        return { success: false, error: 'Asset not found' };
      }

      const previousOwnerId = asset.owner_id;

      const sale: Transaction = {
        id: crypto.randomUUID(),
        sender_id: sellerId,
        recipient_id: buyerId,
        asset_id: assetId,
        amount: salePrice,
        type: 'SALE',
        status: 'COMPLETED',
        created_at: new Date().toISOString(),
      };

      // Record transaction
      await this.db.table('transactions').insert(sale);

      // Transfer ownership
      await this.db.table('assets')
        .where('id', assetId)
        .update({ 
          owner_id: buyerId,
          last_price_update: new Date().toISOString(),
        });

      return { success: true, transaction: sale };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Apply market jitter after battle win
   */
  async applyBattleJitter(assetId: string): Promise<void> {
    const asset = await this.db.table('assets').where('id', assetId).first();
    if (!asset) return;

    // +3% jitter in winner's favor
    const jitterPercent = 0.03;
    const jitterAmount = asset.current_price * jitterPercent;
    const newPrice = Math.min(
      asset.current_price + jitterAmount,
      asset.current_price + CONSTANTS.PRICE_JITTER_MAX
    );

    await this.db.table('assets')
      .where('id', assetId)
      .update({ 
        current_price: Number(newPrice.toFixed(2)),
        last_price_update: new Date().toISOString(),
      });
  }

  /**
   * Get asset valuation
   */
  async getValuation(assetId: string): Promise<{
    current_price: number;
    tier: TIER;
    daily_yield: number;
    days_at_floor: number;
    is_acquisition_risk: boolean;
  } | null> {
    const asset = await this.db.table('assets').where('id', assetId).first();
    if (!asset) return null;

    const hoursRemaining = await this.acquisitionMonitor.getHoursRemaining(assetId);

    return {
      current_price: asset.current_price,
      tier: asset.tier || TIER.STANDARD,
      daily_yield: this.calculateYield(asset.current_price, asset.tier).daily_yield,
      days_at_floor: asset.lab_timer_start 
        ? Math.floor((Date.now() - new Date(asset.lab_timer_start).getTime()) / (1000 * 60 * 60 * 24))
        : 0,
      is_acquisition_risk: hoursRemaining !== null && hoursRemaining < 72, // Risk if < 3 days
    };
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

let empireEngineInstance: EmpireEngine | null = null;

export function getEmpireEngine(db: Database): EmpireEngine {
  if (!empireEngineInstance) {
    empireEngineInstance = new EmpireEngine(db);
  }
  return empireEngineInstance;
}

export { PriceResult, YieldResult, GiftSplit, SaleSplit };
