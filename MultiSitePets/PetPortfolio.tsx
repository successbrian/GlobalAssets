/**
 * PetPortfolio.tsx
 * The "My Pets" Drawer - Shows owned humans
 * 
 * "List of users I own | Total Net Worth | Total Dividends"
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Crown, 
  TrendingUp, 
  DollarSign, 
  Users,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { usePetMarket } from './usePetMarket';
import type { HumanAsset, PortfolioSummary } from './types';

interface PetPortfolioProps {
  ownerId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function PetPortfolio({ ownerId, isOpen, onClose }: PetPortfolioProps) {
  const { getPortfolio, loading } = usePetMarket();
  const [portfolio, setPortfolio] = useState<HumanAsset[]>([]);
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<HumanAsset | null>(null);

  // Fetch portfolio on mount or when ownerId changes
  useEffect(() => {
    if (isOpen && ownerId) {
      fetchPortfolio();
    }
  }, [isOpen, ownerId]);

  const fetchPortfolio = async () => {
    const assets = await getPortfolio(ownerId);
    setPortfolio(assets);

    // Calculate summary
    const totalAssets = assets.length;
    const netWorth = assets.reduce((sum, a) => sum + a.current_value, 0);
    const avgPrice = totalAssets > 0 ? Math.floor(netWorth / totalAssets) : 0;

    setSummary({
      total_assets: totalAssets,
      net_worth: netWorth,
      total_dividends: 0, // Placeholder - would come from dividends table
      avg_price: avgPrice,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-gray-900 border-l border-gray-800 z-50 shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 p-4 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/20 rounded-lg">
                    <Crown className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">My Portfolio</h2>
                    <p className="text-gray-400 text-sm">Owned Humans</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="p-4 grid grid-cols-2 gap-3">
              <SummaryCard
                icon={<DollarSign className="w-5 h-5 text-yellow-400" />}
                label="Net Worth"
                value={summary ? `💎 ${summary.net_worth.toLocaleString()}` : '...'}
                color="yellow"
              />
              <SummaryCard
                icon={<Users className="w-5 h-5 text-blue-400" />}
                label="Assets"
                value={summary?.total_assets.toString() || '...'}
                color="blue"
              />
              <SummaryCard
                icon={<TrendingUp className="w-5 h-5 text-green-400" />}
                label="Avg Price"
                value={summary ? `💎 ${summary.avg_price.toLocaleString()}` : '...'}
                color="green"
              />
              <SummaryCard
                icon={<Crown className="w-5 h-5 text-purple-400" />}
                label="Dividends"
                value={summary ? `💎 ${summary.total_dividends.toLocaleString()}` : '...'}
                color="purple"
              />
            </div>

            {/* Refresh Button */}
            <div className="px-4 pb-2">
              <button
                onClick={fetchPortfolio}
                disabled={loading}
                className="w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center gap-2 text-gray-300 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh Portfolio
              </button>
            </div>

            {/* Asset List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading && portfolio.length === 0 ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                </div>
              ) : portfolio.length === 0 ? (
                <div className="text-center py-20">
                  <Users className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                  <h3 className="text-white font-semibold mb-2">No Assets Yet</h3>
                  <p className="text-gray-400 text-sm">
                    Start collecting humans from the directory!
                  </p>
                </div>
              ) : (
                portfolio.map((asset) => (
                  <motion.div
                    key={asset.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelectedAsset(asset)}
                    className="p-4 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-xl cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-gray-700 overflow-hidden flex-shrink-0">
                        {asset.avatar_url ? (
                          <img src={asset.avatar_url} alt={asset.display_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-gray-500" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-semibold truncate">{asset.display_name}</h4>
                        <p className="text-gray-400 text-sm">
                          Owned since {asset.owned_since 
                            ? new Date(asset.owned_since).toLocaleDateString() 
                            : 'Unknown'}
                        </p>
                      </div>

                      {/* Value */}
                      <div className="text-right">
                        <p className="text-yellow-400 font-bold flex items-center gap-1">
                          <span>💎</span>
                          {asset.current_value.toLocaleString()}
                        </p>
                        <p className="text-gray-500 text-xs">
                          Steal: 💎 {Math.floor(asset.current_value * 1.1).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>

          {/* Selected Asset Modal */}
          <AnimatePresence>
            {selectedAsset && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-60 flex items-center justify-center p-4"
                onClick={() => setSelectedAsset(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto rounded-full bg-gray-800 overflow-hidden mb-4">
                      {selectedAsset.avatar_url ? (
                        <img src={selectedAsset.avatar_url} alt={selectedAsset.display_name} className="w-full h-full object-cover" />
                      ) : (
                        <Users className="w-12 h-12 text-gray-500 mt-6" />
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{selectedAsset.display_name}</h3>
                    <p className="text-gray-400 text-sm mb-4">ID: {selectedAsset.id}</p>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-800 rounded-lg p-3">
                        <p className="text-gray-400 text-xs uppercase">Current Value</p>
                        <p className="text-yellow-400 font-bold">💎 {selectedAsset.current_value.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3">
                        <p className="text-gray-400 text-xs uppercase">Steal Price</p>
                        <p className="text-orange-400 font-bold">💎 {Math.floor(selectedAsset.current_value * 1.1).toLocaleString()}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedAsset(null)}
                      className="w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}

// Summary Card Component
function SummaryCard({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  color: 'yellow' | 'blue' | 'green' | 'purple';
}) {
  const colorClasses = {
    yellow: 'bg-yellow-500/10 border-yellow-500/20',
    blue: 'bg-blue-500/10 border-blue-500/20',
    green: 'bg-green-500/10 border-green-500/20',
    purple: 'bg-purple-500/10 border-purple-500/20',
  };

  return (
    <div className={`${colorClasses[color]} border rounded-xl p-3`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-gray-400 text-xs uppercase">{label}</span>
      </div>
      <p className="text-white font-bold">{value}</p>
    </div>
  );
}
