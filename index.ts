/**
 * GLOBAL ASSETS - ROOT INDEX
 * Empire Ecosystem Shared Modules
 * 
 * Architecture:
 * - MultiSiteEconomy: THE BANK (Ledger types & constants)
 * - EmpireEngine: GAME RULES (Pets, Agents, exclusive ownership)
 * - EngagementHub: SOCIAL (Shoutouts, Circles, Communities, @SatoshiGhost)
 * - AmoeBridge: CROSS-SITE (VextorGrid ↔ Novusferre Jackpot Bridge)
 * - GlobalAdmin: ADMINISTRATION (Empire-wide admin & security)
 */

// ============================================
// MULTI-SITE ECONOMY (THE BANK)
// ============================================

export type {
  UserBalance,
  LedgerTransaction,
  Wallet,
  WalletBalance,
  SiteEconomy,
  DividendPool,
  DividendAllocation,
  AssetOwnershipRecord,
  OracleSyncStatus,
  EconomyEvent,
  LedgerTransactionType,
} from './MultiSiteEconomy/types';

export {
  ORACLE_TABLES,
  ECONOMY_TABLES,
  ECONOMY_CONSTANTS,
  WHALE_PORTFOLIO_YIELDS,
  SALE_SPLITS,
  INACTIVITY_THRESHOLDS,
  TIME_FILTER_HOURS,
  COMMUNITY_TIERS,
} from './MultiSiteEconomy/constants';

// ============================================
// EMPIRE ENGINE (GAME RULES)
// ============================================

export * from './EmpireEngine';

// ============================================
// ENGAGEMENT HUB (SOCIAL)
// ============================================

export * from './EngagementHub';

// ============================================
// AMOE BRIDGE (CROSS-SITE JACKPOT)
// ============================================

export * from './LocalFeatures/amoe';

// ============================================
// GLOBAL ADMIN (ADMINISTRATION)
// ============================================

export * from './GlobalAdmin';

// ============================================
// ARCHITECTURE NOTES
// ============================================

/**
 * DATA FLOW DIAGRAM:
 * 
 * ┌─────────────────────────────────────────────────────────────┐
 * │                    EMPIRE SITES                              │
 * │  (CivitasReserve, VextorGrid, Novusferre, etc.)             │
 * └─────────────────────────────────────────────────────────────┘
 *                              │
 *                              ▼
 * ┌─────────────────────────────────────────────────────────────┐
 * │                  GLOBALASSETS / SHARED                        │
 * ├─────────────────────────────────────────────────────────────┤
 * │                                                             │
 * │  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐  ┌──────────────┐ │
 * │  │ MULTI-SITE      │  │ EMPIRE ENGINE   │  │ ENGAGEMENT  │  │ AMOE BRIDGE │ │
 * │  │ ECONOMY         │  │                 │  │ HUB          │  │             │ │
 * │  │ "THE BANK"      │  │ "GAME RULES"    │  │ "SOCIAL"     │  │ "BRIDGE"     │ │
 * │  │                 │  │                 │  │              │  │             │ │
 * │  │ - Balance Types │  │ - Pet Engine    │  │ - Shoutouts │  │ - Jackpot   │ │
 * │  │ - Transactions  │  │ - Valuation     │  │ - Circles    │  │ - UTC Reset │ │
 * │  │ - Wallets       │  │ - Agents        │  │ - Communities│  │ - Codes     │ │
 * │  │ - Dividends     │  │ - Ownership     │  │ - Ghost      │  │ - Receipts  │ │
 * │  └─────────────────┘  └─────────────────┘  └──────────────┘  └──────────────┘ │
 * │                                                             │
 * │  ┌─────────────────┐                                         │
 * │  │ GLOBAL ADMIN    │                                         │
 * │  │                 │                                         │
 * │  │ - Ban Hammer    │                                         │
 * │  │ - Site Health   │                                         │
 * │  │ - Empire Stats  │                                         │
 * │  │ - Audit Logs    │                                         │
 * │  └─────────────────┘                                         │
 * │                                                             │
 * └─────────────────────────────────────────────────────────────┘
 *                              │
 *                              ▼
 * ┌─────────────────────────────────────────────────────────────┐
 * │                      ORACLE DB                               │
 * │           (Cross-site sync & federation)                    │
 * └─────────────────────────────────────────────────────────────┘
 * 
 * 
 * KEY PRINCIPLE: Logic Isolation
 * - EmpireEngine REQUESTS balance updates from MultiSiteEconomy
 * - EmpireEngine does NOT contain wallet/ledger code
 * - This ensures single source of truth for all currency
 */

// ============================================
// USAGE EXAMPLES
// ============================================

/**
 * Example: Feeding a pet (uses EmpireEngine + requests from Economy)
 * 
 * import { PetEngine } from 'GlobalAssets/EmpireEngine';
 * import { LedgerTransaction } from 'GlobalAssets/MultiSiteEconomy';
 * 
 * const result = await PetEngine.feedPet(pet, foodAmount, async (req) => {
 *   // This calls THE BANK
 *   return await LedgerTransaction.credit(req.userId, req.amount, req.reason);
 * });
 */

/**
 * Example: Checking empire-wide balance
 * 
 * import { UserBalance } from 'GlobalAssets/MultiSiteEconomy';
 * 
 * const balances = await UserBalance.getAllSites(userId);
 */

/**
 * Example: Broadcasting to all sites
 * 
 * import { OracleBrain } from 'GlobalAssets/EngagementHub';
 * 
 * const thought = OracleBrain.generateThought();
 * await CrossSiteBroadcast.publish(thought);
 */

/**
 * Example: Cross-site jackpot bridge
 * 
 * import { generateBridgeCode, JACKPOT_CONFIG } from 'GlobalAssets/LocalFeatures/amoe';
 * 
 * const code = generateBridgeCode(userId, 'Mega');
 * await AmoeBridge.transferJackpot(code, 'vextor', 'novusferre');
 */

/**
 * Example: Banhammer (Order 66)
 * 
 * import { BanHammer } from 'GlobalAssets/GlobalAdmin';
 * 
 * await BanHammer.execute({
 *   userId: '...',
 *   reason: 'Spam',
 *   executeEmpireWide: true  // BANS ON ALL 14 SITES
 * });
 */
