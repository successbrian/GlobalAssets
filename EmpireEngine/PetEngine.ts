/**
 * EMPIRE ENGINE - PET ENGINE
 * Core Game Logic for Pet Management
 * 
 * "The heartbeat of the Empire. Market-driven valuations."
 * 
 * NOTE: This module REQUESTS balance updates from MultiSiteEconomy
 * but does NOT contain wallet/ledger code.
 * 
 * FEEDING/HUNGER LOGIC REMOVED - Market price is the only metric.
 */

import { 
  Pet, 
  PetTier, 
  BalanceUpdateRequest,
  GameEvent 
} from './types';

// ============================================
// PET TIER CONFIGURATION (Portfolio-based yields)
// ============================================

// Per-pet yields REMOVED. Now based on Owner Portfolio Tier.
// Whale Portfolio Yield: 5-10% based on Owner Tier

export const OWNER_PORTFOLIO_TIERS = {
  BRONZE: { minAssets: 1, yield: 0.05, label: 'Bronze Whale' },
  SILVER: { minAssets: 5, yield: 0.06, label: 'Silver Whale' },
  GOLD: { minAssets: 15, yield: 0.07, label: 'Gold Whale' },
  PLATINUM: { minAssets: 50, yield: 0.08, label: 'Platinum Whale' },
  DIAMOND: { minAssets: 100, yield: 0.10, label: 'Diamond Whale' },
};

// ============================================
// PET CREATION
// ============================================

export async function createPet(
  userId: string,
  siteId: string,
  name: string,
  petType: 'supporter' | 'titan' = 'supporter'
): Promise<Pet> {
  // Create pet record - market price determined by valuation engine
  const pet: Pet = {
    id: crypto.randomUUID(),
    user_id: userId,
    site_id: siteId,
    name,
    type: petType,
    level: 1,
    xp: 0,
    xp_to_next_level: 100,
    hunger: 0,        // REMOVED: No more hunger
    max_hunger: 0,   // REMOVED
    mood: 'neutral',  // REMOVED: No mood
    tier: 'BRONZE',
    owner_yield_percentage: OWNER_PORTFOLIO_TIERS.BRONZE.yield, // From portfolio tier
    is_invisible: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return pet;
}

// ============================================
// XP & LEVELING (Purely cosmetic now)
// ============================================

export function calculateXpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

export function getPetTier(xp: number): PetTier {
  if (xp >= 50000) return 'DIAMOND';
  if (xp >= 20000) return 'PLATINUM';
  if (xp >= 5000) return 'GOLD';
  if (xp >= 1000) return 'SILVER';
  return 'BRONZE';
}

export async function addXp(
  pet: Pet,
  xpGained: number,
  emitEvent: (event: GameEvent) => Promise<void>
): Promise<{ leveledUp: boolean; newTier?: PetTier }> {
  const oldTier = pet.tier;
  pet.xp += xpGained;
  pet.xp_to_next_level = calculateXpForLevel(pet.level);
  
  // Level up
  if (pet.xp >= pet.xp_to_next_level) {
    pet.level++;
    pet.xp_to_next_level = calculateXpForLevel(pet.level);
  }

  // Tier up
  const newTier = getPetTier(pet.xp);
  if (newTier !== oldTier) {
    pet.tier = newTier;
    pet.owner_yield_percentage = OWNER_PORTFOLIO_TIERS[newTier as keyof typeof OWNER_PORTFOLIO_TIERS]?.yield || 0.05;
    
    await emitEvent({
      id: crypto.randomUUID(),
      site_id: pet.site_id,
      event_type: 'tier_reached',
      user_id: pet.user_id,
      asset_id: pet.id,
      metadata: { old_tier: oldTier, new_tier: newTier },
      xp_gained: xpGained,
      created_at: new Date().toISOString(),
    });

    return { leveledUp: true, newTier };
  }

  return { leveledUp: false };
}

// ============================================
// PORTFOLIO YIELD CALCULATION
// ============================================

export interface PortfolioYield {
  userId: string;
  portfolioValue: number;
  tier: keyof typeof OWNER_PORTFOLIO_TIERS;
  yieldPercentage: number;
  dailyYield: number;
  monthlyYield: number;
}

export function calculatePortfolioYield(
  userId: string,
  portfolioValue: number,
  assetCount: number
): PortfolioYield {
  // Determine tier based on asset count
  let tier: keyof typeof OWNER_PORTFOLIO_TIERS = 'BRONZE';
  if (assetCount >= 100) tier = 'DIAMOND';
  else if (assetCount >= 50) tier = 'PLATINUM';
  else if (assetCount >= 15) tier = 'GOLD';
  else if (assetCount >= 5) tier = 'SILVER';

  const tierConfig = OWNER_PORTFOLIO_TIERS[tier];
  const yieldPercentage = tierConfig.yield;
  
  // Annual yield based on portfolio value
  const annualYield = portfolioValue * yieldPercentage;
  
  return {
    userId,
    portfolioValue,
    tier,
    yieldPercentage,
    dailyYield: annualYield / 365,
    monthlyYield: annualYield / 12,
  };
}

// ============================================
// LEADERBOARD RANKING (Market Price Based)
// ============================================

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  totalPortfolioValue: number;  // BASED ON CURRENT MARKET PRICE
  assetCount: number;
  yieldPercentage: number;
}

export function rankByMarketValue(
  portfolioValues: Map<string, { value: number; count: number }>
): LeaderboardEntry[] {
  // Convert to array and sort by CURRENT MARKET VALUE (not lifetime earnings)
  const entries: LeaderboardEntry[] = Array.from(portfolioValues.entries()).map(
    ([userId, data], index) => {
      const tier = getTierFromAssetCount(data.count);
      return {
        rank: 0, // Will be assigned after sorting
        userId,
        totalPortfolioValue: data.value,  // Current market price
        assetCount: data.count,
        yieldPercentage: OWNER_PORTFOLIO_TIERS[tier as keyof typeof OWNER_PORTFOLIO_TIERS]?.yield || 0.05,
      };
    }
  );

  // Sort by portfolio value descending
  entries.sort((a, b) => b.totalPortfolioValue - a.totalPortfolioValue);

  // Assign ranks
  entries.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  return entries;
}

function getTierFromAssetCount(count: number): string {
  if (count >= 100) return 'DIAMOND';
  if (count >= 50) return 'PLATINUM';
  if (count >= 15) return 'GOLD';
  if (count >= 5) return 'SILVER';
  return 'BRONZE';
}

// ============================================
// PET STATS (Simplified - no hunger/mood)
// ============================================

export function getPetStats(pets: Pet[]) {
  return {
    totalXp: pets.reduce((sum, p) => sum + p.xp, 0),
    totalPets: pets.length,
    avgTier: getAverageTier(pets),
  };
}

function getAverageTier(pets: Pet[]): string {
  if (pets.length === 0) return 'BRONZE';
  
  const tierValues: Record<string, number> = {
    BRONZE: 1,
    SILVER: 2,
    GOLD: 3,
    PLATINUM: 4,
    DIAMOND: 5,
  };
  
  const avg = pets.reduce((sum, p) => sum + (tierValues[p.tier] || 1), 0) / pets.length;
  
  const tiers = Object.entries(tierValues).find(([_, v]) => v >= avg);
  return tiers?.[0] || 'BRONZE';
}

// ============================================
// GAME EVENT EMITTER
// ============================================

async function emitGameEvent(
  siteId: string,
  userId: string,
  eventType: string,
  assetId?: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  console.log(`[GameEvent] ${siteId}:${userId} - ${eventType}`, metadata);
}
