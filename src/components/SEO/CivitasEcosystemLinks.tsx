/**
 * CivitasEcosystemLinks.tsx - Trinity Cross-Linking Component
 * 
 * SEO Strategy:
 * - Creates cross-links between Civitas Reserve, DEX, and Market
 * - Uses distinct anchor text to pass authority between domains
 * - Improves internal linking structure for SEO dominance
 */

import React from 'react';

interface CivitasEcosystemLinksProps {
  variant?: 'horizontal' | 'vertical' | 'cards';
  showLabels?: boolean;
  className?: string;
}

export const CivitasEcosystemLinks: React.FC<CivitasEcosystemLinksProps> = ({
  variant = 'horizontal',
  showLabels = true,
  className = ''
}) => {
  const links = [
    {
      id: 'reserve',
      name: 'Civitas Reserve',
      tagline: 'The Sovereign Directory',
      url: 'https://civitasreserve.com',
      icon: '🏛️',
      color: '#ffd700',
      description: 'Discover verified merchants and sovereign services'
    },
    {
      id: 'dex',
      name: 'Civitas DEX',
      tagline: 'Trade & Yield',
      url: 'https://civitasdex.com',
      icon: '📈',
      color: '#00ff88',
      description: 'Swap tokens and earn asymmetric yields'
    },
    {
      id: 'market',
      name: 'Civitas Market',
      tagline: 'Goods & Services',
      url: 'https://civitasmarket.com',
      icon: '🛒',
      color: '#ff6b6b',
      description: 'Buy and sell with sovereign confidence'
    }
  ];

  if (variant === 'cards') {
    return (
      <div className={`civitas-ecosystem-links cards ${className}`}>
        <h3 className="ecosystem-title">Civitas Ecosystem</h3>
        <div className="ecosystem-grid">
          {links.map((link) => (
            <a 
              key={link.id}
              href={link.url}
              className="ecosystem-card"
              style={{ borderColor: link.color }}
              target="_blank"
              rel="noopener noreferrer"
              title={link.description}
            >
              <span className="card-icon">{link.icon}</span>
              <span className="card-name">{link.name}</span>
              {showLabels && <span className="card-tagline">{link.tagline}</span>}
            </a>
          ))}
        </div>
        
        <style>{`
          .civitas-ecosystem-links.cards {
            padding: 1.5rem 0;
          }
          
          .ecosystem-title {
            color: #fff;
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 1rem;
            text-align: center;
          }
          
          .ecosystem-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
          }
          
          .ecosystem-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 1rem;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid;
            border-radius: 8px;
            text-decoration: none;
            transition: all 0.3s ease;
          }
          
          .ecosystem-card:hover {
            background: rgba(255, 255, 255, 0.08);
            transform: translateY(-2px);
          }
          
          .card-icon {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
          }
          
          .card-name {
            color: #fff;
            font-weight: 600;
            font-size: 0.875rem;
          }
          
          .card-tagline {
            color: rgba(255, 255, 255, 0.6);
            font-size: 0.75rem;
            margin-top: 0.25rem;
          }
          
          @media (max-width: 768px) {
            .ecosystem-grid {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    );
  }

  if (variant === 'vertical') {
    return (
      <div className={`civitas-ecosystem-links vertical ${className}`}>
        {links.map((link) => (
          <a 
            key={link.id}
            href={link.url}
            className="vertical-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="link-icon">{link.icon}</span>
            <span className="link-text">
              <span className="link-name">{link.name}</span>
              {showLabels && <span className="link-tagline">{link.tagline}</span>}
            </span>
          </a>
        ))}
        
        <style>{`
          .civitas-ecosystem-links.vertical {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            padding: 1rem 0;
          }
          
          .vertical-link {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem 1rem;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 6px;
            text-decoration: none;
            transition: all 0.2s ease;
          }
          
          .vertical-link:hover {
            background: rgba(255, 255, 255, 0.08);
          }
          
          .link-icon {
            font-size: 1.25rem;
          }
          
          .link-text {
            display: flex;
            flex-direction: column;
          }
          
          .link-name {
            color: #fff;
            font-weight: 500;
            font-size: 0.875rem;
          }
          
          .link-tagline {
            color: rgba(255, 255, 255, 0.5);
            font-size: 0.75rem;
          }
        `}</style>
      </div>
    );
  }

  // Horizontal default
  return (
    <div className={`civitas-ecosystem-links horizontal ${className}`}>
      <div className="ecosystem-divider">
        <span className="divider-label">Powered by</span>
      </div>
      {links.map((link, index) => (
        <React.Fragment key={link.id}>
          <a 
            href={link.url}
            className="horizontal-link"
            target="_blank"
            rel="noopener noreferrer"
            title={link.description}
          >
            <span className="link-icon">{link.icon}</span>
            <span className="link-name">{link.name}</span>
            {showLabels && <span className="link-tagline">{link.tagline}</span>}
          </a>
          {index < links.length - 1 && <span className="link-separator">|</span>}
        </React.Fragment>
      ))}
      
      <style>{`
        .civitas-ecosystem-links.horizontal {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 0.5rem;
          padding: 1.5rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .ecosystem-divider {
          margin-right: 1rem;
        }
        
        .divider-label {
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .horizontal-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          color: #fff;
          text-decoration: none;
          font-size: 0.875rem;
          border-radius: 4px;
          transition: all 0.2s ease;
        }
        
        .horizontal-link:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .link-icon {
          font-size: 1rem;
        }
        
        .link-name {
          font-weight: 600;
        }
        
        .link-tagline {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.75rem;
          margin-left: 0.25rem;
        }
        
        .link-separator {
          color: rgba(255, 255, 255, 0.2);
          margin: 0 0.25rem;
        }
      `}</style>
    </div>
  );
};

export default CivitasEcosystemLinks;
