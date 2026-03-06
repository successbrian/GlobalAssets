/**
 * EmpireStats.tsx - High-Fidelity Empire Dashboard Component
 * 
 * Features:
 * - Left (The Bank): DEX TVL, 24h Volume, Yield APY
 * - Center (The Nation): Total Merchants, Active Listings, Citizen Count
 * - Right (The Market): Items Listed, Total GMV, Last Item Sold
 * - Odometer-style animations for real-time number updates
 */

import React, { useState, useEffect, useRef } from 'react';

// Types for stats data
interface DexStats {
  tvl: number;
  tvlChange24h: number;
  volume24h: number;
  volumeChange24h: number;
  yieldApy: number;
  activePairs: number;
}

interface ReserveStats {
  totalMerchants: number;
  activeListings: number;
  realEstateCount: number;
  vehicleCount: number;
  citizenCount: number;
}

interface MarketStats {
  itemsListed: number;
  totalGmv: number;
  gmvChange24h: number;
  lastItemSold: {
    name: string;
    price: number;
    timestamp: string;
  } | null;
}

interface YieldStats {
  totalCvtrPaid: number;
  apy: number;
  stakersCount: number;
}

interface GlobalStats {
  dex: DexStats;
  reserve: ReserveStats;
  market: MarketStats;
  yield: YieldStats;
  timestamp: string;
  cached: boolean;
}

interface EmpireStatsProps {
  refreshInterval?: number; // in milliseconds
  className?: string;
  showAnimations?: boolean;
}

interface AnimatedNumberProps {
  value: number;
  format?: 'currency' | 'number' | 'percent';
  decimals?: number;
  duration?: number;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  format = 'number',
  decimals = 0,
  duration = 1000
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = displayValue + (value - displayValue) * easeOut;
      
      setDisplayValue(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  const formatValue = (val: number): string => {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(val);
    }
    
    if (format === 'percent') {
      return `${val.toFixed(decimals)}%`;
    }

    // Large number formatting
    if (val >= 1000000000) {
      return `${(val / 1000000000).toFixed(decimals)}B`;
    }
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(decimals)}M`;
    }
    if (val >= 1000) {
      return `${(val / 1000).toFixed(decimals)}K`;
    }
    
    return val.toFixed(decimals);
  };

  return (
    <span className="animated-number">
      {formatValue(displayValue)}
    </span>
  );
};

const StatCard: React.FC<{
  title: string;
  value: React.ReactNode;
  change?: number;
  icon?: string;
  color?: string;
}> = ({ title, value, change, icon, color = '#ffd700' }) => {
  const isPositive = change !== undefined && change >= 0;
  
  return (
    <div className="stat-card" style={{ borderColor: color }}>
      <div className="stat-header">
        {icon && <span className="stat-icon">{icon}</span>}
        <span className="stat-title">{title}</span>
      </div>
      <div className="stat-value" style={{ color }}>
        {value}
      </div>
      {change !== undefined && (
        <div className={`stat-change ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
        </div>
      )}
    </div>
  );
};

export const EmpireStats: React.FC<EmpireStatsProps> = ({
  refreshInterval = 60000, // 60 seconds
  className = '',
  showAnimations = true
}) => {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats/global');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
      setLastUpdated(new Date(data.timestamp));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('[EmpireStats] Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  if (loading) {
    return (
      <div className={`empire-stats loading ${className}`}>
        <div className="loading-spinner" />
        <p>Loading Empire Statistics...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className={`empire-stats error ${className}`}>
        <p>Error loading stats: {error || 'Unknown error'}</p>
        <button onClick={fetchStats}>Retry</button>
      </div>
    );
  }

  return (
    <div className={`empire-stats ${className}`}>
      {/* Last Updated Timestamp */}
      {lastUpdated && (
        <div className="last-updated">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}

      {/* Left Section: The Bank (DEX Stats) */}
      <section className="stats-section bank">
        <h2 className="section-title">
          <span className="icon">🏦</span> The Bank
        </h2>
        <div className="stats-grid">
          <StatCard
            title="Total Value Locked"
            value={<AnimatedNumber value={stats.dex.tvl} format="currency" decimals={0} />}
            change={stats.dex.tvlChange24h}
            color="#00ff88"
          />
          <StatCard
            title="24h Volume"
            value={<AnimatedNumber value={stats.dex.volume24h} format="currency" decimals={0} />}
            change={stats.dex.volumeChange24h}
            color="#00ff88"
          />
          <StatCard
            title="Yield APY"
            value={<AnimatedNumber value={stats.dex.yieldApy} format="percent" decimals={1} />}
            color="#ffd700"
          />
          <StatCard
            title="Active Pairs"
            value={<AnimatedNumber value={stats.dex.activePairs} decimals={0} />}
            color="#00ff88"
          />
        </div>
      </section>

      {/* Center Section: The Nation (Reserve Stats) */}
      <section className="stats-section nation">
        <h2 className="section-title">
          <span className="icon">🏛️</span> The Nation
        </h2>
        <div className="stats-grid">
          <StatCard
            title="Total Merchants"
            value={<AnimatedNumber value={stats.reserve.totalMerchants} decimals={0} />}
            color="#ffd700"
          />
          <StatCard
            title="Active Listings"
            value={<AnimatedNumber value={stats.reserve.activeListings} decimals={0} />}
            color="#ffd700"
          />
          <StatCard
            title="Real Estate"
            value={<AnimatedNumber value={stats.reserve.realEstateCount} decimals={0} />}
            color="#ff6b6b"
          />
          <StatCard
            title="Vehicles"
            value={<AnimatedNumber value={stats.reserve.vehicleCount} decimals={0} />}
            color="#ff6b6b"
          />
          <StatCard
            title="Verified Citizens"
            value={<AnimatedNumber value={stats.reserve.citizenCount} decimals={0} />}
            color="#ffd700"
          />
        </div>
      </section>

      {/* Right Section: The Market (Market Stats) */}
      <section className="stats-section market">
        <h2 className="section-title">
          <span className="icon">🛒</span> The Market
        </h2>
        <div className="stats-grid">
          <StatCard
            title="Items Listed"
            value={<AnimatedNumber value={stats.market.itemsListed} decimals={0} />}
            color="#ff6b6b"
          />
          <StatCard
            title="Total GMV"
            value={<AnimatedNumber value={stats.market.totalGmv} format="currency" decimals={0} />}
            change={stats.market.gmvChange24h}
            color="#ff6b6b"
          />
          {stats.market.lastItemSold && (
            <div className="last-sale-card">
              <span className="label">Last Sale</span>
              <span className="item-name">{stats.market.lastItemSold.name}</span>
              <span className="item-price">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(stats.market.lastItemSold.price)}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Yield Stats */}
      <section className="stats-section yield">
        <h2 className="section-title">
          <span className="icon">💰</span> Yield Distribution
        </h2>
        <div className="yield-stats">
          <div className="yield-item">
            <span className="label">Total CVTR Paid</span>
            <span className="value">{stats.yield.totalCvtrPaid.toLocaleString()}</span>
          </div>
          <div className="yield-item">
            <span className="label">Staker APY</span>
            <span className="value">{stats.yield.apy.toFixed(1)}%</span>
          </div>
          <div className="yield-item">
            <span className="label">Active Stakers</span>
            <span className="value">{stats.yield.stakersCount}</span>
          </div>
        </div>
      </section>

      <style>{`
        .empire-stats {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          padding: 2rem;
          background: linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 100%);
          border-radius: 12px;
          border: 1px solid rgba(255, 215, 0, 0.2);
        }

        .empire-stats.loading,
        .empire-stats.error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 1rem;
        }

        .loading-spinner {
          width: 48px;
          height: 48px;
          border: 3px solid rgba(255, 215, 0, 0.2);
          border-top-color: #ffd700;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .last-updated {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.4);
          text-align: right;
        }

        .stats-section {
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #fff;
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .icon {
          font-size: 1.5rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 1rem;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid;
          border-radius: 8px;
          padding: 1rem;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .stat-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .stat-icon {
          font-size: 1rem;
        }

        .stat-title {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .stat-change {
          font-size: 0.75rem;
          font-weight: 500;
        }

        .stat-change.positive {
          color: #00ff88;
        }

        .stat-change.negative {
          color: #ff6b6b;
        }

        .last-sale-card {
          background: rgba(255, 107, 107, 0.1);
          border: 1px solid rgba(255, 107, 107, 0.3);
          border-radius: 8px;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .last-sale-card .label {
          color: rgba(255, 107, 107, 0.8);
          font-size: 0.75rem;
          text-transform: uppercase;
        }

        .last-sale-card .item-name {
          color: #fff;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .last-sale-card .item-price {
          color: #ff6b6b;
          font-weight: 700;
          font-size: 1.125rem;
        }

        .yield-stats {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .yield-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .yield-item .label {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.75rem;
          text-transform: uppercase;
        }

        .yield-item .value {
          color: #ffd700;
          font-size: 1.25rem;
          font-weight: 700;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default EmpireStats;
