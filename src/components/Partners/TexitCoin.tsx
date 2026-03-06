/**
 * TexitCoin.tsx - Official Texit Coin Partner Page
 * Route: /partners/texit-coin
 * 
 * Features:
 * - Mission statement (Anti-CBDC, Decentralized, Scrypt-based)
 * - Technical specifications (100B supply, PoW stability)
 * - Phase 2: Path to $800
 * - MiningPackages integration
 */

import React from 'react';
import { MiningPackages } from './MiningPackages';

export const TexitCoin: React.FC = () => {
  return (
    <div className="texit-coin-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">Official Partner</div>
          <h1 className="hero-title">
            <span className="title-highlight">Texit</span> Coin
          </h1>
          <p className="hero-tagline">
            The Official Currency of the Independent Republic
          </p>
          <p className="hero-description">
            Anti-CBDC. Decentralized. Built on Proof-of-Work stability.
            The currency of liberty for the new Texas republic.
          </p>
          <div className="hero-actions">
            <a href="https://minetxc.com" target="_blank" rel="noopener noreferrer" className="btn-primary">
              Start Mining
            </a>
            <a href="#specs" className="btn-secondary">
              View Specifications
            </a>
          </div>
        </div>
        <div className="hero-visual">
          <div className="coin-display">
            <div className="coin-front">
              <span className="coin-symbol">$TEX</span>
            </div>
            <div className="coin-back">
              <span className="coin-value">$800</span>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission" id="mission">
        <h2 className="section-title">Our Mission</h2>
        <div className="mission-grid">
          <div className="mission-card">
            <div className="mission-icon">🛡️</div>
            <h3>Anti-CBDC</h3>
            <p>
              Texit Coin stands as a bulwark against central bank digital currencies.
              We believe in financial sovereignty, not surveillance tokens.
            </p>
          </div>
          <div className="mission-card">
            <div className="mission-icon">🌐</div>
            <h3>Decentralized</h3>
            <p>
              No single point of failure. No central authority. No restrictions.
              The network is maintained by miners worldwide.
            </p>
          </div>
          <div className="mission-card">
            <div className="mission-icon">⛏️</div>
            <h3>Scrypt-Based</h3>
            <p>
              Leveraging the proven Scrypt algorithm for secure, efficient mining.
              GPU-friendly and accessible to all.
            </p>
          </div>
        </div>
      </section>

      {/* Specifications Section */}
      <section className="specs" id="specs">
        <h2 className="section-title">Technical Specifications</h2>
        <div className="specs-container">
          <div className="spec-item">
            <span className="spec-label">Total Supply</span>
            <span className="spec-value">100 Billion</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Consensus</span>
            <span className="spec-value">Proof-of-Work</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Algorithm</span>
            <span className="spec-value">Scrypt</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Block Time</span>
            <span className="spec-value">~60 seconds</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Mining Reward</span>
            <span className="spec-value">10,000 TXC</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Halving</span>
            <span className="spec-value">Every 4 Years</span>
          </div>
        </div>
      </section>

      {/* Phase 2 Section */}
      <section className="phase-section">
        <div className="phase-badge">Phase 2</div>
        <h2 className="phase-title">The Path to $800</h2>
        <p className="phase-description">
          As adoption grows and mining difficulty increases, Texit Coin is positioned
          to reach new milestones. The scarcity model combined with increasing demand
          creates a clear trajectory toward $800 per coin.
        </p>
        <div className="phase-roadmap">
          <div className="roadmap-item">
            <span className="roadmap-marker current" />
            <div className="roadmap-content">
              <h4>Current Phase</h4>
              <p>Network bootstrap & miner adoption</p>
            </div>
          </div>
          <div className="roadmap-item">
            <span className="roadmap-marker upcoming" />
            <div className="roadmap-content">
              <h4>Phase 2A</h4>
              <p>Exchange listings & merchant integration</p>
            </div>
          </div>
          <div className="roadmap-item">
            <span className="roadmap-marker future" />
            <div className="roadmap-content">
              <h4>Phase 2B</h4>
              <p>Institutional adoption begins</p>
            </div>
          </div>
          <div className="roadmap-item">
            <span className="roadmap-marker future" />
            <div className="roadmap-content">
              <h4>Phase 2C</h4>
              <p>Target: $800 per TXC</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mining Packages */}
      <MiningPackages
        title="Start Mining Today"
        subtitle="Choose your hardware package and join the network"
        coinType="texit"
      />

      {/* Footer CTA */}
      <section className="final-cta">
        <h2>Ready to Secure the Network?</h2>
        <p>Join thousands of miners building the future of Texit Coin.</p>
        <a href="https://minetxc.com" target="_blank" rel="noopener noreferrer" className="btn-large">
          Visit MineTXC.com
        </a>
      </section>

      <style>{`
        .texit-coin-page {
          min-height: 100vh;
          background: linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 100%);
          color: #fff;
        }

        /* Hero Section */
        .hero {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          padding: 6rem 2rem;
          max-width: 1400px;
          margin: 0 auto;
          align-items: center;
        }

        .hero-badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          background: rgba(255, 215, 0, 0.2);
          border: 1px solid #ffd700;
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #ffd700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 1.5rem;
        }

        .hero-title {
          font-size: 4rem;
          font-weight: 800;
          margin: 0 0 0.5rem;
          line-height: 1.1;
        }

        .title-highlight {
          color: #ffd700;
        }

        .hero-tagline {
          font-size: 1.5rem;
          color: rgba(255, 255, 255, 0.8);
          margin: 0 0 1.5rem;
        }

        .hero-description {
          font-size: 1.125rem;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.6;
          margin: 0 0 2rem;
          max-width: 500px;
        }

        .hero-actions {
          display: flex;
          gap: 1rem;
        }

        .btn-primary {
          display: inline-block;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
          color: #000;
          font-weight: 700;
          text-decoration: none;
          border-radius: 8px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: all 0.2s ease;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(255, 215, 0, 0.4);
        }

        .btn-secondary {
          display: inline-block;
          padding: 1rem 2rem;
          background: transparent;
          color: #fff;
          font-weight: 600;
          text-decoration: none;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .btn-secondary:hover {
          border-color: #ffd700;
          color: #ffd700;
        }

        .hero-visual {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .coin-display {
          width: 300px;
          height: 300px;
          position: relative;
          perspective: 1000px;
        }

        .coin-front,
        .coin-back {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          backface-visibility: hidden;
        }

        .coin-front {
          background: linear-gradient(135deg, #ffd700 0%, #b8860b 100%);
          box-shadow: 0 0 60px rgba(255, 215, 0, 0.3);
        }

        .coin-back {
          background: linear-gradient(135deg, #b8860b 0%, #8b6914 100%);
          transform: rotateY(180deg);
        }

        .coin-symbol {
          font-size: 3rem;
          font-weight: 800;
          color: #000;
        }

        .coin-value {
          font-size: 2.5rem;
          font-weight: 800;
          color: #000;
        }

        /* Mission Section */
        .mission {
          padding: 6rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 700;
          text-align: center;
          margin: 0 0 3rem;
          color: #fff;
        }

        .mission-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
        }

        .mission-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
        }

        .mission-card:hover {
          border-color: #ffd700;
          transform: translateY(-4px);
        }

        .mission-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .mission-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0 0 0.5rem;
          color: #ffd700;
        }

        .mission-card p {
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.6;
          margin: 0;
        }

        /* Specs Section */
        .specs {
          padding: 6rem 2rem;
          max-width: 1000px;
          margin: 0 auto;
        }

        .specs-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .spec-item {
          background: rgba(255, 215, 0, 0.05);
          border: 1px solid rgba(255, 215, 0, 0.2);
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .spec-label {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .spec-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: #ffd700;
        }

        /* Phase Section */
        .phase-section {
          padding: 6rem 2rem;
          max-width: 1000px;
          margin: 0 auto;
          text-align: center;
        }

        .phase-badge {
          display: inline-block;
          padding: 0.5rem 1.5rem;
          background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
          color: #000;
          font-size: 0.875rem;
          font-weight: 700;
          border-radius: 50px;
          text-transform: uppercase;
          margin-bottom: 1rem;
        }

        .phase-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0 0 1rem;
        }

        .phase-description {
          font-size: 1.125rem;
          color: rgba(255, 255, 255, 0.7);
          max-width: 700px;
          margin: 0 auto 3rem;
          line-height: 1.6;
        }

        .phase-roadmap {
          display: flex;
          flex-direction: column;
          gap: 0;
          position: relative;
          padding-left: 2rem;
        }

        .phase-roadmap::before {
          content: '';
          position: absolute;
          left: 6px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: rgba(255, 255, 255, 0.1);
        }

        .roadmap-item {
          display: flex;
          gap: 1.5rem;
          padding: 1.5rem 0;
          position: relative;
        }

        .roadmap-marker {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
        }

        .roadmap-marker.current {
          background: #ffd700;
          box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
        }

        .roadmap-marker.upcoming {
          background: #fff;
          border: 2px solid #ffd700;
        }

        .roadmap-marker.future {
          background: transparent;
          border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .roadmap-content {
          text-align: left;
        }

        .roadmap-content h4 {
          font-size: 1.125rem;
          font-weight: 700;
          margin: 0 0 0.25rem;
        }

        .roadmap-content p {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.875rem;
          margin: 0;
        }

        /* Final CTA */
        .final-cta {
          text-align: center;
          padding: 6rem 2rem;
          background: linear-gradient(180deg, transparent 0%, rgba(255, 215, 0, 0.05) 100%);
        }

        .final-cta h2 {
          font-size: 2rem;
          font-weight: 700;
          margin: 0 0 0.5rem;
        }

        .final-cta p {
          color: rgba(255, 255, 255, 0.6);
          margin: 0 0 2rem;
        }

        .btn-large {
          display: inline-block;
          padding: 1.25rem 3rem;
          background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
          color: #000;
          font-weight: 700;
          font-size: 1.125rem;
          text-decoration: none;
          border-radius: 8px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: all 0.2s ease;
        }

        .btn-large:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 30px rgba(255, 215, 0, 0.5);
        }

        @media (max-width: 768px) {
          .hero {
            grid-template-columns: 1fr;
            text-align: center;
            padding: 4rem 1.5rem;
          }

          .hero-title {
            font-size: 2.5rem;
          }

          .hero-description {
            max-width: 100%;
          }

          .hero-actions {
            justify-content: center;
          }

          .hero-visual {
            order: -1;
          }

          .coin-display {
            width: 200px;
            height: 200px;
          }
        }
      `}</style>
    </div>
  );
};

export default TexitCoin;
