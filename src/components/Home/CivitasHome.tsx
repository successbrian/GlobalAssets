/**
 * CivitasHome.tsx - Civitas Reserve Home Page
 * 
 * Features:
 * - Hero section with directory search
 * - Quick filter pillars
 * - Featured listings
 * - Strategic Alliances section (Vextor Grid cross-link)
 */

import React, { useState } from 'react';
import { QuickFilterPills } from '../Directory/QuickFilterPills';

export const CivitasHome: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <div className="civitas-home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Welcome to <span className="title-highlight">Civitas</span>
          </h1>
          <p className="hero-tagline">
            The Sovereign Directory of Commerce & Finance
          </p>
          
          {/* Search Bar */}
          <div className="search-container">
            <input
              type="text"
              placeholder="Search merchants, services, jobs..."
              className="search-input"
            />
            <button className="search-button">Search</button>
          </div>
        </div>
      </section>

      {/* Quick Filters */}
      <section className="quick-filters">
        <QuickFilterPills
          onSelect={(category) => setSelectedCategory(category)}
          selectedCategory={selectedCategory as string | null}
          variant="featured"
        />
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">156</span>
            <span className="stat-label">Verified Merchants</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">$4.2M</span>
            <span className="stat-label">TVL on DEX</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">1,240</span>
            <span className="stat-label">Active Citizens</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">342</span>
            <span className="stat-label">Market Listings</span>
          </div>
        </div>
      </section>

      {/* Strategic Alliances - Vextor Grid Cross-Link */}
      <section className="alliances-section">
        <div className="alliances-container">
          <div className="alliances-badge">Strategic Alliance</div>
          <h2 className="alliances-title">Powered by Vextor Grid</h2>
          <p className="alliances-description">
            The Sovereign Computing Network. Enterprise-grade GPU rendering,
            AI inference, and distributed computing for the Civitas ecosystem.
          </p>
          <div className="alliances-features">
            <div className="feature-item">
              <span className="feature-icon">🎨</span>
              <span className="feature-text">AI Image Generation</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🤖</span>
              <span className="feature-text">Machine Learning</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💻</span>
              <span className="feature-text">GPU Rendering</span>
            </div>
          </div>
          <a
            href="https://vextorgrid.com"
            target="_blank"
            rel="noopener noreferrer"
            className="alliances-button"
          >
            Visit Vextor Grid
            <span className="button-arrow">→</span>
          </a>
        </div>
      </section>

      {/* Partner Coins Section */}
      <section className="partners-section">
        <h2 className="section-title">Sovereign Currencies</h2>
        <div className="partners-grid">
          <a href="/partners/texit-coin" className="partner-card texit">
            <div className="partner-icon">🇺🇸</div>
            <div className="partner-content">
              <h3>Texit Coin</h3>
              <p>The Official Currency of the Independent Republic</p>
            </div>
            <span className="partner-arrow">→</span>
          </a>
          <a href="/partners/iskander-coin" className="partner-card iskander">
            <div className="partner-icon">🌍</div>
            <div className="partner-content">
              <h3>Iskander Coin</h3>
              <p>Phase 3: The Expansion</p>
            </div>
            <span className="partner-arrow">→</span>
          </a>
        </div>
      </section>

      <style>{`
        .civitas-home {
          min-height: 100vh;
          background: linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 100%);
          color: #fff;
        }

        /* Hero */
        .hero {
          padding: 6rem 2rem;
          text-align: center;
          max-width: 900px;
          margin: 0 auto;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          margin: 0 0 0.5rem;
          line-height: 1.1;
        }

        .title-highlight {
          color: #ffd700;
        }

        .hero-tagline {
          font-size: 1.5rem;
          color: rgba(255, 255, 255, 0.7);
          margin: 0 0 2rem;
        }

        .search-container {
          display: flex;
          gap: 0.5rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .search-input {
          flex: 1;
          padding: 1rem 1.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          font-size: 1rem;
          color: #fff;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .search-input:focus {
          border-color: #ffd700;
        }

        .search-input::placeholder {
          color: rgba(255, 255, 255, 0.4);
        }

        .search-button {
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
          border: none;
          border-radius: 8px;
          font-weight: 700;
          color: #000;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .search-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(255, 215, 0, 0.3);
        }

        /* Quick Filters */
        .quick-filters {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Stats Section */
        .stats-section {
          padding: 3rem 2rem;
          background: rgba(255, 215, 0, 0.02);
          border-top: 1px solid rgba(255, 215, 0, 0.1);
          border-bottom: 1px solid rgba(255, 215, 0, 0.1);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          color: #ffd700;
        }

        .stat-label {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.6);
        }

        /* Strategic Alliances */
        .alliances-section {
          padding: 6rem 2rem;
          background: linear-gradient(135deg, #0a0a1a 0%, #1a2a3a 100%);
        }

        .alliances-container {
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
        }

        .alliances-badge {
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

        .alliances-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0 0 1rem;
        }

        .alliances-description {
          font-size: 1.125rem;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.6;
          margin: 0 0 2rem;
        }

        .alliances-features {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
        }

        .feature-icon {
          font-size: 1.25rem;
        }

        .feature-text {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .alliances-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          background: linear-gradient(135deg, #00bfff 0%, #0080ff 100%);
          color: #000;
          font-weight: 700;
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .alliances-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0, 191, 255, 0.4);
        }

        .button-arrow {
          font-size: 1.25rem;
        }

        /* Partners Section */
        .partners-section {
          padding: 6rem 2rem;
          max-width: 1000px;
          margin: 0 auto;
        }

        .section-title {
          font-size: 2rem;
          font-weight: 700;
          text-align: center;
          margin: 0 0 2rem;
        }

        .partners-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .partner-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .partner-card:hover {
          transform: translateY(-2px);
          border-color: #ffd700;
        }

        .partner-card.texit:hover {
          border-color: #ffd700;
          background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, transparent 100%);
        }

        .partner-card.iskander:hover {
          border-color: #00bfff;
          background: linear-gradient(135deg, rgba(0, 191, 255, 0.1) 0%, transparent 100%);
        }

        .partner-icon {
          font-size: 2.5rem;
        }

        .partner-content {
          flex: 1;
        }

        .partner-content h3 {
          font-size: 1.125rem;
          font-weight: 700;
          margin: 0 0 0.25rem;
          color: #fff;
        }

        .partner-content p {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.5);
          margin: 0;
        }

        .partner-arrow {
          font-size: 1.5rem;
          color: rgba(255, 255, 255, 0.3);
          transition: all 0.2s ease;
        }

        .partner-card:hover .partner-arrow {
          color: #ffd700;
          transform: translateX(4px);
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }

          .search-container {
            flex-direction: column;
          }

          .alliances-features {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
};

export default CivitasHome;
