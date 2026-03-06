/**
 * GlobalAssets - Shared Code for Ecosystem Sites
 * 
 * This is the central repository for code shared across all ecosystem sites.
 * Import from here or add @successbrian/global-assets to package.json.
 * 
 * Exported modules:
 * - utils/fingerprint - Browser fingerprinting
 * - utils/analytics - GA4 analytics
 * 
 * Usage:
 *   import { fingerprint } from '@successbrian/global-assets'
 *   import { initAnalytics } from '@successbrian/global-assets'
 */

// Re-export all modules for convenient importing
export * from './utils/fingerprint';
export * from './utils/analytics';
