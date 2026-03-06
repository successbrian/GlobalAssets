/**
 * MiningPackages.tsx - Hardware Mining Tiers Component
 * 
 * Displays Texit and Iskander mining hardware packages.
 * Data hardcoded as per requirements.
 */

import React, { useState } from 'react';

interface MiningPackage {
  id: string;
  name: string;
  price: number;
  hashRate: number;
  unit: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  partnerUrl: string;
}

const miningPackages: MiningPackage[] = [
  {
    id: 'single',
    name: 'Single Miner',
    price: 995,
    hashRate: 100,
    unit: 'MH/s',
    description: 'Starter Rig',
    features: [
      'Plug & Play Setup',
      'Low Power Consumption',
      'Quiet Operation',
      'Perfect for Beginners',
      '24/7 Support Included'
    ],
    partnerUrl: 'https://minetxc.com'
  },
  {
    id: 'triple',
    name: 'Triple Plan',
    price: 2985,
    hashRate: 300,
    unit: 'MH/s',
    description: 'Most Popular',
    features: [
      '3x Mining Power',
      'Priority Shipping',
      'Volume Discount',
      'ROI Calculator Included',
      'Dedicated Support'
    ],
    isPopular: true,
    partnerUrl: 'https://minetxc.com'
  },
  {
    id: 'builder',
    name: 'Builder Plan',
    price: 8955,
    hashRate: 900,
    unit: 'MH/s',
    description: 'Empire Builder',
    features: [
      'Maximum Hash Power',
      'Enterprise Hardware',
      'Free Shipping Worldwide',
      '1-on-1 Onboarding',
      'VIP Access to Updates'
    ],
    partnerUrl: 'https://minetxc.com'
  }
];

interface MiningPackagesProps {
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'minimal' | 'featured';
  coinType?: 'texit' | 'iskander';
  showDivider?: boolean;
  className?: string;
}

export const MiningPackages: React.FC<MiningPackagesProps> = ({
  title = 'Mining Hardware Packages',
  subtitle = 'Choose your path to sovereign wealth',
  variant = 'default',
  coinType = 'texit',
  showDivider = true,
  className = ''
}) => {
  const [hoveredPackage, setHoveredPackage] = useState<string | null>(null);

  const getCoinInfo = () => {
    if (coinType === 'iskander') {
      return {
        name: 'Iskander Coin',
        color: '#00bfff',
        accentColor: '#0080ff',
        tagline: 'Phase 3: The Expansion'
      };
    }
    return {
      name: 'Texit Coin',
      color: '#ffd700',
      accentColor: '#ffaa00',
      tagline: 'The Currency of Liberty'
    };
  };

  const coinInfo = getCoinInfo();

  return (
    <div className={`mining-packages ${variant} ${className}`}>
      {/* Header */}
      <div className="packages-header" style={{ borderColor: coinInfo.color }}>
        <h2 className="packages-title" style={{ color: coinInfo.color }}>
          {title}
        </h2>
        <p className="packages-subtitle">{subtitle}</p>
        <div className="packages-badge" style={{ backgroundColor: coinInfo.color }}>
          {coinInfo.tagline}
        </div>
      </div>

      {/* Packages Grid */}
      <div className="packages-grid">
        {miningPackages.map((pkg) => (
          <div
            key={pkg.id}
            className={`package-card ${pkg.isPopular ? 'popular' : ''} ${hoveredPackage === pkg.id ? 'hovered' : ''}`}
            onMouseEnter={() => setHoveredPackage(pkg.id)}
            onMouseLeave={() => setHoveredPackage(null)}
            style={{
              '--coin-color': coinInfo.color,
              '--coin-accent': coinInfo.accentColor
            } as React.CSSProperties}
          >
            {pkg.isPopular && (
              <div className="popular-badge">Most Popular</div>
            )}

            <div className="package-header">
              <h3 className="package-name">{pkg.name}</h3>
              <p className="package-description">{pkg.description}</p>
            </div>

            <div className="package-pricing">
              <span className="package-price">${pkg.price.toLocaleString()}</span>
              <span className="package-period">One-time</span>
            </div>

            <div className="package-hashrate">
              <span className="hashrate-value">{pkg.hashRate}</span>
              <span className="hashrate-unit">{pkg.unit}</span>
            </div>

            <ul className="package-features">
              {pkg.features.map((feature, index) => (
                <li key={index} className="feature-item">
                  <span className="feature-check" style={{ color: coinInfo.color }}>✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <a
              href={pkg.partnerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="buy-button"
              style={{
                background: `linear-gradient(135deg, ${coinInfo.color} 0%, ${coinInfo.accentColor} 100%)`
              }}
            >
              Buy Now
            </a>
          </div>
        ))}
      </div>

      {/* Divider */}
      {showDivider && (
        <div className="packages-divider">
          <span className="divider-text">Standardized Pricing</span>
          <div className="divider-line" />
        </div>
      )}

      <style>{`
        .mining-packages {
          padding: 2rem 0;
        }

        .mining-packages.minimal {
          padding: 1rem 0;
        }

        .packages-header {
          text-align: center;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 2px solid;
        }

        .packages-title {
          font-size: 2rem;
          font-weight: 700;
          margin: 0 0 0.5rem;
        }

        .packages-subtitle {
          color: rgba(255, 255, 255, 0.6);
          font-size: 1rem;
          margin: 0 0 1rem;
        }

        .packages-badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          border-radius: 50px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #000;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .packages-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .package-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 1.5rem;
          transition: all 0.3s ease;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .package-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          border-color: var(--coin-color);
        }

        .package-card.popular {
          background: linear-gradient(135deg, var(--coin-color)15 0%, var(--coin-color)05 100%);
          border-color: var(--coin-color);
        }

        .popular-badge {
          position: absolute;
          top: -10px;
          right: 20px;
          background: var(--coin-color);
          color: #000;
          padding: 0.35rem 0.75rem;
          border-radius: 50px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .package-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .package-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: #fff;
          margin: 0 0 0.25rem;
        }

        .package-description {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.875rem;
          margin: 0;
        }

        .package-pricing {
          text-align: center;
          margin-bottom: 1rem;
        }

        .package-price {
          font-size: 2.5rem;
          font-weight: 700;
          color: #fff;
        }

        .package-period {
          display: block;
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.75rem;
        }

        .package-hashrate {
          text-align: center;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          margin-bottom: 1.5rem;
        }

        .hashrate-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--coin-color);
        }

        .hashrate-unit {
          font-size: 1rem;
          color: rgba(255, 255, 255, 0.6);
          margin-left: 0.25rem;
        }

        .package-features {
          list-style: none;
          padding: 0;
          margin: 0 0 1.5rem;
          flex: 1;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.875rem;
        }

        .feature-check {
          font-weight: 700;
        }

        .buy-button {
          display: block;
          text-align: center;
          padding: 1rem;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 700;
          font-size: 1rem;
          color: #000;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: all 0.2s ease;
        }

        .buy-button:hover {
          transform: scale(1.02);
          box-shadow: 0 4px 16px rgba(255, 215, 0, 0.3);
        }

        .packages-divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 2rem 0;
        }

        .divider-text {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.875rem;
          white-space: nowrap;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
        }

        @media (max-width: 768px) {
          .packages-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default MiningPackages;
