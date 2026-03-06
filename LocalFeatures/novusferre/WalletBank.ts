/**
 * NOVUSFERRE - WALLET BANK
 * Dual-Wallet System: Type A (Standard) vs Type B (Restricted)
 * 
 * "Trust. Iron. Empire."
 */

import { 
  WALLET_TYPE, 
  User, 
  Transaction,
  CONSTANTS 
} from './novusferreTypes';

// ============================================
// TYPES
// ============================================

interface WalletTransaction {
  id: string;
  user_id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'GIFT_SENT' | 'GIFT_RECEIVED' | 'PURCHASE' | 'BURN' | 'FEE';
  amount: number;
  currency: 'USD' | 'CREDITS';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  description: string;
  created_at: string;
}

interface Wallet {
  user_id: string;
  type: WALLET_TYPE;
  balance_usd: number;
  balance_credits: number;
  is_frozen: boolean;
  daily_withdrawal_limit: number;
  total_withdrawn_today: number;
  last_withdrawal_at: string | null;
}

interface TransferResult {
  success: boolean;
  error?: string;
  transaction_id?: string;
}

// ============================================
// DATABASE INTERFACE
// ============================================

interface Database {
  table(name: string): {
    where(col: string, val: unknown): any;
    select(...cols: string[]): any;
    update(data: Record<string, unknown>): any;
    insert(data: Record<string, unknown>): any;
    first(): any;
    count(): Promise<number>;
  };
}

// ============================================
// WALLET BANK SERVICE
// ============================================

export class WalletBank {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  /**
   * Initialize wallet for new user
   */
  async initializeWallet(userId: string, walletType: WALLET_TYPE = WALLET_TYPE.STANDARD): Promise<Wallet> {
    const wallet: Wallet = {
      user_id: userId,
      type: walletType,
      balance_usd: 0,
      balance_credits: 0,
      is_frozen: false,
      daily_withdrawal_limit: CONSTANTS.MAX_DAILY_WITHDRAWAL,
      total_withdrawn_today: 0,
      last_withdrawal_at: null,
    };

    await this.db.table('wallets').insert({
      user_id: userId,
      type: walletType,
      balance_usd: 0,
      balance_credits: 0,
      is_frozen: false,
      daily_withdrawal_limit: CONSTANTS.MAX_DAILY_WITHDRAWAL,
      total_withdrawn_today: 0,
    });

    return wallet;
  }

  /**
   * Get wallet by user ID
   */
  async getWallet(userId: string): Promise<Wallet | null> {
    const wallet = await this.db.table('wallets').where('user_id', userId).first();
    return wallet;
  }

  /**
   * Check if wallet is restricted (Type B)
   */
  async isRestricted(userId: string): Promise<boolean> {
    const wallet = await this.getWallet(userId);
    return wallet?.type === WALLET_TYPE.RESTRICTED;
  }

  /**
   * Deposit USD to wallet
   */
  async deposit(userId: string, amount: number): Promise<TransferResult> {
    if (amount <= 0) {
      return { success: false, error: 'Amount must be positive' };
    }

    await this.db.table('wallets')
      .where('user_id', userId)
      .update({ 
        balance_usd: this.db.table('wallets').select('balance_usd').where('user_id', userId).first().balance_usd + amount 
      });

    await this.recordTransaction({
      id: crypto.randomUUID(),
      user_id: userId,
      type: 'DEPOSIT',
      amount,
      currency: 'USD',
      status: 'COMPLETED',
      description: `Deposit: $${amount}`,
      created_at: new Date().toISOString(),
    });

    return { success: true, transaction_id: crypto.randomUUID() };
  }

  /**
   * Withdraw USD from wallet (Type A only)
   */
  async withdraw(userId: string, amount: number): Promise<TransferResult> {
    if (amount <= 0) {
      return { success: false, error: 'Amount must be positive' };
    }

    const wallet = await this.getWallet(userId);
    if (!wallet) {
      return { success: false, error: 'Wallet not found' };
    }

    if (wallet.type === WALLET_TYPE.RESTRICTED) {
      return { success: false, error: 'Type B wallets cannot withdraw USD' };
    }

    if (wallet.balance_usd < amount) {
      return { success: false, error: 'Insufficient balance' };
    }

    if (wallet.total_withdrawn_today + amount > CONSTANTS.MAX_DAILY_WITHDRAWAL) {
      return { success: false, error: 'Daily withdrawal limit exceeded' };
    }

    await this.db.table('wallets')
      .where('user_id', userId)
      .update({ 
        balance_usd: wallet.balance_usd - amount,
        total_withdrawn_today: wallet.total_withdrawn_today + amount,
        last_withdrawal_at: new Date().toISOString(),
      });

    await this.recordTransaction({
      id: crypto.randomUUID(),
      user_id: userId,
      type: 'WITHDRAWAL',
      amount,
      currency: 'USD',
      status: 'COMPLETED',
      description: `Withdrawal: $${amount}`,
      created_at: new Date().toISOString(),
    });

    return { success: true, transaction_id: crypto.randomUUID() };
  }

  /**
   * Send gift credits (Type B allowed)
   */
  async sendGiftCredits(senderId: string, recipientId: string, amount: number): Promise<TransferResult> {
    if (amount <= 0) {
      return { success: false, error: 'Amount must be positive' };
    }

    if (senderId === recipientId) {
      return { success: false, error: 'Cannot send gift to self' };
    }

    const senderWallet = await this.getWallet(senderId);
    if (!senderWallet) {
      return { success: false, error: 'Sender wallet not found' };
    }

    if (senderWallet.balance_credits < amount) {
      return { success: false, error: 'Insufficient credits' };
    }

    // Check P2P restriction for Type B
    const recipientWallet = await this.getWallet(recipientId);
    if (senderWallet.type === WALLET_TYPE.RESTRICTED && recipientWallet?.type === WALLET_TYPE.RESTRICTED) {
      return { success: false, error: 'Type B wallets can only send gifts to Type A wallets' };
    }

    // Execute transfer
    await this.db.table('wallets')
      .where('user_id', senderId)
      .update({ balance_credits: senderWallet.balance_credits - amount });

    await this.db.table('wallets')
      .where('user_id', recipientId)
      .update({ balance_credits: (recipientWallet?.balance_credits || 0) + amount });

    // Record transactions
    await this.recordTransaction({
      id: crypto.randomUUID(),
      user_id: senderId,
      type: 'GIFT_SENT',
      amount,
      currency: 'CREDITS',
      status: 'COMPLETED',
      description: `Gift to ${recipientId}`,
      created_at: new Date().toISOString(),
    });

    await this.recordTransaction({
      id: crypto.randomUUID(),
      user_id: recipientId,
      type: 'GIFT_RECEIVED',
      amount,
      currency: 'CREDITS',
      status: 'COMPLETED',
      description: `Gift from ${senderId}`,
      created_at: new Date().toISOString(),
    });

    return { success: true, transaction_id: crypto.randomUUID() };
  }

  /**
   * Purchase gift from Empire (Type A only)
   */
  async purchaseGift(userId: string, amount: number): Promise<TransferResult> {
    if (amount <= 0) {
      return { success: false, error: 'Amount must be positive' };
    }

    const wallet = await this.getWallet(userId);
    if (!wallet) {
      return { success: false, error: 'Wallet not found' };
    }

    if (wallet.type === WALLET_TYPE.RESTRICTED) {
      return { success: false, error: 'Type B wallets cannot purchase gifts' };
    }

    if (wallet.balance_usd < amount) {
      return { success: false, error: 'Insufficient USD balance' };
    }

    const cost = amount * 1.30; // 30% markup
    const creditsEarned = Math.floor(amount);

    await this.db.table('wallets')
      .where('user_id', userId)
      .update({ 
        balance_usd: wallet.balance_usd - cost,
        balance_credits: wallet.balance_credits + creditsEarned,
      });

    return { success: true, transaction_id: crypto.randomUUID() };
  }

  /**
   * Check wallet restrictions for a transaction
   */
  async checkRestrictions(senderId: string, recipientId: string, transactionType: string): Promise<{
    allowed: boolean;
    reason?: string;
  }> {
    const senderWallet = await this.getWallet(senderId);
    const recipientWallet = await this.getWallet(recipientId);

    // Type B restrictions
    if (senderWallet?.type === WALLET_TYPE.RESTRICTED) {
      if (transactionType === 'P2P_TRANSFER') {
        return { allowed: false, reason: 'Type B wallets cannot make P2P transfers' };
      }
      if (transactionType === 'WITHDRAWAL') {
        return { allowed: false, reason: 'Type B wallets cannot withdraw USD' };
      }
      if (transactionType === 'PURCHASE') {
        return { allowed: false, reason: 'Type B wallets cannot purchase directly' };
      }
      if (recipientWallet?.type === WALLET_TYPE.RESTRICTED) {
        return { allowed: false, reason: 'Type B wallets can only send gifts to Type A wallets' };
      }
    }

    return { allowed: true };
  }

  /**
   * Get wallet summary
   */
  async getWalletSummary(userId: string): Promise<{
    type: WALLET_TYPE;
    usd_balance: number;
    credits_balance: number;
    is_frozen: boolean;
    daily_limit_remaining: number;
  } | null> {
    const wallet = await this.getWallet(userId);
    if (!wallet) return null;

    return {
      type: wallet.type,
      usd_balance: wallet.balance_usd,
      credits_balance: wallet.balance_credits,
      is_frozen: wallet.is_frozen,
      daily_limit_remaining: Math.max(0, CONSTANTS.MAX_DAILY_WITHDRAWAL - wallet.total_withdrawn_today),
    };
  }

  /**
   * Convert Type B to Type A (upgrade)
   */
  async upgradeWallet(userId: string): Promise<TransferResult> {
    const wallet = await this.getWallet(userId);
    if (!wallet) {
      return { success: false, error: 'Wallet not found' };
    }

    if (wallet.type === WALLET_TYPE.STANDARD) {
      return { success: false, error: 'Wallet is already Type A' };
    }

    await this.db.table('wallets')
      .where('user_id', userId)
      .update({ type: WALLET_TYPE.STANDARD });

    return { success: true, transaction_id: crypto.randomUUID() };
  }

  /**
   * Record transaction to ledger
   */
  private async recordTransaction(tx: WalletTransaction): Promise<void> {
    await this.db.table('wallet_transactions').insert(tx);
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

let walletBankInstance: WalletBank | null = null;

export function getWalletBank(db: Database): WalletBank {
  if (!walletBankInstance) {
    walletBankInstance = new WalletBank(db);
  }
  return walletBankInstance;
}

export { Wallet, WalletTransaction, TransferResult };
