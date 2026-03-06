/**
 * EMPIRE ENGINE - GAME RULES
 * The "Game Logic" Layer
 * 
 * "Rules of engagement. Pets, Agents, and exclusive ownership."
 * 
 * NOTE: This module REQUESTS balance updates from MultiSiteEconomy
 * but does NOT contain wallet/ledger code.
 */

import { 
  WHALE_PORTFOLIO_YIELDS,
  SALE_SPLITS, 
  INACTIVITY_THRESHOLDS 
} from '../MultiSiteEconomy/constants';

// ============================================
// PET TYPES
// ============================================

export interface Pet {
  id: string;
  user_id: string;
  site_id: string;
  name: string;
  type: 'supporter' | 'titan';
  level: number;
  xp: number;
  xp_to_next_level: number;
  hunger: number;
  max_hunger: number;
  mood: 'happy' | 'neutral' | 'sad' | 'excited';
  avatar_url?: string;
  last_fed?: string;
  tier: PetTier;
  owner_yield_percentage: number;
  is_invisible: boolean;
  created_at: string;
  updated_at: string;
}

export type PetTier = keyof typeof WHALE_PORTFOLIO_YIELDS;

export interface PetStats {
  totalXp: number;
  shoutoutsSent: number;
  daysActive: number;
  achievements: string[];
}

// ============================================
// HUMAN ASSET TYPES (Exclusive Ownership)
// ============================================

export interface HumanAsset {
  // Identity
  id: string;
  display_name: string;
  avatar_url: string;
  
  // EXCLUSIVE OWNERSHIP
  owner_id: string | null;  // If set, OFF MARKET
  owner_name: string | null;
  
  // LISTING STATUS
  is_for_sale: boolean;
  
  // AGENT SYSTEM (Permanent Recruiter)
  agent_id: string | null;
  agent_name: string | null;
  
  // DECAY ENGINE
  consistency_score: number;
  last_active_at: string;
  market_valuation: number;
  
  // METADATA
  owned_since?: string;
  acquisition_price?: number;
  
  // SITE
  site_id: string;
  
  created_at: string;
  updated_at: string;
}

// ============================================
// AGENT TYPES
// ============================================

export interface Agent {
  id: string;
  user_id: string;
  site_id: string;
  tier: AgentTier;
  recruits_count: number;
  total_recruits_value: number;
  commission_rate: number;
  created_at: string;
}

export type AgentTier = 'junior' | 'senior' | 'master' | 'legendary';

// ============================================
// BROADCAST TYPES
// ============================================

export interface Broadcast {
  id: string;
  sender_id: string;
  site_id: string;
  content: string;
  recipients_count: number;
  delivery_rate: number;
  cost: number;
  sent_at: string;
}

export interface BroadcastReceipt {
  broadcast_id: string;
  recipient_id: string;
  status: 'delivered' | 'read' | 'dismissed';
  received_at: string;
}

// ============================================
// TICKET TYPES
// ============================================

export interface DiscountTicket {
  id: string;
  user_id: string;
  site_id: string;
  discount_percentage: number;
  valid_until: string;
  is_used: boolean;
  used_at?: string;
  created_at: string;
}

// ============================================
// PORTFOLIO TYPES
// ============================================

export interface PortfolioSummary {
  user_id: string;
  site_id: string;
  total_assets: number;
  pets: number;
  human_assets: number;
  net_worth: number;
  total_dividends: number;
  avg_consistency_score: number;
  tier: PetTier;
  tier_progress: number;
}

// ============================================
// GAME EVENT TYPES
// ============================================

export interface GameEvent {
  id: string;
  site_id: string;
  event_type: string;
  user_id: string;
  asset_id?: string;
  metadata: Record<string, unknown>;
  xp_gained?: number;
  created_at: string;
}

// ============================================
// ORACLE INTEGRATION TYPES
// ============================================

export interface OracleInsight {
  id: string;
  site_id: string;
  insight_type: 'trend' | 'prediction' | 'alert';
  confidence: number;
  content: string;
  related_tags: string[];
  expires_at: string;
}

// ============================================
// BALANCE REQUEST TYPES (For MultiSiteEconomy)
// ============================================

export interface BalanceUpdateRequest {
  user_id: string;
  site_id: string;
  amount: number;
  reason: string;
  reference_id?: string;
}

export interface BalanceUpdateResult {
  success: boolean;
  new_balance?: number;
  transaction_id?: string;
  error?: string;
}
