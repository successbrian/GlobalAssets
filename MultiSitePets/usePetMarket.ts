/**
 * usePetMarket.ts
 * Vextor Connector - API Hook for Pet Trading
 * 
 * "Connect to VextorDB and execute pet trades."
 */

'use client';

import { useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { HumanAsset, PetTradeResult, PortfolioSummary } from './types';

// VextorDB Client - uses VEXTOR_DB env var
const vextorClient = createClient(
  process.env.NEXT_PUBLIC_VEXTOR_DB_URL || process.env.NEXT_PUBLIC_ORACLE_DB_URL!,
  process.env.NEXT_PUBLIC_VEXTOR_DB_KEY || process.env.NEXT_PUBLIC_ORACLE_DB_KEY!,
  { auth: { persistSession: false } }
);

interface UsePetMarketReturn {
  // State
  loading: boolean;
  error: string | null;
  
  // Functions
  buyHuman: (targetId: string, buyerId: string) => Promise<PetTradeResult>;
  getPortfolio: (ownerId: string) => Promise<HumanAsset[]>;
  getAssetDetails: (userId: string) => Promise<HumanAsset | null>;
  calculateStealPrice: (currentValue: number) => number;
  refreshAsset: (userId: string) => Promise<void>;
}

export function usePetMarket(): UsePetMarketReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Execute Pet Trade (Steal/Buy)
   * Calls rpc/execute_pet_trade on VextorDB
   */
  const buyHuman = useCallback(async (
    targetId: string,
    buyerId: string
  ): Promise<PetTradeResult> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await vextorClient
        .rpc('execute_pet_trade', {
          p_target_user_id: targetId,
          p_new_owner_id: buyerId,
        })
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        asset: data.asset,
        new_owner_id: buyerId,
        transaction_hash: data.transaction_hash,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Trade failed';
      setError(message);
      return {
        success: false,
        asset: {} as HumanAsset,
        new_owner_id: '',
        error: message,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get Portfolio (List of owned humans)
   */
  const getPortfolio = useCallback(async (ownerId: string): Promise<HumanAsset[]> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await vextorClient
        .from('pet_portfolio')
        .select(`
          *,
          target_user:user_assets!pet_portfolio_target_id_fkey(
            id,
            display_name,
            avatar_url,
            current_value,
            next_price,
            is_protected
          )
        `)
        .eq('owner_id', ownerId)
        .order('acquired_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return (data || []).map(row => ({
        ...row.target_user,
        owner_id: ownerId,
        owner_name: null, // Will be populated if needed
        owned_since: row.acquired_at,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch portfolio';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get Asset Details (Price/Owner of specific profile)
   */
  const getAssetDetails = useCallback(async (userId: string): Promise<HumanAsset | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await vextorClient
        .from('user_assets')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No asset found
        }
        throw new Error(error.message);
      }

      return data as HumanAsset;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch asset';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Calculate Steal Price (+10% of current value)
   */
  const calculateStealPrice = useCallback((currentValue: number): number => {
    return Math.floor(currentValue * 1.10);
  }, []);

  /**
   * Refresh single asset data
   */
  const refreshAsset = useCallback(async (userId: string): Promise<void> => {
    await getAssetDetails(userId);
  }, [getAssetDetails]);

  return {
    loading,
    error,
    buyHuman,
    getPortfolio,
    getAssetDetails,
    calculateStealPrice,
    refreshAsset,
  };
}

/**
 * Hook for getting portfolio summary
 */
export function usePortfolioSummary(ownerId: string) {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { getPortfolio } = usePetMarket();

  const fetchSummary = useCallback(async () => {
    if (!ownerId) return;
    
    setLoading(true);
    const assets = await getPortfolio(ownerId);
    
    const totalAssets = assets.length;
    const netWorth = assets.reduce((sum, a) => sum + a.current_value, 0);
    const avgPrice = totalAssets > 0 ? Math.floor(netWorth / totalAssets) : 0;
    
    // Dividend calculation would come from a separate dividends table
    const totalDividends = 0; // Placeholder
    
    setSummary({
      total_assets: totalAssets,
      net_worth: netWorth,
      total_dividends: totalDividends,
      avg_price: avgPrice,
    });
    
    setLoading(false);
  }, [ownerId, getPortfolio]);

  useState(() => {
    fetchSummary();
  });

  return { summary, loading, refetch: fetchSummary };
}
