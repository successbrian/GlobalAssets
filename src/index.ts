/**
 * GlobalAssets - Shared Code for Ecosystem Sites
 * 
 * This is the central repository for code shared across all ecosystem sites.
 * Import from here or add @successbrian/global-assets to package.json.
 * 
 * Exported modules:
 * - lib/ecosystemAuth - Unified authentication
 * - utils/fingerprint - Browser fingerprinting
 * - utils/analytics - GA4 analytics
 * - hooks/useUnifiedAuth - React auth hook
 * 
 * Usage:
 *   import { ecosystemSignup } from '@successbrian/global-assets'
 *   import { useUnifiedAuth } from '@successbrian/global-assets'
 */

// Re-export all modules for convenient importing
export * from './lib/ecosystemAuth';
export * from './utils/fingerprint';
export * from './utils/analytics';
export { useUnifiedAuth, type UnifiedAuthState, type UseUnifiedAuthOptions } from './hooks/useUnifiedAuth';
