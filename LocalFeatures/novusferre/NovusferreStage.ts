/**
 * GLOBAL ASSETS - NOVASFERRE STAGE
 * Live Streaming Platform Logic
 * 
 * Features:
 * - No entry fee (stage_entry_fee = 0)
 * - No credit check for starting stream
 * - 60% burn of all gift revenue to VextorGrid_Burn_Account
 * - Live jitter on gifts (EmpireEngine.applyStageJitter)
 * - Heat meter tracking
 */

import { EmpireEngine } from './EmpireEngine';
import { WalletBank } from './WalletBank';

// ============================================
// STAGE CONFIGURATION
// ============================================

export interface StageConfig {
  entryFee: number;           // 0 = FREE ENTRY
  maxDuration: number;        // Max stream duration in minutes
  minCreatorPrice: number;    // Minimum price to start stage
  voteCost: number;           // 0.10 Credits per vote
  burnPercentage: number;     // 0.60 = 60% to burn
  burnWallet: string;        // VextorGrid_Burn_Account
}

export const STAGE_CONFIG: StageConfig = {
  entryFee: 0,                    // FREE ENTRY - No credit check
  maxDuration: 240,               // 4 hours max
  minCreatorPrice: 0,             // Any creator can start (no minimum)
  voteCost: 0.10,                 // 0.10 Credits per vote
  burnPercentage: 0.60,           // 60% BURN
  burnWallet: 'VextorGrid_Burn_Account',
};

// ============================================
// STAGE STATE
// ============================================

export interface StageSession {
  id: string;
  creatorId: string;
  creatorName: string;
  startedAt: string;
  isLive: boolean;
  heatLevel: number;         // 0-100
  giftRevenue: number;        // Total from gifts
  voteCount: number;
  burnTotal: number;          // Total burned
  status: 'active' | 'ended' | 'paused';
}

export interface StageGift {
  id: string;
  sessionId: string;
  senderId: string;
  giftType: string;
  quantity: number;
  amount: number;
  burnAmount: number;
  jitterApplied: boolean;
  timestamp: string;
}

// ============================================
// STAGE ENGINE
// ============================================

export class NovusferreStage {
  
  /**
   * Start a new stage session
   * NO ENTRY FEE - NO CREDIT CHECK
   */
  static async startStage(
    creatorId: string,
    creatorName: string,
    currentPrice: number
  ): Promise<StageSession> {
    // No entry fee validation - FREE ENTRY
    // No credit check
    
    const session: StageSession = {
      id: `stage_${Date.now()}_${creatorId}`,
      creatorId,
      creatorName,
      startedAt: new Date().toISOString(),
      isLive: true,
      heatLevel: 0,
      giftRevenue: 0,
      voteCount: 0,
      burnTotal: 0,
      status: 'active',
    };

    // Announce via SatoshiGhost
    await this.announceStageStart(creatorName, currentPrice);

    return session;
  }

  /**
   * Process a gift during live stage
   * Applies jitter and burns 60%
   */
  static async processGift(
    session: StageSession,
    senderId: string,
    giftType: string,
    giftPrice: number,
    quantity: number
  ): Promise<{ success: boolean; newHeat: number; jitterAmount: number }> {
    const totalAmount = giftPrice * quantity;
    const burnAmount = totalAmount * STAGE_CONFIG.burnPercentage;
    const creatorShare = totalAmount - burnAmount;

    // Calculate jitter (increases with gift value)
    const jitterPercent = this.calculateJitter(giftPrice);
    const jitterAmount = creatorShare * jitterPercent;

    // Apply jitter via EmpireEngine
    await EmpireEngine.applyStageJitter(session.creatorId, jitterPercent);

    // Burn 60% to VextorGrid_Burn_Account
    await this.executeBurn(burnAmount);

    // Update session
    session.giftRevenue += creatorShare;
    session.burnTotal += burnAmount;
    session.heatLevel = Math.min(100, session.heatLevel + (jitterPercent * 100));

    return {
      success: true,
      newHeat: session.heatLevel,
      jitterAmount,
    };
  }

  /**
   * Process a vote (0.10 Credits)
   */
  static async processVote(session: StageSession, voterId: string): Promise<{ success: boolean; newHeat: number }> {
    // Deduct 0.10 Credits from voter
    const deductionSuccess = await WalletBank.debit(voterId, STAGE_CONFIG.voteCost, 'Stage Vote');
    
    if (!deductionSuccess) {
      return { success: false, newHeat: session.heatLevel };
    }

    session.voteCount += 1;
    session.heatLevel = Math.min(100, session.heatLevel + 2); // Small heat boost

    return { success: true, newHeat: session.heatLevel };
  }

  /**
   * End stage session
   */
  static async endStage(session: StageSession): Promise<StageSession> {
    session.isLive = false;
    session.status = 'ended';
    
    // Final gossip announcement
    await this.announceStageEnd(session);

    return session;
  }

  /**
   * Calculate jitter percentage based on gift price
   */
  static calculateJitter(giftPrice: number): number {
    // Higher gifts = more jitter
    if (giftPrice >= 1000) return 0.50;  // 50%
    if (giftPrice >= 500) return 0.40;   // 40%
    if (giftPrice >= 250) return 0.30;    // 30%
    if (giftPrice >= 100) return 0.20;    // 20%
    if (giftPrice >= 50) return 0.12;     // 12%
    if (giftPrice >= 25) return 0.08;     // 8%
    return 0.02;                          // 2%
  }

  /**
   * Execute burn to VextorGrid_Burn_Account
   */
  static async executeBurn(amount: number): Promise<boolean> {
    // In production, this would transfer to the burn wallet
    console.log(`[BURN] ${amount.toFixed(2)} sent to ${STAGE_CONFIG.burnWallet}`);
    
    // Update burn ledger
    // await LedgerTransaction.transferToBurn(amount, STAGE_CONFIG.burnWallet);
    
    return true;
  }

  /**
   * Announce stage start via SatoshiGhost
   */
  static async announceStageStart(creatorName: string, currentPrice: number): Promise<void> {
    const gossip = `🎤 The Novusferre Stage is wide open tonight! ${creatorName} just hopped on for FREE, but the crowd is making them rich with gifts. Who's next?`;
    
    console.log(`[SatoshiGhost] ${gossip}`);
    // await SatoshiGhost.publish(gossip);
  }

  /**
   * Announce stage end via SatoshiGhost
   */
  static async announceStageEnd(session: StageSession): Promise<void> {
    const heatStatus = session.heatLevel > 70 ? '🔥 RED HOT' : session.heatLevel > 40 ? '🌡️ WARM' : '❄️ COOL';
    const gossip = `📴 ${session.creatorName}'s stage has ended with ${session.voteCount} votes and ${session.heatLevel.toFixed(0)}% heat. ${heatStatus} - ${session.giftRevenue.toFixed(2)} in gifts collected!`;
    
    console.log(`[SatoshiGhost] ${gossip}`);
    // await SatoshiGhost.publish(gossip);
  }

  /**
   * Get heat meter color based on level
   */
  static getHeatColor(heatLevel: number): string {
    if (heatLevel > 70) return '#ff4444';      // Red
    if (heatLevel > 50) return '#ff6600';      // Orange
    if (heatLevel > 30) return '#ff9900';      // Yellow-Orange
    if (heatLevel > 10) return '#00cc66';      // Green
    return '#00ff88';                           // Bright Green
  }

  /**
   * Get heat emoji based on level
   */
  static getHeatEmoji(heatLevel: number): string {
    if (heatLevel > 70) return '🔥';           // On Fire
    if (heatLevel > 50) return '🌡️';           // Heating Up
    if (heatLevel > 30) return '☀️';           // Warm
    if (heatLevel > 10) return '🌤️';          // Mild
    return '❄️';                                // Cold
  }
}

// ============================================
// GIFT TYPES
// ============================================

export const STAGE_GIFTS = [
  { id: 'flame', name: 'Flame Kiss', price: 5, jitter: 0.02 },
  { id: 'lingerie', name: 'Lingerie Set', price: 15, jitter: 0.05 },
  { id: 'champagne', name: 'Bubble Bath', price: 25, jitter: 0.08 },
  { id: 'diamonds', name: 'Diamond Choker', price: 50, jitter: 0.12 },
  { id: 'heels', name: 'Sky Heels', price: 75, jitter: 0.15 },
  { id: 'pole', name: 'Pole Dance', price: 100, jitter: 0.20 },
  { id: 'masks', name: 'Venetian Masks', price: 150, jitter: 0.25 },
  { id: 'crown', name: 'Diamond Crown', price: 250, jitter: 0.30 },
  { id: 'limo', name: 'Limo Ride', price: 500, jitter: 0.40 },
  { id: 'private', name: 'Private Show', price: 1000, jitter: 0.50 },
];
