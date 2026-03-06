/**
 * PET MARKET TYPES - V3: Exclusive Ownership & Price Decay
 * 
 * "Human assets are the new currency. Exclusive ownership enforced."
 */

export interface HumanAsset {
  // Identity
  id: string;                    // The User's UUID
  display_name: string;
  avatar_url: string;
  
  // EXCLUSIVE OWNERSHIP (Off-Market)
  owner_id: string | null;       // If set, they are OFF MARKET - EXCLUSIVE OWNERSHIP
  owner_name: string | null;     // Display name of owner
  
  // LISTING STATUS
  is_for_sale: boolean;          // Only true if Owner explicitly lists them
  
  // THE AGENT SYSTEM (Permanent Recruiter)
  agent_id: string | null;       // Permanent recruiter ID
  agent_name: string | null;     // Name of recruiter who onboarded them
  
  // THE DECAY ENGINE
  consistency_score: number;     // 0-100 (Daily Activity based)
  last_active_at: string;         // ISO timestamp of last activity
  market_valuation: number;       // The calculated price (base + decay)
  
  // METADATA
  owned_since?: string;          // ISO date when acquired
  acquisition_price?: number;     // Price paid for this asset
  
  // TIMESTAMPS
  created_at: string;
  updated_at: string;
}

export interface PetTradeResult {
  success: boolean;
  asset: HumanAsset;
  new_owner_id: string;
  transaction_hash?: string;
  price_paid?: number;
  error?: string;
}

export interface PortfolioSummary {
  total_assets: number;
  net_worth: number;
  total_dividends: number;
  avg_consistency_score: number;
  owned_count: number;
  listed_count: number;
}

export interface AssetValuation {
  base_price: number;
  decay_multiplier: number;
  final_price: number;
  days_dormant: number;
  consistency_score: number;
  is_for_sale: boolean;
  owner_id: string | null;
}

// ============================================
// VEXTORGRID MIGRATION TYPES (Legacy Support)
// ============================================
// These map to the existing VextorGrid shoutout_pets table
export interface LegacyPet {
  id: string;
  creator_id: string;
  current_owner_id: string;
  pet_name: string;
  pet_type: string;
  pet_level: number;
  owner_yield_percentage: number;
  is_invisible: boolean;
  created_at: string;
}

export interface LegacyOwnership {
  user_id: string;
  market_value: number;
  ask_price: number;
  is_for_sale: boolean;
  listed_at: string;
}
