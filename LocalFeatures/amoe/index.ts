/**
 * GLOBAL ASSETS - AMOEBRIDGE MODULE INDEX
 * VextorGrid ↔ Novusferre Cross-Site Bridge System
 * 
 * "The Amoeba stretches between two worlds, carrying life (and jackpots) between them."
 */

// ============================================
// JACKPOT TYPES
// ============================================

export interface JackpotConfig {
  megaCap: number;
  dailyCap: number;
  megaSplit: { burn: number; seed: number; rollover: number };
  dailySplit: { burn: number; seed: number; rollover: number };
}

export interface JackpotState {
  megaPool: number;
  dailyPool: number;
  isMegaActive: boolean;
  isDailyActive: boolean;
}

export interface BridgeCode {
  code: string;
  sourceSite: 'vextor' | 'novus';
  jackpotType: 'Mega' | 'Daily';
  userId: string;
  poolAmount: number;
  createdAt: string;
  expiresAt: string;
  isRedeemed: boolean;
}

export interface JackpotReceipt {
  id: string;
  userId: string;
  dateUtc: string;
  jackpotType: 'Mega' | 'Daily';
  status: 'Verified' | 'Pending' | 'Expired';
  poolAmount: number;
  siteCreated: string;
  txSignature?: string;
}

// ============================================
// CONSTANTS
// ============================================

export const JACKPOT_CONFIG: JackpotConfig = {
  megaCap: 4999.99,
  dailyCap: 999.99,
  megaSplit: { burn: 0.50, seed: 0.25, rollover: 0.25 },
  dailySplit: { burn: 0.30, seed: 0.20, rollover: 0.50 },
};

export const UTC_RESET_HOUR = 0; // 00:00 UTC

export const CODE_EXPIRY_HOURS = 24;

export const MIN_POOL_THRESHOLD = 100; // Minimum pool to generate bridge code

// ============================================
// AMOEBRIDGE FUNCTIONS
// ============================================

/**
 * Generate a unique bridge code for cross-site jackpot transfer
 */
export function generateBridgeCode(userId: string, jackpotType: 'Mega' | 'Daily'): string {
  const prefix = jackpotType === 'Mega' ? 'VG-MEGA-' : 'VG-DAILY-';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${timestamp}-${random}`;
}

/**
 * Validate a bridge code format
 */
export function validateBridgeCode(code: string): boolean {
  const megaPattern = /^VG-MEGA-[A-Z0-9]{6}-[A-Z0-9]{4}$/;
  const dailyPattern = /^VG-DAILY-[A-Z0-9]{6}-[A-Z0-9]{4}$/;
  return megaPattern.test(code) || dailyPattern.test(code);
}

/**
 * Calculate pool overflow beyond cap
 */
export function calculateOverflow(currentPool: number, jackpotType: 'Mega' | 'Daily'): number {
  const cap = jackpotType === 'Mega' ? JACKPOT_CONFIG.megaCap : JACKPOT_CONFIG.dailyCap;
  return Math.max(0, currentPool - cap);
}

/**
 * Split overflow to burn, seed, and rollover pools
 */
export function splitOverflow(amount: number, jackpotType: 'Mega' | 'Daily'): { burn: number; seed: number; rollover: number } {
  const split = jackpotType === 'Mega' ? JACKPOT_CONFIG.megaSplit : JACKPOT_CONFIG.dailySplit;
  return {
    burn: amount * split.burn,
    seed: amount * split.seed,
    rollover: amount * split.rollover,
  };
}

// ============================================
// UTC UTILITIES
// ============================================

/**
 * Get next UTC reset time
 */
export function getNextUtcReset(): Date {
  const now = new Date();
  const reset = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
  return reset;
}

/**
 * Get time until next UTC reset in milliseconds
 */
export function getTimeUntilReset(): number {
  return getNextUtcReset().getTime() - Date.now();
}

/**
 * Format milliseconds to HH:MM:SS
 */
export function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
