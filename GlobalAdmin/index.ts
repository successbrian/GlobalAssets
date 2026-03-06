/**
 * GLOBAL ADMIN - INDEX
 * Empire-Wide Administration & Security
 * 
 * Merged: GlobalSecurity → GlobalAdmin
 */

// ============================================
// ADMIN TYPES
// ============================================

export interface EmpireAdmin {
  id: string;
  email: string;
  role: AdminRole;
  sites_access: string[];
  permissions: AdminPermission[];
  created_at: string;
  last_login: string;
}

export type AdminRole = 'super_admin' | 'site_admin' | 'moderator' | 'viewer';

export type AdminPermission = 
  | 'view_dashboard'
  | 'manage_users'
  | 'ban_users'
  | 'manage_assets'
  | 'view_analytics'
  | 'manage_settings'
  | 'execute_order_66';

// ============================================
// BAN Hammer TYPES
// ============================================

export interface BanRequest {
  user_id: string;
  ban_reason: string;
  ban_duration: 'permanent' | '7d' | '30d' | '100y';
  execute_empire_wide: boolean; // Order 66 flag
  sites_to_ban?: string[]; // If empire-wide, all sites
}

export interface BanResult {
  success: boolean;
  sites_banned: number;
  errors: string[];
}

// ============================================
// SITE HEALTH TYPES
// ============================================

export interface SiteHealth {
  site_id: string;
  site_name: string;
  status: 'healthy' | 'degraded' | 'down';
  database_connected: boolean;
  last_health_check: string;
  metrics: {
    active_users_24h: number;
    total_users: number;
    posts_24h: number;
    revenue_24h: number;
  };
}

// ============================================
// AUDIT LOG TYPES
// ============================================

export interface AuditLog {
  id: string;
  admin_id: string;
  action: string;
  target_user_id?: string;
  site_id: string;
  metadata: Record<string, unknown>;
  ip_address: string;
  created_at: string;
}

// ============================================
// EMPIRE STATS TYPES
// ============================================

export interface EmpireStats {
  total_users: number;
  total_sites: number;
  total_assets: number;
  total_volume_24h: number;
  healthiest_site: string;
  newest_site: string;
  site_breakdown: SiteHealth[];
}
