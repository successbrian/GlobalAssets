/**
 * MULTI-SITE ECONOMY - CONSTANTS
 * The Bank's Immutable Rules
 */

// ============================================
// ORACLE DB TABLES (Shared)
// ============================================

export const ORACLE_TABLES = {
  GLOBAL_PET_REGISTRY: 'global_pet_registry',
  GLOBAL_SHOUTOUT_LOG: 'global_shoutout_log',
  GLOBAL_USER_REGISTRY: 'global_user_registry',
  GLOBAL_TRANSACTIONS: 'global_transactions',
  EMPIRE_SITES: 'empire_sites',
} as const;

// ============================================
// ECONOMY TABLES
// ============================================

export const ECONOMY_TABLES = {
  USER_BALANCES: 'user_balances',
  LEDGER_TRANSACTIONS: 'ledger_transactions',
  WALLETS: 'wallets',
  WALLET_BALANCES: 'wallet_balances',
  SITE_ECONOMY: 'site_economy',
  DIVIDEND_POOLS: 'dividend_pools',
  DIVIDEND_ALLOCATIONS: 'dividend_allocations',
  ASSET_OWNERSHIP: 'asset_ownership_records',
  ORACLE_SYNC: 'oracle_sync_status',
} as const;

// ============================================
// ECONOMY CONSTANTS
// ============================================

export const ECONOMY_CONSTANTS = {
  DEFAULT_CURRENCY: 'CIVITAS_CREDITS',
  TRANSACTION_FEE_PERCENTAGE: 0.08,
  MIN_TRANSACTION_AMOUNT: 1,
  MAX_TRANSACTION_AMOUNT: 1000000,
  BALANCE_PRECISION: 2,
} as const;

// ============================================
// SALE SPLITS (Updated v2)
// ============================================

export const SALE_SPLITS = {
  SELLER_PERCENTAGE: 0.80,   // Seller gets 80%
  CREATOR_PERCENTAGE: 0.10,  // Creator gets 10% (if sale >= $25)
  PLATFORM_PERCENTAGE: 0.10, // Platform gets 10%
} as const;

// ============================================
// INACTIVITY THRESHOLDS (Updated v2)
// ============================================

export const INACTIVITY_THRESHOLDS = {
  WARNING: 7,        // Days until decay starts
  CRITICAL: 14,      // Days until warning
  FROZEN: 30,        // Days until frozen
  PLATFORM_ACQUISITION: 14, // DAYS: Auto-seize at 14 days frozen at $5 floor
} as const;

// ============================================
// MARKET VALUE CONSTANTS
// ============================================

export const VALUATION_CONSTANTS = {
  BASE_VALUE: 25,           // $25 base account value
  POST_BONUS: 1,           // +$1 per daily post
  MISS_PENALTY: 2,         // -$2 per daily miss
  VALUE_FLOOR: 5,          // Minimum $5 value (ACQUISITION FLOOR)
  LISTING_PREMIUM: 1.10,   // 110% of market value for listings
  DECAY_START_DAYS: 7,     // Price decay starts after 7 days inactivity
  DECAY_RATE: 0.05,        // 5% decay per day after grace period
} as const;

// ============================================
// WHALE PORTFOLIO YIELDS (Updated v2)
// Per-pet yields REMOVED. Now based on Owner Portfolio Tier.
// ============================================

export const WHALE_PORTFOLIO_YIELDS = {
  BRONZE: { minAssets: 1, yield: 0.05, label: 'Bronze Whale' },
  SILVER: { minAssets: 5, yield: 0.06, label: 'Silver Whale' },
  GOLD: { minAssets: 15, yield: 0.07, label: 'Gold Whale' },
  PLATINUM: { minAssets: 50, yield: 0.08, label: 'Platinum Whale' },
  DIAMOND: { minAssets: 100, yield: 0.10, label: 'Diamond Whale' },
} as const;

// ============================================
// TIME FILTERS (For Circles/Feeds)
// ============================================

export const TIME_FILTER_HOURS = [
  1, 2, 4, 12, 24, 48, 72, 96,
] as const;

// ============================================
// COMMUNITY TIERS
// ============================================

export const COMMUNITY_TIERS = {
  FREE: { postsPerMonth: 60, price: 0 },
  GROWTH: { postsPerMonth: 600, price: 9.95 },
  PRO: { postsPerMonth: -1, price: 19.95 },
} as const;
