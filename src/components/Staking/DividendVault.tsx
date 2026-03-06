/**
 * DividendVault.tsx - The Dividend Dashboard
 * 
 * Features:
 * - "The Faucet": Live counter showing fees flowing in
 * - "My Share": Real-time estimate of wTXC earned
 * - "Compound Button": One-click to reinvest earnings
 * - Locking multiplier visualization
 * 
 * @satoshihost: "The Fee Splitter is the heart of the city."
 */

import React, { useState, useEffect } from 'react';

interface StakingPosition {
  amount: number;
  lockEndTime: Date | null;
  multiplier: number;
  shares: number;
  pendingDividends: number;
  totalClaimed: number;
}

interface PoolStats {
  tvl: number;
  totalStakers: number;
  currentApy: number;
  recentDistribution: number;
}

const LOCK_OPTIONS = [
  { period: 0, label: 'No Lock', multiplier: 1, color: '#888' },
  { period: 365, label: '365 Days', multiplier: 2, color: '#ffd700' },
  { period: 730, label: '730 Days', multiplier: 4, color: '#00bfff' }
];

export const DividendVault: React.FC = () => {
  const [position, setPosition] = useState<StakingPosition | null>(null);
  const [poolStats, setPoolStats] = useState<PoolStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [compounding, setCompounding] = useState(false);
  const [selectedLock, setSelectedLock] = useState(0);
  const [stakeAmount, setStakeAmount] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // In production: Call staking contract
    setPosition({
      amount: 5000,
      lockEndTime: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      multiplier: 2,
      shares: 10000,
      pendingDividends: 125.50,
      totalClaimed: 892.25
    });

    setPoolStats({
      tvl: 2450000,
      totalStakers: 89,
      currentApy: 22.5,
      recentDistribution: 1250
    });

    setLoading(false);
  };

  const handleCompound = async () => {
    setCompounding(true);
    // In production: Call staking.compound()
    await new Promise(resolve => setTimeout(resolve, 2000));
    setCompounding(false);
    fetchData();
  };

  const handleStake = async () => {
    // In production: Call staking.stake()
    await new Promise(resolve => setTimeout(resolve, 1000));
    fetchData();
  };

  const getLockProgress = () => {
    if (!position?.lockEndTime) return 100;
    const now = Date.now();
    const end = position.lockEndTime.getTime();
    const total = 365 * 24 * 60 * 60 * 1000;
    return Math.min(100, ((now - (end - total)) / total) * 100);
  };

  if (loading) {
    return (
      <div className="dividend-vault loading">
        <div className="loading-spinner" />
        <p>Loading vault data...</p>
      </div>
    );
  }

  return (
    <div className="dividend-vault">
      {/* Header Stats */}
      <section className="header-stats">
        <div className="stat-card">
          <span className="stat-label">Total Value Locked</span>
          <span className="stat-value">${poolStats?.tvl?.toLocaleString()}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Active Stakers</span>
          <span className="stat-value">{poolStats?.totalStakers}</span>
        </div>
        <div className="stat-card highlight">
          <span className="stat-label">Current APY</span>
          <span className="stat-value">{poolStats?.currentApy}%</span>
        </div>
      </section>

      {/* The Faucet - Live Distribution */}
      <section className="faucet-section">
        <div className="faucet-header">
          <span className="faucet-icon">🚰</span>
          <h2>The Faucet</h2>
          <span className="live-badge">● LIVE</span>
        </div>
        
        <div className="faucet-display">
          <div className="dripping-coins">
            {[1, 2, 3].map(i => (
              <div key={i} className={`coin-drip drip-${i}`}>🪙</div>
            ))}
          </div>
          <div className="faucet-amount">
            <span className="amount-value">+{poolStats?.recentDistribution}</span>
            <span className="amount-label">$wTXC distributed this round</span>
          </div>
        </div>

        <div className="faucet-flow">
          <div className="flow-item">
            <span className="flow-from">Fee Splitter</span>
            <span className="flow-arrow">→</span>
            <span className="flow-to">Dividend Vault</span>
          </div>
        </div>
      </section>

      {/* My Position */}
      <section className="my-position">
        <h2>My Position</h2>
        
        {position ? (
          <div className="position-card">
            <div className="position-main">
              <div className="position-amount">
                <span className="label">Staked $CVTR</span>
                <span className="value">{position.amount.toLocaleString()}</span>
              </div>
              
              {position.lockEndTime && (
                <div className="lock-status">
                  <div className="lock-progress">
                    <div 
                      className="progress-fill"
                      style={{ width: `${getLockProgress()}%` }}
                    />
                  </div>
                  <div className="lock-info">
                    <span className="multiplier-badge" style={{ background: LOCK_OPTIONS[1].color }}>
                      {position.multiplier}x Multiplier
                    </span>
                    <span className="unlock-date">
                      Unlocks: {position.lockEndTime.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="dividends-section">
              <div className="dividend-card pending">
                <span className="dividend-label">Pending $wTXC</span>
                <span className="dividend-value">
                  {position.pendingDividends.toFixed(4)}
                </span>
                <button 
                  className="compound-btn"
                  onClick={handleCompound}
                  disabled={compounding || position.pendingDividends <= 0}
                >
                  {compounding ? 'Compounding...' : 'Compound →'}
                </button>
              </div>
              
              <div className="dividend-card claimed">
                <span className="dividend-label">Total Claimed</span>
                <span className="dividend-value">
                  {position.totalClaimed.toFixed(4)}
                </span>
                <span className="dividend-sublabel">$wTXC</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-position">
            <p>No active stake</p>
            <p className="hint">Stake $CVTR to start earning $wTXC</p>
          </div>
        )}
      </section>

      {/* Stake More */}
      <section className="stake-section">
        <h2>Stake More $CVTR</h2>
        
        <div className="lock-options">
          {LOCK_OPTIONS.map(option => (
            <button
              key={option.period}
              className={`lock-option ${selectedLock === option.period ? 'selected' : ''}`}
              onClick={() => setSelectedLock(option.period)}
              style={{ '--option-color': option.color } as React.CSSProperties}
            >
              <span className="option-multiplier">{option.multiplier}x</span>
              <span className="option-label">{option.label}</span>
            </button>
          ))}
        </div>
        
        <div className="stake-input-group">
          <input
            type="number"
            value={stakeAmount}
            onChange={(e) => setStakeAmount(e.target.value)}
            placeholder="Amount to stake"
            className="stake-input"
          />
          <button className="stake-btn" onClick={handleStake}>
            Stake $CVTR
          </button>
        </div>
        
        <p className="stake-note">
          {selectedLock === 0 && 'No lock - withdraw anytime'}
          {selectedLock === 365 && '365 day lock - 2x rewards multiplier'}
          {selectedLock === 730 && '730 day lock - 4x rewards multiplier'}
        </p>
      </section>

      {/* Reward Breakdown */}
      <section className="rewards-breakdown">
        <h3>How Rewards Work</h3>
        <div className="breakdown-grid">
          <div className="breakdown-item">
            <span className="breakdown-icon">📊</span>
            <span className="breakdown-title">Share of Pool</span>
            <span className="breakdown-desc">Your share of dividends based on staked amount × multiplier</span>
          </div>
          <div className="breakdown-item">
            <span className="breakdown-icon">💰</span>
            <span className="breakdown-title">$wTXC Earnings</span>
            <span className="breakdown-desc">Earn gold tokens from swap fees and tributes</span>
          </div>
          <div className="breakdown-item">
            <span className="breakdown-icon">🔄</span>
            <span className="breakdown-title">Compound</span>
            <span className="breakdown-desc">Reinvest rewards for exponential growth</span>
          </div>
        </div>
      </section>

      <style>{`
        .dividend-vault {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem;
        }

        .dividend-vault.loading {
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

        /* Header Stats */
        .header-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
        }

        .stat-card.highlight {
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%);
          border-color: rgba(255, 215, 0, 0.3);
        }

        .stat-label {
          display: block;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #ffd700;
        }

        /* Faucet Section */
        .faucet-section {
          background: rgba(255, 215, 0, 0.05);
          border: 1px solid rgba(255, 215, 0, 0.2);
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .faucet-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .faucet-icon {
          font-size: 1.5rem;
        }

        .faucet-header h2 {
          flex: 1;
          margin: 0;
        }

        .live-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.75rem;
          background: rgba(0, 255, 136, 0.2);
          border: 1px solid #00ff88;
          border-radius: 50px;
          font-size: 0.75rem;
          color: #00ff88;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        .dripping-coins {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .coin-drip {
          font-size: 1.5rem;
          animation: drip 1.5s ease-in infinite;
        }

        .coin-drip.drip-1 { animation-delay: 0s; }
        .coin-drip.drip-2 { animation-delay: 0.5s; }
        .coin-drip.drip-3 { animation-delay: 1s; }

        @keyframes drip {
          0% { opacity: 0; transform: translateY(-10px); }
          50% { opacity: 1; }
          100% { opacity: 0; transform: translateY(10px); }
        }

        .faucet-display {
          text-align: center;
          margin-bottom: 1rem;
        }

        .amount-value {
          display: block;
          font-size: 3rem;
          font-weight: 800;
          color: #ffd700;
        }

        .amount-label {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.875rem;
        }

        .flow-item {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.875rem;
        }

        .flow-arrow {
          color: #ffd700;
        }

        /* My Position */
        .my-position {
          margin-bottom: 2rem;
        }

        .my-position h2 {
          margin-bottom: 1rem;
        }

        .position-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 1.5rem;
        }

        .position-main {
          margin-bottom: 1.5rem;
        }

        .position-amount .label {
          display: block;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
        }

        .position-amount .value {
          font-size: 2rem;
          font-weight: 700;
          color: #fff;
        }

        .lock-status {
          margin-top: 1rem;
        }

        .lock-progress {
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 0.75rem;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #ffd700, #ffaa00);
          border-radius: 3px;
        }

        .lock-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .multiplier-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 700;
          color: #000;
        }

        .unlock-date {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .dividends-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .dividend-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1rem;
          text-align: center;
        }

        .dividend-card.pending {
          border-color: rgba(255, 215, 0, 0.3);
        }

        .dividend-label {
          display: block;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 0.5rem;
        }

        .dividend-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          color: #ffd700;
          margin-bottom: 0.5rem;
        }

        .dividend-sublabel {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.4);
        }

        .compound-btn {
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #00ff88 0%, #00cc6a 100%);
          border: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.875rem;
          color: #000;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .compound-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 255, 136, 0.3);
        }

        .compound-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Stake Section */
        .stake-section {
          margin-bottom: 2rem;
        }

        .stake-section h2 {
          margin-bottom: 1rem;
        }

        .lock-options {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .lock-option {
          flex: 1;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
        }

        .lock-option:hover {
          border-color: var(--option-color);
        }

        .lock-option.selected {
          background: rgba(255, 215, 0, 0.1);
          border-color: var(--option-color);
        }

        .option-multiplier {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--option-color);
          margin-bottom: 0.25rem;
        }

        .option-label {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.6);
        }

        .stake-input-group {
          display: flex;
          gap: 0.75rem;
        }

        .stake-input {
          flex: 1;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: #fff;
          font-size: 1rem;
        }

        .stake-btn {
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
          border: none;
          border-radius: 8px;
          font-weight: 700;
          color: #000;
          cursor: pointer;
        }

        .stake-note {
          margin-top: 0.75rem;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.5);
          text-align: center;
        }

        /* Rewards Breakdown */
        .rewards-breakdown {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 12px;
          padding: 1.5rem;
        }

        .rewards-breakdown h3 {
          margin: 0 0 1rem;
          font-size: 1rem;
        }

        .breakdown-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }

        .breakdown-item {
          text-align: center;
        }

        .breakdown-icon {
          font-size: 1.5rem;
          display: block;
          margin-bottom: 0.5rem;
        }

        .breakdown-title {
          display: block;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .breakdown-desc {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
        }

        @media (max-width: 768px) {
          .header-stats {
            grid-template-columns: 1fr;
          }

          .breakdown-grid {
            grid-template-columns: 1fr;
          }

          .dividends-section {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default DividendVault;
