/**
 * AssetStatusCard.tsx
 * The "Buy" Widget - Shows asset value and exclusivity status
 * 
 * "Value: 💎 500 | Owned by: @KingSlayer | [ STEAL FOR 💎 550 ]"
 * 
 * EXCLUSIVE OWNERSHIP RULES:
 * - If owner_id !== null AND !is_for_sale: Show "LOCKED / OWNED BY [User]" (Disable Buy)
 * - If owner_id === null: Show "LAUNCH / BUY NOW"
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Crown, 
  User, 
  AlertTriangle, 
  Loader2,
  Zap,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import { usePetMarket } from './usePetMarket';
import { 
  calculateStealPrice, 
  calculateDecayMultiplier, 
  getTierLabel,
  formatAssetPrice 
} from './ValuationEngine';
import type { HumanAsset } from './types';

interface AssetStatusCardProps {
  userId: string;           // The user whose asset to display
  currentUserId?: string;   // Current logged-in user
  compact?: boolean;        // Compact mode for small spaces
  showValuation?: boolean;  // Show decay/valuation details
  onStealComplete?: (result: any) => void;
}

export default function AssetStatusCard({
  userId,
  currentUserId,
  compact = false,
  showValuation = true,
  onStealComplete,
}: AssetStatusCardProps) {
  const { getAssetDetails, buyHuman, loading } = usePetMarket();
  const [asset, setAsset] = useState<HumanAsset | null>(null);
  const [stealing, setStealing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch asset details on mount
  useEffect(() => {
    const fetchAsset = async () => {
      const data = await getAssetDetails(userId);
      setAsset(data);
    };
    fetchAsset();
  }, [userId, getAssetDetails]);

  // Calculate valuation metrics
  const getValuation = () => {
    if (!asset) return null;
    const daysDormant = asset.last_active_at 
      ? Math.floor((Date.now() - new Date(asset.last_active_at).getTime()) / (1000 * 60 * 60 * 24))
      : 999;
    const multiplier = calculateDecayMultiplier(daysDormant);
    return { daysDormant, multiplier, tier: getTierLabel(daysDormant) };
  };

  const valuation = getValuation();

  // Compact mode
  if (compact) {
    return (
      <div className="inline-flex items-center gap-3 px-3 py-2 bg-gray-800/50 rounded-lg text-sm">
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        ) : asset ? (
          <>
            <span className="text-yellow-400 font-medium">
              {formatAssetPrice(asset.market_valuation)}
            </span>
            {asset.owner_id && (
              <span className={`flex items-center gap-1 ${
                asset.is_for_sale ? 'text-green-400' : 'text-red-400'
              }`}>
                {asset.is_for_sale ? <Crown className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                {asset.owner_name || 'Owned'}
              </span>
            )}
            {!asset.owner_id && (
              <span className="text-blue-400">Available</span>
            )}
          </>
        ) : (
          <span className="text-gray-500">No asset data</span>
        )}
      </div>
    );
  }

  // Full card mode
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden shadow-xl"
    >
      {/* Header - Color based on ownership status */}
      <div className={`px-4 py-3 border-b ${
        !asset?.owner_id 
          ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/30'
          : asset.is_for_sale 
            ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30'
            : 'bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500/30'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!asset?.owner_id ? (
              <>
                <Zap className="w-5 h-5 text-blue-400" />
                <span className="text-blue-400 font-semibold">Available</span>
              </>
            ) : asset.is_for_sale ? (
              <>
                <Crown className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-semibold">For Sale</span>
              </>
            ) : (
              <>
                <Lock className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-semibold">LOCKED</span>
              </>
            )}
          </div>
          {valuation && (
            <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
              valuation.multiplier >= 0.9 ? 'bg-green-500/20 text-green-400' :
              valuation.multiplier >= 0.5 ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {valuation.multiplier >= 0.9 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {valuation.tier}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        ) : asset ? (
          <>
            {/* Asset Info */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-800 overflow-hidden flex items-center justify-center">
                {asset.avatar_url ? (
                  <img src={asset.avatar_url} alt={asset.display_name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-gray-500" />
                )}
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">{asset.display_name}</h3>
                <p className="text-gray-400 text-sm">ID: {asset.id.slice(0, 8)}...</p>
              </div>
            </div>

            {/* Valuation Details */}
            {showValuation && (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <p className="text-gray-400 text-xs uppercase">Market Value</p>
                  <p className="text-yellow-400 font-bold text-xl">
                    {formatAssetPrice(asset.market_valuation)}
                  </p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <p className="text-gray-400 text-xs uppercase">Consistency</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          asset.consistency_score >= 70 ? 'bg-green-500' :
                          asset.consistency_score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${asset.consistency_score}%` }}
                      />
                    </div>
                    <span className="text-white text-sm">{asset.consistency_score}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Ownership Status */}
            <div className={`rounded-lg p-3 ${
              !asset.owner_id 
                ? 'bg-blue-500/10 border border-blue-500/30'
                : asset.is_for_sale 
                  ? 'bg-green-500/10 border border-green-500/30'
                  : 'bg-red-500/10 border border-red-500/30'
            }`}>
              <p className="text-gray-400 text-xs uppercase mb-1">
                {!asset.owner_id ? 'Current Status' : 'Owner'}
              </p>
              {!asset.owner_id ? (
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-400" />
                  <span className="text-blue-400 font-medium">
                    Free Agent - Launch Now!
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-400" />
                    <span className="text-white font-medium">
                      {asset.owner_name || `User ${asset.owner_id.slice(0, 8)}...`}
                    </span>
                  </div>
                  {asset.agent_id && (
                    <span className="text-gray-500 text-xs">
                      Agent: {asset.agent_name || 'Unknown'}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Action Button */}
            {!asset.owner_id && (
              <button
                onClick={() => {/* Launch logic */}}
                disabled={loading}
                className="w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
              >
                <Zap className="w-5 h-5" />
                LAUNCH / CLAIM
              </button>
            )}

            {asset.owner_id && asset.is_for_sale && (
              <button
                onClick={async () => {
                  if (!currentUserId) return;
                  setStealing(true);
                  setError(null);
                  const result = await buyHuman(userId, currentUserId);
                  if (result.success) {
                    setAsset(result.asset);
                    onStealComplete?.(result);
                  } else {
                    setError(result.error || 'Steal failed');
                  }
                  setStealing(false);
                }}
                disabled={stealing || !currentUserId}
                className="w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
              >
                {stealing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Executing Trade...
                  </>
                ) : (
                  <>
                    <Crown className="w-5 h-5" />
                    STEAL FOR {formatAssetPrice(calculateStealPrice(asset.market_valuation, valuation?.daysDormant || 0))}
                  </>
                )}
              </button>
            )}

            {asset.owner_id && !asset.is_for_sale && (
              <div className="w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 bg-gray-700 text-gray-400 cursor-not-allowed">
                <Lock className="w-5 h-5" />
                LOCKED / EXCLUSIVE OWNERSHIP
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No asset data found for this user</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
