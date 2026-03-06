/**
 * EMPIRE ENGINE - INDEX
 * Game Rules & Logic Layer
 * 
 * "The rules of engagement. Pets, Agents, and exclusive ownership."
 * 
 * Architecture:
 * - This module contains GAME LOGIC only
 * - Balance updates are REQUESTED from MultiSiteEconomy
 * - No wallet/ledger code exists in this module
 */

// Types
export * from './types';

// Core Engines
export * from './PetEngine';
export * from './ValuationEngine';

// Re-export constants for convenience
export { 
  WHALE_PORTFOLIO_YIELDS,
  SALE_SPLITS, 
  INACTIVITY_THRESHOLDS,
  TIME_FILTER_HOURS,
  COMMUNITY_TIERS,
} from '../MultiSiteEconomy/constants';
