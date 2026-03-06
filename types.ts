/**
 * GLOBAL ASSETS - SHARED TYPES
 * The Contract Between Empire Sites
 * 
 * "Ensures Novusferre and VextorGrid speak the same language."
 */

// ============================================
// PET TYPES
// ============================================
export interface Pet {
  id: string;
  user_id: string;
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
  created_at: string;
}

export interface PetStats {
  totalXp: number;
  shoutoutsSent: number;
  daysActive: number;
  achievements: string[];
}

export type PetMood = Pet['mood'];
export type PetType = Pet['type'];

// ============================================
// SHOUTOUT TYPES
// ============================================
export interface Shoutout {
  id: string;
  content: string;
  ghost_signature: string;
  tropes: string[];
  site_origin: string;
  sender_name?: string;
  amount_paid?: number;
  created_at: string;
}

export type ShoutoutTrope = 'fired' | 'clown' | 'genuine' | 'hype' | 'roast' | 'mystery';

// ============================================
// USER TYPES
// ============================================
export interface EmpireUser {
  id: string;
  email?: string;
  whatsapp?: string;
  contact_id: string;
  supabase_id: string;
  enterprise_tags: string[];
  created_at: string;
  updated_at: string;
}

// ============================================
// TRANSACTION TYPES
// ============================================
export interface Transaction {
  id: string;
  user_id: string;
  type: 'payment' | 'refund' | 'shoutout' | 'subscription';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  tx_hash?: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

// ============================================
// SITE TYPES
// ============================================
export interface EmpireSite {
  id: string;
  name: string;
  type: 'ASSET_LAYER' | 'LABOR_LAYER' | 'SOCIAL_LAYER' | 'COMMERCE' | 'INFRASTRUCTURE' | 'INTELLIGENCE';
  db_url_env: string;
  key_env: string;
  created_at: string;
}

// ============================================
// ORACLE DB TABLES
// ============================================
export const ORACLE_TABLES = {
  GLOBAL_PET_REGISTRY: 'global_pet_registry',
  GLOBAL_SHOUTOUT_LOG: 'global_shoutout_log',
  GLOBAL_USER_REGISTRY: 'global_user_registry',
  GLOBAL_TRANSACTIONS: 'global_transactions',
  EMPIRE_SITES: 'empire_sites',
} as const;
