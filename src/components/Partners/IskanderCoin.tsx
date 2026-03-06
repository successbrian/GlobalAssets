/**
 * IskanderCoin.tsx - Phase 3: The Expansion
 * Route: /partners/iskander-coin
 * 
 * Features:
 * - Phase 3 narrative (next evolution of Texit ecosystem)
 * - Standardized pricing note
 * - MiningPackages integration (same tiers as Texit)
 */

import React from 'react';
import { MiningPackages } from './MiningPackages';

export const IskanderCoin: React.FC = () => {
  return (
    <div className="iskander-coin-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">Phase 3</div>
          <h1 className="hero-title">
            <span className="title-highlight">Iskander</span> Coin
          </h1>
          <p className="hero-tagline">
            The Expansion
          </p>
          <p className="hero-description">
            The next evolution of the Texit ecosystem. Same proven mining model,
            same standardized pricing, expanded vision for the future of
            decentralized finance.
          </p>
          <div className="hero-actions">
            <a href="https://minetxc.com" target="_blank" rel="noopener noreferrer" className="btn-primary">
              Start Mining
            </a>
            <a href="#about" className="btn-secondary">
              Learn More
            </a>
          </div>
        </div>
        <div className="hero-visual">
          <div className="coin-display">
            <div className="iskander-coin">
              <span className="iskander-symbol">$ISK</span>
              <span className="iskander-subtitle">The Future</span>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about" id="about">
        <h2 className="section-title">The Next Evolution</h2>
        <div className="about-grid">
          <div className="about-card">
            <div className="about-icon">🚀</div>
            <h3>Expanded Vision</h3>
            <p>
              Iskander Coin builds on the solid foundation of Texit, bringing
              enhanced features and broader adoption potential to the ecosystem.
            </p>
          </div>
          <div className="about-card">
            <div className="about-icon">🔗</div>
            <h3>Ecosystem Integration</h3>
            <p>
              Seamless integration with the broader Civitas network, opening
              new possibilities for merchants, miners, and investors.
            </p>
          </div>
          <div className="about-card">
            <div className="about-icon">📈</div>
            <h3>Growth Trajectory</h3>
            <p>
              Following the proven path of Texit with improved tokenomics
              and expanded use cases for real-world adoption.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Standardization */}
      <section className="pricing-section">
        <div className="pricing-badge">
          <span className="badge-icon">💎</span>
          Standardized Pricing Active
        </div>
        <h2 className="pricing-title">Fair. Transparent. Predictable.</h2>
        <p className="pricing-description">
          We believe in transparency. That's why Iskander Coin uses the same
          standardized pricing tiers as Texit Coin. No hidden fees, no
          surprise markups. What you see is what you pay.
        </p>
        
        <div className="pricing-comparison">
          <div className="comparison-item">
            <span className="comparison-label">Single Miner</span>
            <span className="comparison-value">$995</span>
          </div>
          <div className="comparison-divider" />
          <div className="comparison-item">
            <span className="comparison-label">Triple Plan</span>
            <span className="comparison-value">$2,985</span>
          </div>
          <div className="comparison-divider" />
          <div className="comparison-item">
            <span className="comparison-label">Builder Plan</span>
            <span className="comparison-value">$8,955</span>
          </div>
        </div>
        
        <p className="pricing-note">
          Same hardware. Same hash power. Same great value. The only thing
          that changes is the coin you mine.
        </p>
      </section>

      {/* Mining Packages */}
      <MiningPackages
        title="Start Mining Iskander"
        subtitle="Choose your hardware package and join the expansion"
        coinType="iskander"
      />

      {/* Roadmap Section */}
      <section className="roadmap-section">
        <h2 className="section-title">Phase 3 Roadmap</h2>
        <div className="roadmap-grid">
          <div className="roadmap-card current">
            <span className="roadmap-phase">3.1</span>
            <h3>Launch</h3>
            <p>Network activation and initial miner onboarding</p>
          </div>
          <div className="roadmap-card upcoming">
            <span className="roadmap-phase">3.2</span>
            <h3>Integration</h3>
            <p>Civitas ecosystem integration and merchant adoption</p>
          </div>
          <div className="roadmap-card upcoming">
            <span className="roadmap-phase">3.3</span>
            <h3>Expansion</h3>
            <p>Exchange listings and global accessibility</p>
          </div>
          <div className="roadmap-card future">
            <span className="roadmap-phase">3.4</span>
            <h3>Dominance</h3>
            <p>Market leadership in sovereign cryptocurrency</p>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="final-cta">
        <h2>Be Part of the Expansion</h2>
        <p>Join the next chapter of sovereign cryptocurrency.</p>
        <a href="https://minetxc.com" target="_blank" rel="noopener noreferrer" className="btn-large">
          Visit MineTXC.com
        </a>
      </section>

      <style>{`
        .iskander-coin-page {
          min-height: 100vh;
          background: linear-gradient(180deg, #0a0a1a 0%, #0a1a2e 100%);
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
          background: rgba(0, 191, 255, 0.2);
          border: 1px solid #00bfff;
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #00bfff;
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
          color: #00bfff;
        }

        .hero-tagline {
          font-size: 2rem;
          color: rgba(255, 255, 255, 0.8);
          margin: 0 0 1.5rem;
          font-weight: 300;
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
          background: linear-gradient(135deg, #00bfff 0%, #0080ff 100%);
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
          box-shadow: 0 4px 20px rgba(0, 191, 255, 0.4);
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
          border-color: #00bfff;
          color: #00bfff;
        }

        .hero-visual {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .iskander-coin {
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: linear-gradient(135deg, #00bfff 0%, #0066cc 100%);
          box-shadow: 0 0 60px rgba(0, 191, 255, 0.3);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .iskander-symbol {
          font-size: 3rem;
          font-weight: 800;
          color: #fff;
        }

        .iskander-subtitle {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.8);
          margin-top: 0.5rem;
        }

        /* About Section */
        .about {
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

        .about-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
        }

        .about-card {
          background: rgba(0, 191, 255, 0.05);
          border: 1px solid rgba(0, 191, 255, 0.2);
          border-radius: 16px;
          padding: 2rem;
          text-align: center;
        }

        .about-card:hover {
          border-color: #00bfff;
          transform: translateY(-4px);
        }

        .about-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .about-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 0 0 0.5rem;
          color: #00bfff;
        }

        .about-card p {
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.6;
          margin: 0;
        }

        /* Pricing Section */
        .pricing-section {
          padding: 6rem 2rem;
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
        }

        .pricing-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: rgba(0, 255, 136, 0.1);
          border: 1px solid #00ff88;
          border-radius: 50px;
          font-size: 0.875rem;
          font-weight: 600;
          color: #00ff88;
          margin-bottom: 1.5rem;
        }

        .pricing-title {
          font-size: 2rem;
          font-weight: 700;
          margin: 0 0 1rem;
        }

        .pricing-description {
          font-size: 1.125rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
          margin: 0 0 2rem;
        }

        .pricing-comparison {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2rem;
          margin: 2rem 0;
          flex-wrap: wrap;
        }

        .comparison-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .comparison-label {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .comparison-value {
          font-size: 2rem;
          font-weight: 700;
          color: #00ff88;
        }

        .comparison-divider {
          width: 2px;
          height: 50px;
          background: rgba(255, 255, 255, 0.1);
        }

        .pricing-note {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.5);
          font-style: italic;
        }

        /* Roadmap Section */
        .roadmap-section {
          padding: 6rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .roadmap-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.5rem;
        }

        .roadmap-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 1.5rem;
          position: relative;
          overflow: hidden;
        }

        .roadmap-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
        }

        .roadmap-card.current::before {
          background: #00bfff;
        }

        .roadmap-card.upcoming::before {
          background: rgba(0, 191, 255, 0.5);
        }

        .roadmap-card.future::before {
          background: rgba(255, 255, 255, 0.2);
        }

        .roadmap-phase {
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 700;
          color: #00bfff;
          margin-bottom: 0.5rem;
        }

        .roadmap-card h3 {
          font-size: 1.125rem;
          font-weight: 700;
          margin: 0 0 0.5rem;
        }

        .roadmap-card p {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.5);
          margin: 0;
        }

        /* Final CTA */
        .final-cta {
          text-align: center;
          padding: 6rem 2rem;
          background: linear-gradient(180deg, transparent 0%, rgba(0, 191, 255, 0.05) 100%);
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
          background: linear-gradient(135deg, #00bfff 0%, #0080ff 100%);
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
          box-shadow: 0 4px 30px rgba(0, 191, 255, 0.5);
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

          .iskander-coin {
            width: 200px;
            height: 200px;
          }
        }
      `}</style>
    </div>
  );
};

export default IskanderCoin;
