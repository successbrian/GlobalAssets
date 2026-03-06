/**
 * PayoutEngine.ts
 * 5-Tier Ownership Bonus System for 18-Site Empire
 * 
 * "Yield scales with empire size. Premium assets unlock premium tiers."
 * 
 * TIER STRUCTURE:
 * ┌─────────┬─────────────────┬──────────────────────────────┐
 * │  TIER   │  TOTAL ASSETS   │       MINIMUM PREMIUM        │
 * ├─────────┼─────────────────┼──────────────────────────────┤
 * │    1    │     1-4         │            Base               │
 * │    2    │     5-9         │            Base               │
 * │    3    │    10-19        │            Base               │
 * │    4    │    20-49        │            Base               │
 * │    5    │     50+         │    50 Premium (Value > $25)   │
 * │         │                 │  Falls back to Tier 4 if not  │
 * └─────────┴─────────────────┴──────────────────────────────┘
 * 
 * YIELDS:
 * T1: 5% | T2: 6% | T3: 7% | T4: 8% | T5: 10%
 */

import type { HumanAsset } from './types';

// ============================================
// CONFIGURATION
// ============================================

export const YIELD_TIERS = {
  1: { yield: 0.05, label: 'Apprentice', minAssets: 1, minPremium: 0 },
  2: { yield: 0.06, label: 'Trader', minAssets: 5, minPremium: 0 },
  3: { yield: 0.07, label: 'Baron', minAssets: 10, minPremium: 0 },
  4: { yield: 0.08, label: 'Magnate', minAssets: 20, minPremium: 0 },
  5: { yield: 0.10, label: 'Tycoon', minAssets: 50, minPremium: 50 }, // CRITICAL
} as const;

export const PREMIUM_THRESHOLD = 25.00; // Assets worth > $25 are "Premium"
export const DEFAULT_YIELD = 0.05; // Tier 1 base yield

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface TierInfo {
  tier: number;
  yield: number;
  label: string;
  totalAssets: number;
  premiumAssets: number;
  nextTier: number | null;
  progressToNext: number;
  requirementsForNext: string;
}

export interface YieldBreakdown {
  totalYield: number;
  tierInfo: TierInfo;
  eligibleAssets: HumanAsset[];
  ineligibleAssets: HumanAsset[];
  totalMarketValue: number;
  yieldPerPayout: number;
}

// ============================================
// CORE FUNCTIONS
// ============================================

/**
 * Calculate the tier based on owned assets
 */
export function calculateTier(
  totalAssets: number,
  premiumAssets: number
): {
  tier: number;
  yield: number;
  label: string;
  canReachTier5: boolean;
} {
  // Tier 5 is special - requires 50+ assets AND 50 premium
  if (totalAssets >= YIELD_TIERS[5].minAssets) {
    if (premiumAssets >= YIELD_TIERS[5].minPremium) {
      return { tier: 5, yield: YIELD_TIERS[5].yield, label: YIELD_TIERS[5].label, canReachTier5: true };
    }
    // Falls back to Tier 4
    return { tier: 4, yield: YIELD_TIERS[4].yield, label: YIELD_TIERS[4].label, canReachTier5: false };
  }
  
  // Find appropriate tier for 1-4
  for (let t = 4; t >= 1; t--) {
    if (totalAssets >= YIELD_TIERS[t].minAssets) {
      return { tier: t, yield: YIELD_TIERS[t].yield, label: YIELD_TIERS[t].label, canReachTier5: true };
    }
  }
  
  // Default to Tier 1
  return { tier: 1, yield: YIELD_TIERS[1].yield, label: YIELD_TIERS[1].label, canReachTier5: true };
}

/**
 * Calculate owner's yield percentage for their entire portfolio
 */
export function calculateOwnerYield(
  ownerId: string,
  allOwnedAssets: HumanAsset[]
): YieldBreakdown {
  // Filter to assets owned by this user
  const eligibleAssets = allOwnedAssets.filter(a => a.owner_id === ownerId);
  
  // Count premium assets (value > $25)
  const premiumAssets = eligibleAssets.filter(a => a.market_valuation >= PREMIUM_THRESHOLD);
  
  // Calculate tier
  const { tier, yield: tierYield, label, canReachTier5 } = calculateTier(
    eligibleAssets.length,
    premiumAssets.length
  );
  
  // Calculate total market value
  const totalMarketValue = eligibleAssets.reduce((sum, a) => sum + a.market_valuation, 0);
  
  // Calculate yield per payout (simplified - assumes monthly payout)
  const totalYield = totalMarketValue * tierYield;
  const yieldPerPayout = totalYield; // Would be divided by 12 for monthly
  
  // Determine next tier info
  let nextTier: number | null = null;
  let progressToNext = 0;
  let requirementsForNext = '';
  
  if (tier < 5) {
    nextTier = tier + 1;
    const nextConfig = YIELD_TIERS[nextTier];
    
    if (nextTier === 5) {
      const needed = nextConfig.minPremium - premiumAssets.length;
      const neededTotal = nextConfig.minAssets - eligibleAssets.length;
      progressToNext = Math.min(100, (premiumAssets.length / nextConfig.minPremium) * 100);
      requirementsForNext = `Need ${needed} more Premium Assets (Value > $25) to hit Tier 5!`;
    } else {
      const needed = nextConfig.minAssets - eligibleAssets.length;
      progressToNext = Math.min(100, (eligibleAssets.length / nextConfig.minAssets) * 100);
      requirementsForNext = `Own ${needed} more assets to reach Tier ${nextTier}`;
    }
  }
  
  return {
    totalYield,
    tierInfo: {
      tier,
      yield: tierYield,
      label,
      totalAssets: eligibleAssets.length,
      premiumAssets: premiumAssets.length,
      nextTier,
      progressToNext,
      requirementsForNext,
    },
    eligibleAssets,
    ineligibleAssets: [], // Assets where owner_id !== current user
    totalMarketValue,
    yieldPerPayout,
  };
}

/**
 * Get detailed tier information for display
 */
export function getTierInfo(ownerId: string, allOwnedAssets: HumanAsset[]): TierInfo {
  return calculateOwnerYield(ownerId, allOwnedAssets).tierInfo;
}

/**
 * Calculate yield for a specific asset
 */
export function calculateAssetYield(
  asset: HumanAsset,
  ownerYieldPercentage: number
): {
  monthlyYield: number;
  yearlyYield: number;
} {
  const monthlyYield = asset.market_valuation * (ownerYieldPercentage / 12);
  const yearlyYield = asset.market_valuation * ownerYieldPercentage;
  
  return { monthlyYield, yearlyYield };
}

/**
 * Get progress to next tier (formatted for UI)
 */
export function getTierProgress(ownerId: string, allOwnedAssets: HumanAsset[]): {
  currentTier: number;
  currentYield: number;
  nextTier: number | null;
  nextYield: number | null;
  progressPercent: number;
  progressText: string;
} {
  const breakdown = calculateOwnerYield(ownerId, allOwnedAssets);
  const { tierInfo } = breakdown;
  
  let nextYield: number | null = null;
  if (tierInfo.nextTier) {
    nextYield = YIELD_TIERS[tierInfo.nextTier as keyof typeof YIELD_TIERS].yield * 100;
  }
  
  return {
    currentTier: tierInfo.tier,
    currentYield: tierInfo.yield * 100,
    nextTier: tierInfo.nextTier,
    nextYield,
    progressPercent: tierInfo.progressToNext,
    progressText: tierInfo.requirementsForNext,
  };
}

/**
 * Check if user qualifies for Tier 5 (Tycoon)
 */
export function isTycoon(ownerId: string, allOwnedAssets: HumanAsset[]): {
  qualified: boolean;
  premiumCount: number;
  premiumNeeded: number;
} {
  const eligibleAssets = allOwnedAssets.filter(a => a.owner_id === ownerId);
  const premiumAssets = eligibleAssets.filter(a => a.market_valuation >= PREMIUM_THRESHOLD);
  
  return {
    qualified: premiumAssets.length >= YIELD_TIERS[5].minPremium && eligibleAssets.length >= YIELD_TIERS[5].minAssets,
    premiumCount: premiumAssets.length,
    premiumNeeded: Math.max(0, YIELD_TIERS[5].minPremium - premiumAssets.length),
  };
}

/**
 * Format yield percentage for display
 */
export function formatYield(percentage: number): string {
  return `${(percentage * 100).toFixed(1)}%`;
}

/**
 * Get tier color for UI
 */
export function getTierColor(tier: number): {
  bg: string;
  border: string;
  text: string;
  icon: string;
} {
  const colors = {
    1: { bg: 'bg-gray-500/10', border: 'border-gray-500/30', text: 'text-gray-400', icon: '🥉' },
    2: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', icon: '🥈' },
    3: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', icon: '🥇' },
    4: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', icon: '👑' },
    5: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', icon: '💎' },
  };
  return colors[tier as keyof typeof colors] || colors[1];
}
