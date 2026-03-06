/**
 * EMPIRE ENGINE - VALUATION ENGINE
 * Asset Pricing & Decay Logic
 * 
 * "The law of supply and demand. Prices decay, ownership persists."
 */

import { HumanAsset } from './types';
import { INACTIVITY_THRESHOLDS } from '../MultiSiteEconomy/constants';

// ============================================
// BASE VALUATION CONSTANTS
// ============================================

const BASE_VALUE = 25;           // $25 base account value
const POST_BONUS = 1;            // +$1 per daily post
const MISS_PENALTY = 2;           // -$2 per daily miss
const VALUE_FLOOR = 5;            // Minimum $5 value
const LISTING_PREMIUM = 1.10;     // 110% of market value for listings

// ============================================
// CONSISTENCY SCORE CALCULATION
// ============================================

export interface ConsistencyInput {
  postsToday: boolean;
  postsYesterday: boolean;
  postsThisWeek: number;
  postsLastWeek: number;
  lastActiveDaysAgo: number;
}

export function calculateConsistencyScore(input: ConsistencyInput): number {
  let score = 50; // Start at base 50

  // Daily activity bonus/penalty
  if (input.postsToday) score += 10;
  else if (!input.postsYesterday) score -= 10;

  // Weekly trend
  const weeklyTrend = input.postsThisWeek - input.postsLastWeek;
  if (weeklyTrend > 2) score += 15;
  else if (weeklyTrend < -2) score -= 15;
  else score += 5;

  // Recency penalty
  if (input.lastActiveDaysAgo > 7) score -= 20;
  else if (input.lastActiveDaysAgo > 3) score -= 10;

  return Math.max(0, Math.min(100, score));
}

// ============================================
// MARKET VALUE CALCULATION
// ============================================

export function calculateMarketValue(
  baseValue: number = BASE_VALUE,
  consistencyScore: number,
  daysDormant: number = 0,
  postedToday: boolean = false
): number {
  let value = baseValue;

  // Apply consistency multiplier (0.5 to 1.5)
  const consistencyMultiplier = 0.5 + (consistencyScore / 200);
  value *= consistencyMultiplier;

  // Apply dormancy decay (50% off after 7 days)
  if (daysDormant >= 7) {
    const decayDays = daysDormant - 7;
    const decayMultiplier = Math.max(0.5, 1 - (decayDays * 0.05));
    value *= decayMultiplier;
  }

  // Daily activity bonus
  if (postedToday) {
    value += POST_BONUS;
  } else {
    value -= MISS_PENALTY;
  }

  return Math.max(VALUE_FLOOR, Math.round(value * 100) / 100);
}

// ============================================
// FULL ASSET VALUATION
// ============================================

export interface FullValuationResult {
  basePrice: number;
  consistencyScore: number;
  consistencyMultiplier: number;
  dormancyDays: number;
  dormancyMultiplier: number;
  finalPrice: number;
  isForSale: boolean;
  daysUntilDecay: number;
  recommendation: 'hold' | 'list' | 'abandon';
}

export function valuateHumanAsset(asset: HumanAsset, postedToday: boolean = false): FullValuationResult {
  const now = new Date();
  const lastActive = new Date(asset.last_active_at);
  const daysDormant = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

  const consistencyScore = asset.consistency_score;
  const basePrice = BASE_VALUE;
  const consistencyMultiplier = 0.5 + (consistencyScore / 200);
  const dormancyMultiplier = daysDormant >= 7 
    ? Math.max(0.5, 1 - ((daysDormant - 7) * 0.05))
    : 1;

  const finalPrice = Math.max(
    VALUE_FLOOR,
    Math.round(basePrice * consistencyMultiplier * dormancyMultiplier * 100) / 100
  );

  // Calculate days until 50% decay
  const daysUntilDecay = Math.max(0, 7 - daysDormant);

  // Generate recommendation
  let recommendation: 'hold' | 'list' | 'abandon' = 'hold';
  if (daysDormant > INACTIVITY_THRESHOLDS.PLATFORM_ACQUISITION) {
    recommendation = 'abandon';
  } else if (finalPrice < 10 && daysDormant > 14) {
    recommendation = 'abandon';
  } else if (finalPrice > 50 && !asset.is_for_sale) {
    recommendation = 'list';
  }

  return {
    basePrice,
    consistencyScore,
    consistencyMultiplier,
    dormancyDays: daysDormant,
    dormancyMultiplier,
    finalPrice,
    isForSale: asset.is_for_sale,
    daysUntilDecay,
    recommendation,
  };
}

// ============================================
// LISTING PRICE CALCULATION
// ============================================

export function calculateListingPrice(marketValue: number, customMarkup?: number): number {
  const markup = customMarkup || LISTING_PREMIUM;
  return Math.ceil(marketValue * markup);
}

// ============================================
// SALE SPLIT CALCULATOR
// ============================================

export interface SaleSplit {
  salePrice: number;
  sellerNet: number;
  creatorFee: number;
  platformFee: number;
}

export function calculateSaleSplit(
  salePrice: number,
  creatorFeeThreshold: number = 25,
  sellerSplit: number = 0.82,
  creatorSplit: number = 0.10,
  platformSplit: number = 0.08
): SaleSplit {
  const creatorFee = salePrice >= creatorFeeThreshold ? salePrice * creatorSplit : 0;
  const platformFee = salePrice * platformSplit;
  const sellerNet = salePrice - creatorFee - platformFee;

  return {
    salePrice,
    sellerNet,
    creatorFee,
    platformFee,
  };
}

// ============================================
// INACTIVITY STATUS
// ============================================

export type InactivityStatus = 'active' | 'warning' | 'critical' | 'frozen' | 'abandoned';

export function getInactivityStatus(daysSincePost: number): InactivityStatus {
  if (daysSincePost >= INACTIVITY_THRESHOLDS.PLATFORM_ACQUISITION) {
    return 'abandoned';
  }
  if (daysSincePost >= INACTIVITY_THRESHOLDS.FROZEN) {
    return 'frozen';
  }
  if (daysSincePost >= INACTIVITY_THRESHOLDS.CRITICAL) {
    return 'critical';
  }
  if (daysSincePost >= INACTIVITY_THRESHOLDS.WARNING) {
    return 'warning';
  }
  return 'active';
}

// ============================================
// PORTFOLIO VALUATION
// ============================================

export interface PortfolioValuation {
  totalAssets: number;
  totalValue: number;
  avgConsistencyScore: number;
  listedValue: number;
  unlistedValue: number;
  abandonedCount: number;
}

export function valuatePortfolio(assets: HumanAsset[]): PortfolioValuation {
  let totalValue = 0;
  let listedValue = 0;
  let unlistedValue = 0;
  let totalConsistency = 0;
  let abandonedCount = 0;

  for (const asset of assets) {
    const valuation = valuateHumanAsset(asset);
    totalValue += valuation.finalPrice;
    
    if (asset.is_for_sale) {
      listedValue += valuation.finalPrice;
    } else {
      unlistedValue += valuation.finalPrice;
    }
    
    totalConsistency += asset.consistency_score;
    
    if (valuation.recommendation === 'abandon') {
      abandonedCount++;
    }
  }

  return {
    totalAssets: assets.length,
    totalValue,
    avgConsistencyScore: assets.length > 0 ? totalConsistency / assets.length : 0,
    listedValue,
    unlistedValue,
    abandonedCount,
  };
}

// ============================================
// PRICE DECAY SIMULATION
// ============================================

export function simulatePriceDecay(
  currentPrice: number,
  daysToSimulate: number,
  startingConsistency: number
): { day: number; price: number; consistency: number }[] {
  const results: { day: number; price: number; consistency: number }[] = [];
  let consistency = startingConsistency;

  for (let day = 0; day <= daysToSimulate; day++) {
    // Simulate consistency decay
    if (day > 0) {
      consistency = Math.max(0, consistency - (consistency > 50 ? 5 : 10));
    }

    const price = calculateMarketValue(
      BASE_VALUE,
      consistency,
      day > 0 ? day - 7 : 0,
      day === 0 // Posted today only on day 0
    );

    results.push({ day, price, consistency });
  }

  return results;
}
