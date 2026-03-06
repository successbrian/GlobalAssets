/**
 * ValuationEngine.ts
 * The Decay Engine - Price Calculation with Dormancy
 * 
 * "Assets decay when neglected. Activity is rewarded."
 */

import type { AssetValuation } from './types';

// ============================================
// CONFIGURATION
// ============================================
export const VALUATION_CONFIG = {
  // Base values
  BASE_PRICE: 25,              // Minimum account value
  
  // Decay thresholds
  GRACE_PERIOD_DAYS: 7,        // No decay for first 7 days of inactivity
  DECAY_START_DAY: 8,          // Start decaying after this many days
  
  // Decay tiers
  DECAY_TIERS: [
    { days: 7, multiplier: 1.0, label: 'Fresh' },
    { days: 14, multiplier: 0.90, label: 'Active' },
    { days: 30, multiplier: 0.75, label: 'cooling' },
    { days: 60, multiplier: 0.50, label: 'Neglected' },
    { days: 90, multiplier: 0.25, label: 'Stale' },
    { days: 180, multiplier: 0.10, label: 'Forgotten' },
    { days: 365, multiplier: 0.05, label: 'Ghost' },
  ],
  
  // Consistency score weights
  CONSISTENCY_WEIGHTS: {
    post_bonus: 1,            // +$1 per post today
    miss_penalty: -2,          // -$2 if missed yesterday
    floor_price: 5,           // Never go below $5
    ceiling_multiplier: 10,    // Max value is 10x base if hyperactive
  },
  
  // Steal mechanics
  STEAL_PREMIUM: 0.10,        // +10% above calculated value
  AGENT_BONUS: 0.05,          // +5% to recruiter if applicable
};

// ============================================
// CORE FUNCTIONS
// ============================================

/**
 * Calculate the decay multiplier based on days dormant
 */
export function calculateDecayMultiplier(daysDormant: number): number {
  // Grace period - no decay
  if (daysDormant <= VALUATION_CONFIG.GRACE_PERIOD_DAYS) {
    return 1.0;
  }
  
  // Find the appropriate tier
  for (const tier of VALUATION_CONFIG.DECAY_TIERS.slice(1)) {
    if (daysDormant < tier.days) {
      return tier.multiplier;
    }
  }
  
  // Extreme dormancy
  return VALUATION_CONFIG.DECAY_TIERS[VALUATION_CONFIG.DECAY_TIERS.length - 1].multiplier;
}

/**
 * Get tier label for UI
 */
export function getTierLabel(daysDormant: number): string {
  for (const tier of VALUATION_CONFIG.DECAY_TIERS) {
    if (daysDormant < tier.days) {
      return tier.label;
    }
  }
  return 'Ghost';
}

/**
 * Calculate asset price with decay
 */
export function calculateAssetPrice(
  basePrice: number,
  daysDormant: number,
  consistencyScore: number = 50
): AssetValuation {
  const decayMultiplier = calculateDecayMultiplier(daysDormant);
  const consistencyMultiplier = 1 + (consistencyScore / 100) * 0.5; // 1.0 to 1.25
  
  const preFloorPrice = basePrice * decayMultiplier * consistencyMultiplier;
  const finalPrice = Math.max(preFloorPrice, VALUATION_CONFIG.CONSISTENCY_WEIGHTS.floor_price);
  
  return {
    base_price: basePrice,
    decay_multiplier: decayMultiplier,
    final_price: finalPrice,
    days_dormant: daysDormant,
    consistency_score: consistencyScore,
    is_for_sale: false,
    owner_id: null,
  };
}

/**
 * Calculate steal price (base + 10% premium)
 */
export function calculateStealPrice(basePrice: number, daysDormant: number): number {
  const valuation = calculateAssetPrice(basePrice, daysDormant);
  return Math.ceil(valuation.final_price * (1 + VALUATION_CONFIG.STEAL_PREMIUM));
}

/**
 * Calculate agent bonus (5% to recruiter)
 */
export function calculateAgentBonus(stealPrice: number): number {
  return Math.floor(stealPrice * VALUATION_CONFIG.AGENT_BONUS);
}

// ============================================
// VEXTORGRID MIGRATION HELPERS
// ============================================

/**
 * Convert VextorGrid legacy value to new format
 */
export function migrateLegacyValue(
  legacyValue: number,
  lastPostDate: string | null
): number {
  if (!lastPostDate) {
    // Frozen account - heavily decayed
    const daysDormant = 999;
    const multiplier = calculateDecayMultiplier(daysDormant);
    return Math.max(legacyValue * multiplier, VALUATION_CONFIG.CONSISTENCY_WEIGHTS.floor_price);
  }
  
  const daysDormant = getDaysSince(lastPostDate);
  const valuation = calculateAssetPrice(legacyValue, daysDormant);
  return valuation.final_price;
}

/**
 * Get days since a date
 */
export function getDaysSince(dateString: string): number {
  const date = new Date(dateString);
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

// ============================================
// ACTIVITY-BASED VALUATION
// ============================================

export interface ActivityMetrics {
  postsToday: number;
  postsYesterday: number;
  totalPosts: number;
  lastPostAt: string | null;
}

/**
 * Calculate activity-based adjustments
 */
export function calculateActivityAdjustment(metrics: ActivityMetrics): {
  adjustment: number;
  consistencyScore: number;
} {
  let adjustment = 0;
  
  // Bonus for posting today
  if (metrics.postsToday > 0) {
    adjustment += VALUATION_CONFIG.CONSISTENCY_WEIGHTS.post_bonus;
  }
  
  // Penalty for missing yesterday
  if (metrics.postsYesterday === 0 && metrics.totalPosts > 0) {
    adjustment += VALUATION_CONFIG.CONSISTENCY_WEIGHTS.miss_penalty;
  }
  
  // Calculate consistency score (0-100)
  const postsLast30Days = Math.min(metrics.totalPosts, 30);
  const consistencyScore = Math.min(100, postsLast30Days * 3 + (metrics.postsToday > 0 ? 10 : 0));
  
  return { adjustment, consistencyScore };
}

/**
 * Get full valuation with activity metrics
 */
export function getFullValuation(
  basePrice: number,
  activity: ActivityMetrics
): AssetValuation {
  const daysDormant = activity.lastPostAt 
    ? getDaysSince(activity.lastPostAt)
    : 999;
    
  const { adjustment, consistencyScore } = calculateActivityAdjustment(activity);
  
  const decayMultiplier = calculateDecayMultiplier(daysDormant);
  const adjustedPrice = Math.max(basePrice + adjustment, VALUATION_CONFIG.CONSISTENCY_WEIGHTS.floor_price);
  const finalPrice = adjustedPrice * decayMultiplier;
  
  return {
    base_price: basePrice,
    decay_multiplier: decayMultiplier,
    final_price: Math.round(finalPrice),
    days_dormant: daysDormant,
    consistency_score: consistencyScore,
    is_for_sale: false,
    owner_id: null,
  };
}

// ============================================
// UI HELPERS
// ============================================

/**
 * Get status color based on valuation
 */
export function getValuationStatus(valuation: AssetValuation): {
  color: string;
  icon: string;
  label: string;
} {
  if (valuation.decay_multiplier >= 0.9) {
    return { color: 'green', icon: '🔥', label: 'Hot' };
  } else if (valuation.decay_multiplier >= 0.75) {
    return { color: 'yellow', icon: '☀️', label: 'Active' };
  } else if (valuation.decay_multiplier >= 0.5) {
    return { color: 'orange', icon: '😴', label: 'Cooling' };
  } else if (valuation.decay_multiplier >= 0.25) {
    return { color: 'red', icon: '❄️', label: 'Cold' };
  } else {
    return { color: 'gray', icon: '👻', label: 'Ghost' };
  }
}

/**
 * Format price for display
 */
export function formatAssetPrice(price: number): string {
  return `💎 ${price.toLocaleString()}`;
}
