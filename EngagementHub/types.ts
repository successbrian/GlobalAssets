/**
 * ENGAGEMENT HUB - TYPES
 * Shoutouts, Ghost Posts, & Engagement Types
 * 
 * NOTE: OracleInsight is defined in EmpireEngine/types.ts
 * Import from there to avoid duplication.
 */

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
// CIRCLE TYPES (From CircleService)
// ============================================

export type TimeFilter = 1 | 2 | 4 | 12 | 24 | 48 | 72 | 96;

export interface Circle {
  id: string;
  user_id: string;
  site_id: string;
  name: string;
  time_filter: TimeFilter;
  tags: string[];
  user_ids: string[];
  created_at: string;
  updated_at: string;
}

export const TIME_FILTERS: { value: TimeFilter; label: string }[] = [
  { value: 1, label: '1 hour' },
  { value: 2, label: '2 hours' },
  { value: 4, label: '4 hours' },
  { value: 12, label: '12 hours' },
  { value: 24, label: '24 hours' },
  { value: 48, label: '48 hours' },
  { value: 72, label: '72 hours' },
  { value: 96, label: '96 hours' },
];

// ============================================
// COMMUNITY TYPES (From CommunityService)
// ============================================

export type CommunityTier = 'free' | 'growth' | 'pro';

export interface Community {
  id: string;
  creator_id: string;
  site_id: string;
  name: string;
  description: string;
  slug: string;
  tier: CommunityTier;
  is_private: boolean;
  monthly_posts_used: number;
  monthly_posts_reset_at: string;
  cover_image: string | null;
  member_count: number;
  created_at: string;
  updated_at: string;
}

export interface CommunityMembership {
  id: string;
  community_id: string;
  user_id: string;
  role: 'member' | 'moderator' | 'admin';
  joined_at: string;
}

export interface TierLimits {
  free: { postsPerMonth: number; price: number };
  growth: { postsPerMonth: number; price: number };
  pro: { postsPerMonth: number; price: number };
}

export const TIER_LIMITS: TierLimits = {
  free: { postsPerMonth: 60, price: 0 },
  growth: { postsPerMonth: 600, price: 9.95 },
  pro: { postsPerMonth: -1, price: 19.95 },
};
