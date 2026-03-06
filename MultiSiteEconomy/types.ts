/**
 * MULTI-SITE ECONOMY - THE BANK
 * Ledger Types & Schema Definitions
 * 
 * "The Empire's Treasury. All currency flows through here."
 */

import { ORACLE_TABLES } from './constants';

// ============================================
// LEDGER TYPES
// ============================================

export interface UserBalance {
  user_id: string;
  site_id: string;
  balance: number;
  pending_credits: number;
  pending_debits: number;
  last_updated: string;
}

export interface LedgerTransaction {
  id: string;
  user_id: string;
  site_id: string;
  amount: number;
  currency: string;
  type: LedgerTransactionType;
  status: 'pending' | 'completed' | 'failed' | 'reversed';
  reference_type?: string;
  reference_id?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  completed_at?: string;
}

export type LedgerTransactionType = 
  | 'shoutout_sent'
  | 'shoutout_received'
  | 'pet_feed'
  | 'pet_reward'
  | 'asset_sale'
  | 'asset_purchase'
  | 'dividend_payout'
  | 'deposit'
  | 'withdrawal'
  | 'fee'
  | 'refund';

// ============================================
// WALLET TYPES
// ============================================

export interface Wallet {
  id: string;
  user_id: string;
  site_id: string;
  wallet_address: string | null;
  wallet_type: 'trc20' | 'erc20' | 'native';
  is_primary: boolean;
  created_at: string;
}

export interface WalletBalance {
  wallet_id: string;
  token_symbol: string;
  available_balance: number;
  locked_balance: number;
  pending_balance: number;
  updated_at: string;
}

// ============================================
// SITE ECONOMY TYPES
// ============================================

export interface SiteEconomy {
  site_id: string;
  total_users: number;
  active_users_24h: number;
  total_volume_24h: number;
  total_transactions_24h: number;
  average_transaction_value: number;
  treasury_balance: number;
  last_updated: string;
}

// ============================================
// DIVIDEND TYPES
// ============================================

export interface DividendPool {
  id: string;
  site_id: string;
  pool_address: string;
  total_amount: number;
  distribution_cycle_days: number;
  next_distribution_at: string;
  last_distribution_at: string;
  participant_count: number;
}

export interface DividendAllocation {
  id: string;
  user_id: string;
  site_id: string;
  period_start: string;
  period_end: string;
  share_percentage: number;
  amount: number;
  status: 'calculated' | 'pending' | 'distributed';
  distributed_at?: string;
}

// ============================================
// ASSET TYPES (Owned by EmpireEngine, tracked here)
// ============================================

export interface AssetOwnershipRecord {
  asset_id: string;
  asset_type: 'pet' | 'human_account' | 'business_asset';
  owner_id: string;
  site_id: string;
  acquisition_price: number;
  current_valuation: number;
  ownership_since: string;
  is_listed: boolean;
  listing_price?: number;
}

// ============================================
// ORACLE SYNC TYPES
// ============================================

export interface OracleSyncStatus {
  site_id: string;
  last_synced_at: string;
  sync_status: 'synced' | 'syncing' | 'error';
  pending_transactions: number;
  error_message?: string;
}

// ============================================
// ECONOMY EVENTS (For real-time updates)
// ============================================

export interface EconomyEvent {
  id: string;
  site_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

// ============================================
// SCHEMA REFERENCES
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
