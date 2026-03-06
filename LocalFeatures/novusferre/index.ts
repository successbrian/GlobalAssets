/**
 * NOVUSFERRE - ROOT INDEX
 * Sovereign Financial-Social Hybrid Platform
 * 
 * "Iron. Wheat. Empire."
 */

// ============================================
// CORE TYPES & CONSTANTS
// ============================================

export * from './novusferreTypes';

// ============================================
// STAGE ENGINE (Live Streaming)
// ============================================

export {
  NovusferreStage,
  STAGE_CONFIG,
  type StageSession,
  type StageGift,
} from './NovusferreStage';

// ============================================
// WALLET BANK (Dual-Wallet System)
// ============================================

export { WalletBank, getWalletBank } from './WalletBank';

// ============================================
// EMPIRE ENGINE (Market Logic)
// ============================================

export { 
  EmpireEngine, 
  GiftSplitEngine, 
  SaleSplitEngine, 
  AcquisitionMonitor,
  getEmpireEngine,
} from './EmpireEngine';

// ============================================
// SHADOW LAB (Vaporization Protocol)
// ============================================

export { 
  VaporizationEngine, 
  ShadowDashboardEngine, 
  IntelligencePaywallEngine,
  getVaporizationEngine,
} from './ShadowLab';

// ============================================
// ENGAGEMENT HUB (Funnels)
// ============================================

export { 
  CircleEngine, 
  BroadcastEngine, 
  IntelligenceEngine,
  getCircleEngine,
  getBroadcastEngine,
  getIntelligenceEngine,
} from './EngagementHub';

// ============================================
// ONBOARDING SERVICE (CRM Gatekeeper)
// ============================================

export { 
  OnboardingService, 
  getOnboardingService 
} from './OnboardingService';

// ============================================
// CRON SERVICE (Automation)
// ============================================

export { 
  CronService,
  FLOOR_PRICE,
  RESET_THRESHOLD,
  ACQUISITION_HOURS,
  BRIAN_LAB_ACCOUNT 
} from './CronService';

// ============================================
// PHOTO BATTLE (Hot or Not Module)
// ============================================

export {
  PhotoBattleEngine,
  getPhotoBattleEngine,
} from './PhotoBattle';

// ============================================
// SATOSHI GHOST (Gossip Protocol)
// ============================================

export {
  SatoshiGhost,
  getSatoshiGhost,
} from './SatoshiGhost';

// ============================================
// UI COMPONENTS
// ============================================

export { NovusferreBanner } from './NovusferreBanner';
export { StageOverlay, type NaughtyGift } from './StageOverlay';
export { SocialDiscoveryFeed, MOCK_CREATORS, type CreatorProfile, type VoteResult } from './SocialDiscoveryFeed';
