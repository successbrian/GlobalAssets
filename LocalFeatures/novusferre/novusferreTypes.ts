/**
 * NOVUSFERRE - TYPES & CONSTANTS
 * Sovereign Financial-Social Hybrid Platform
 * 
 * "Iron. Wheat. Empire."
 */

// ============================================
// ENUMS
// ============================================

export enum WALLET_TYPE {
  STANDARD = 'STANDARD',     // Type A: Full P2P, Gifts, Withdrawals
  RESTRICTED = 'RESTRICTED', // Type B: Gift Only, No P2P, No Withdrawals
}

export enum GIFT_SPLIT {
  CREATOR = 30, // 30% to creator
  OWNER = 5,    // 5% to current owner
  BRIAN = 5,    // 5% to Brian
  BURN = 60,    // 60% burned
}

export enum SALE_SPLIT {
  SELLER = 80,       // 80% to seller
  PREVIOUS_OWNER = 10, // 10% to previous owner
  PLATFORM = 10,    // 10% platform fee
}

export enum TIER {
  STANDARD = 'STANDARD',
  WHALE = 'WHALE',
  LEGENDARY = 'LEGENDARY',
}

export enum BATTLE_STATUS {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum GENDER_PREFERENCE {
  BOYS = 'BOYS',
  GIRLS = 'GIRLS',
  ALL = 'ALL',
}

export enum NOTIFICATION_TYPE {
  GIFT_SENT = 'GIFT_SENT',
  GIFT_RECEIVED = 'GIFT_RECEIVED',
  BATTLE_INVITE = 'BATTLE_INVITE',
  BATTLE_RESULT = 'BATTLE_RESULT',
  PURGE_WARNING = 'PURGE_WARNING',
  PURGE_EXECUTED = 'PURGE_EXECUTED',
  FOLLOWER_LOST = 'FOLLOWER_LOST',
  MARKET_SPIKE = 'MARKET_SPIKE',
  GRAND_ENTRY = 'GRAND_ENTRY',
  BACKSTAGE_WATCH = 'BACKSTAGE_WATCH',
  SLOW_DRIP = 'SLOW_DRIP',
  // Stage types
  STAGE_START = 'STAGE_START',
  STAGE_HEAT = 'STAGE_HEAT',
  STAGE_ACTION = 'STAGE_ACTION',
  STAGE_END = 'STAGE_END',
  VOTE = 'VOTE',
}

export enum USER_STATUS {
  ACTIVE = 'ACTIVE',
  BACKSTAGE = 'BACKSTAGE', // Shadow Lab - not public
  PURGED = 'PURGED',       // Fully vaporized
  SUSPENDED = 'SUSPENDED',
}

// ============================================
// CORE INTERFACES
// ============================================

export interface Asset {
  id: string;
  owner_id: string;
  creator_id: string;
  name: string;
  type: 'supporter' | 'premium' | 'exclusive' | 'legendary';
  current_price: number;
  base_price: number;
  market_jitter: number;
  floor_price: number;
  tier: TIER;
  acquisition_clock: number; // Hours at floor
  lab_timer_start: string | null;
  is_vaporized: boolean;
  is_locked: boolean;
  is_lab_owned: boolean;
  is_public: boolean;
  is_banned: boolean;
  status: USER_STATUS;
  last_price_update: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  wallet_type: WALLET_TYPE;
  wallet_balance: number;
  credits_balance: number;
  total_spent: number;
  total_earned: number;
  followers_count: number;
  following_count: number;
  is_verified: boolean;
  is_backstage: boolean; // Creator starts in Backstage Lounge
  crm_contact_id: string | null;
  agent_id: string | null;
  gender_preference: GENDER_PREFERENCE;
  platform_penalty: number; // -15% for agent history on competing platforms
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  sender_id: string;
  recipient_id: string;
  asset_id: string;
  amount: number;
  type: 'GIFT' | 'SALE' | 'PURCHASE' | 'BURN' | 'FEE';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  created_at: string;
}

export interface Gift {
  id: string;
  sender_id: string;
  recipient_id: string;
  amount: number;
  message: string | null;
  is_naughty: boolean; // High-value gift flag
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_locked: boolean; // Protected by tier
  is_read: boolean;
  expires_at: string | null;
  created_at: string;
}

export interface Circle {
  id: string;
  owner_id: string;
  name: string;
  description: string;
  is_private: boolean;
  member_count: number;
  created_at: string;
}

export interface CircleMembership {
  user_id: string;
  circle_id: string;
  joined_at: string;
  expires_at: string;
}

export interface Broadcast {
  id: string;
  sender_id: string;
  content: string;
  credits_cost: number;
  reach_count: number;
  engagement_count: number;
  created_at: string;
  expires_at: string;
}

export interface Follower {
  follower_id: string;
  following_id: string;
  created_at: string;
}

// ============================================
// BATTLE TYPES (Hot or Not Module)
// ============================================

export interface PhotoBattle {
  id: string;
  contender_1_id: string;
  contender_2_id: string;
  image_1_url: string;
  image_2_url: string;
  votes_1: number;
  votes_2: number;
  total_credits_spent: number;
  status: BATTLE_STATUS;
  winner_id: string | null;
  started_at: string;
  ended_at: string | null;
  market_jitter_applied: boolean;
}

export interface BattleVote {
  id: string;
  battle_id: string;
  voter_id: string;
  voted_for_id: string;
  credits_spent: number;
  created_at: string;
}

// ============================================
// GHOST NOTIFICATION TYPES
// ============================================

export interface GhostNotification {
  id: string;
  type: NOTIFICATION_TYPE;
  title: string;
  content: string;
  tone: 'flirty' | 'tabloid' | 'cheeky' | 'urgent' | 'slow_drip';
  target_audience: 'all' | 'creators' | 'specific_user';
  specific_user_id?: string;
  is_public: boolean;
  created_at: string;
}

export interface GhostMessage {
  id: string;
  notification_id: string;
  recipient_id: string;
  is_read: boolean;
  created_at: string;
}

// ============================================
// BACKSTAGE LOUNGE TYPES
// ============================================

export interface BackstageEntry {
  user_id: string;
  reason: 'creator_onboarding' | 'floor_seizure' | 'manual' | 'purge_pending';
  entered_at: string;
  release_date: string | null;
  is_purge_pending: boolean;
  days_until_purge: number;
}

export interface VaporizationRecord {
  id: string;
  user_id: string;
  reason: 'floor_acquisition' | 'manual' | 'timeout';
  followers_deleted: number;
  messages_deleted: number;
  ownership_transferred_to: string;
  executed_by: 'cron' | 'admin';
  executed_at: string;
  notes: string | null;
}

// ============================================
// ONBOARDING TYPES
// ============================================

export interface OnboardingAgreement {
  user_id: string;
  agreed_to_purge_14day: boolean;
  agreed_to_lease_90day: boolean;
  agreed_to_backstage: boolean; // For creators
  signature: string;
  agreed_at: string;
}

export interface CRMContact {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  source: 'novusferre_signup' | 'referral' | 'manual';
  status: 'new' | 'contacted' | 'qualified' | 'converted';
  assigned_agent_id: string | null;
  created_at: string;
}

// ============================================
// DASHBOARD TYPES
// ============================================

export interface EmpireDashboard {
  total_users: number;
  total_assets: number;
  total_volume_24h: number;
  total_burn_24h: number;
  active_battles: number;
  purge_pending_count: number;
  backstage_count: number;
  recent_gifts: Gift[];
  top_performers: Asset[];
}

export interface BrianLabDashboard {
  total_seized: number;
  pending_clock: number;
  recently_seized: any[];
  today_seized: number;
  total_followers_deleted: number;
  total_messages_deleted: number;
}

// ============================================
// CONSTANTS
// ============================================

export const CONSTANTS = {
  // Wallet
  MIN_WITHDRAWAL: 10.00,
  MAX_DAILY_WITHDRAWAL: 1000.00,
  
  // Pricing
  PRICE_JITTER_MIN: 0.01,
  PRICE_JITTER_MAX: 0.50,
  BATTLE_VOTE_COST: 0.10,
  BROADCAST_COST: 100,
  
  // Splits (as percentages)
  CREATOR_FEE: 30,
  OWNER_FEE: 5,
  BRIAN_FEE: 5,
  PLATFORM_FEE: 10,
  BURN_PERCENTAGE: 60,
  
  // Tiers
  STANDARD_YIELD: 0.05,
  WHALE_YIELD: 0.10,
  LEGENDARY_YIELD: 0.15,
  
  // Floor Logic
  FLOOR_PRICE: 5.00,
  RESET_THRESHOLD: 8.00,
  ACQUISITION_HOURS: 336, // 14 days × 24 hours
  
  // Engagement
  BROADCAST_COOLDOWN_DAYS: 7,
  CIRCLE_RETENTION_DAYS: 90,
  MESSAGE_PURGE_DAYS: 14,
  
  // Intelligence
  IDENTITY_REVEAL_COST: 2, // Credits to reveal owner identity
  
  // Accounts
  BRIAN_LAB_ACCOUNT: 'BRIAN_LAB_MASTER',
  BRIAN_ADMIN_ID: 'BRIAN_ADMIN',
} as const;

// ============================================
// TYPE ALIASES
// ============================================

export type JitterAmount = typeof CONSTANTS.PRICE_JITTER_MIN | typeof CONSTANTS.PRICE_JITTER_MAX;
export type YieldPercentage = typeof CONSTANTS.STANDARD_YIELD | typeof CONSTANTS.WHALE_YIELD | typeof CONSTANTS.LEGENDARY_YIELD;
