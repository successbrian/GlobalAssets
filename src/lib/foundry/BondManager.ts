/**
 * BondManager.ts - Bond Locking & Staking Rewards Manager
 * 
 * Features:
 * - Tracks founder bond locks (365 days)
 * - Auto-compounds staking rewards while locked
 * - Slash detection and governance integration
 * - Bond status queries
 * 
 * @satoshihost: "The Founder's Bond is non-negotiable. It filters out the scammers."
 */

import { ethers } from 'ethers';

// ABI fragments for the Launchpad contract
const LAUNCHPAD_ABI = [
  "function founderBonds(address) view returns (address founder, uint256 amountLocked, uint256 lockStartTime, uint256 unlockTime, bool isSlashed, uint256 totalRewardsEarned)",
  "function unlockBond()",
  "function getBondInfo(address) view returns (uint256 amountLocked, uint256 unlockTime, bool isSlashed, uint256 daysRemaining)"
];

const CVTR_STAKING_ABI = [
  "function getStakingBalance(address) view returns (uint256)",
  "function claimRewards()"
];

// Configuration
const BOND_LOCK_PERIOD_DAYS = 365;
const MIN_BOND_AMOUNT = 1000; // $CVTR

export interface FounderBond {
  founder: string;
  amountLocked: number;
  lockStartTime: Date;
  unlockTime: Date;
  isSlashed: boolean;
  totalRewardsEarned: number;
  daysRemaining: number;
  isEligibleToUnlock: boolean;
}

export interface BondStats {
  totalBondsActive: number;
  totalValueLocked: number;
  totalRewardsDistributed: number;
  slashedBondsCount: number;
}

export class BondManager {
  private provider: ethers.providers.Provider;
  private launchpadAddress: string;
  private stakingAddress: string;
  private cvtrAddress: string;
  
  constructor(
    provider: ethers.providers.Provider,
    launchpadAddress: string,
    stakingAddress: string,
    cvtrAddress: string
  ) {
    this.provider = provider;
    this.launchpadAddress = launchpadAddress;
    this.stakingAddress = stakingAddress;
    this.cvtrAddress = cvtrAddress;
  }
  
  /**
   * Get bond information for a founder
   */
  async getBondInfo(founderAddress: string): Promise<FounderBond> {
    try {
      const contract = new ethers.Contract(
        this.launchpadAddress,
        LAUNCHPAD_ABI,
        this.provider
      );
      
      const [amountLocked, unlockTime, isSlashed, daysRemaining] = await contract.getBondInfo(founderAddress);
      const bondData = await contract.founderBonds(founderAddress);
      
      const now = Math.floor(Date.now() / 1000);
      const isEligible = !isSlashed && now >= parseInt(unlockTime.toString());
      
      return {
        founder: founderAddress,
        amountLocked: parseFloat(ethers.utils.formatEther(amountLocked)),
        lockStartTime: new Date(parseInt(bondData.lockStartTime.toString()) * 1000),
        unlockTime: new Date(parseInt(unlockTime.toString()) * 1000),
        isSlashed,
        totalRewardsEarned: parseFloat(ethers.utils.formatEther(bondData.totalRewardsEarned)),
        daysRemaining: parseInt(daysRemaining.toString()),
        isEligibleToUnlock: isEligible
      };
    } catch (error) {
      console.error('[BondManager] Error fetching bond info:', error);
      throw error;
    }
  }
  
  /**
   * Calculate expected rewards for a bond period
   */
  async calculateExpectedRewards(
    bondAmount: number,
    apy: number = 22.5, // Default CVTR APY
    daysLocked: number = BOND_LOCK_PERIOD_DAYS
  ): Promise<number> {
    // Daily rate = APY / 365
    const dailyRate = apy / 365 / 100;
    
    // Compound daily for the lock period
    const compoundedAmount = bondAmount * Math.pow(1 + dailyRate, daysLocked);
    
    return compoundedAmount - bondAmount;
  }
  
  /**
   * Get bond statistics for the entire ecosystem
   */
  async getBondStats(): Promise<BondStats> {
    try {
      // This would query events in production
      // For now, return mock data structure
      return {
        totalBondsActive: 42,
        totalValueLocked: 42000, // 42,000 $CVTR
        totalRewardsDistributed: 3150, // 3,150 $CVTR
        slashedBondsCount: 2
      };
    } catch (error) {
      console.error('[BondManager] Error fetching stats:', error);
      throw error;
    }
  }
  
  /**
   * Check if address has an active bond
   */
  async hasActiveBond(founderAddress: string): Promise<boolean> {
    try {
      const bond = await this.getBondInfo(founderAddress);
      return bond.amountLocked > 0 && !bond.isSlashed;
    } catch {
      return false;
    }
  }
  
  /**
   * Get bond unlock eligibility
   */
  async canUnlock(founderAddress: string): Promise<{
    canUnlock: boolean;
    reason: string;
    unlockTime?: Date;
  }> {
    const bond = await this.getBondInfo(founderAddress);
    
    if (bond.amountLocked === 0) {
      return { canUnlock: false, reason: 'No active bond found' };
    }
    
    if (bond.isSlashed) {
      return { canUnlock: false, reason: 'Bond has been slashed' };
    }
    
    if (bond.daysRemaining > 0) {
      return {
        canUnlock: false,
        reason: `Bond locked for ${bond.daysRemaining} more days`,
        unlockTime: bond.unlockTime
      };
    }
    
    return { canUnlock: true, reason: 'Bond eligible for unlock', unlockTime: bond.unlockTime };
  }
  
  /**
   * Format bond status for display
   */
  formatBondStatus(bond: FounderBond): string {
    if (bond.isSlashed) {
      return '⚠️ SLASHED';
    }
    
    if (bond.daysRemaining === 0) {
      return '🔓 UNLOCK READY';
    }
    
    const days = bond.daysRemaining;
    if (days > 30) {
      return `🔒 LOCKED (${Math.floor(days / 30)} months left)`;
    }
    
    return `🔒 LOCKED (${days} days left)`;
  }
  
  /**
   * Get bond progress percentage
   */
  getLockProgress(bond: FounderBond): number {
    const now = Date.now();
    const start = bond.lockStartTime.getTime();
    const end = bond.unlockTime.getTime();
    
    if (now >= end) return 100;
    if (now <= start) return 0;
    
    return ((now - start) / (end - start)) * 100;
  }
  
  /**
   * Create bond unlock transaction
   */
  async createUnlockTransaction(wallet: ethers.Wallet): Promise<ethers.Transaction> {
    const contract = new ethers.Contract(
      this.launchpadAddress,
      LAUNCHPAD_ABI,
      wallet
    );
    
    const tx = await contract.unlockBond();
    return tx;
  }
  
  /**
   * Validate if user can create a project (has bond)
   */
  async validateBondEligibility(founderAddress: string): Promise<{
    eligible: boolean;
    bond?: FounderBond;
    error?: string;
  }> {
    try {
      const bond = await this.getBondInfo(founderAddress);
      
      if (bond.amountLocked === 0) {
        return {
          eligible: false,
          error: 'No founder bond found. Please deposit 1,000 $CVTR to create a project.'
        };
      }
      
      if (bond.isSlashed) {
        return {
          eligible: false,
          bond,
          error: 'Your bond has been slashed due to governance action.'
        };
      }
      
      return { eligible: true, bond };
    } catch (error) {
      return {
        eligible: false,
        error: 'Error checking bond eligibility'
      };
    }
  }
  
  /**
   * Get all bonds for governance dashboard
   */
  async getGovernanceDashboard(founders: string[]): Promise<FounderBond[]> {
    const bonds: FounderBond[] = [];
    
    for (const founder of founders) {
      try {
        const bond = await this.getBondInfo(founder);
        bonds.push(bond);
      } catch {
        console.warn(`Could not fetch bond for ${founder}`);
      }
    }
    
    return bonds.sort((a, b) => b.amountLocked - a.amountLocked);
  }
}

export default BondManager;
