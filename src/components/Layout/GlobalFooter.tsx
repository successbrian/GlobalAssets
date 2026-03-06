/**
 * GlobalFooter.tsx - Master Footer for Civitas Ecosystem
 * 
 * Features:
 * - CivitasEcosystemLinks: Trinity cross-linking
 * - BannerBedlamWidget: Lazy-loaded ad display
 * - Browser compatibility polyfills for older Safari
 */

import React from 'react';
import { CivitasEcosystemLinks } from '../SEO/CivitasEcosystemLinks';
import { BannerBedlamWidget } from '../Widgets/BannerBedlamWidget';
import { VextorGigPromo } from './VextorGigPromo';
import { NovusferreInlineLink } from '../Promos/NovusferreLink';

// Polyfill for IntersectionObserver (Safari < 14)
if (typeof window !== 'undefined' && !window.IntersectionObserver) {
  // @ts-ignore
  window.IntersectionObserver = class IntersectionObserver {
    constructor(callback: IntersectionObserverCallback) {
      this.callback = callback;
    }
    observe() { return []; }
    unobserve() { return; }
    disconnect() { return; }
  };
}

interface GlobalFooterProps {
  variant?: 'default' | 'minimal' | 'dashboard';
  showAds?: boolean;
  adZoneId?: string;
  className?: string;
}

export const GlobalFooter: React.FC<GlobalFooterProps> = ({
  variant = 'default',
  showAds = true,
  adZoneId = 'footer-zone-001',
  className = ''
}) => {
  const [showAd, setShowAd] = React.useState(showAds);

  if (variant === 'minimal') {
    return (
      <footer className={`global-footer minimal ${className}`}>
        <div className="footer-content">
          <p className="copyright">© 2025 Civitas Sovereign Network</p>
        </div>
      </footer>
    );
  }

  return (
    <footer className={`global-footer ${variant} ${className}`}>
      <div className="footer-container">
        {/* VextorGigPromo - The Signpost to VextorGrid */}
        <VextorGigPromo currentPath={typeof window !== 'undefined' ? window.location.pathname : ''} />
        
        {/* Trinity Cross-Linking */}
        <CivitasEcosystemLinks />
        
        {/* BannerBedlam Ad Widget */}
        {showAd && (
          <BannerBedlamWidget 
            zoneId={adZoneId} 
            onError={() => setShowAd(false)}
          />
        )}
        
        {/* Standard Footer Links */}
        <div className="footer-links">
          <div className="link-group">
            <h4>Resources</h4>
            <a href="/docs">Documentation</a>
            <a href="/api">API Reference</a>
            <a href="/status">System Status</a>
          </div>
          
          <div className="link-group">
            <h4>Legal</h4>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="/compliance">Compliance</a>
          </div>
          
          <div className="link-group">
            <h4>Support</h4>
            <a href="/help">Help Center</a>
            <a href="/contact">Contact Us</a>
            <a href="/bug-bounty">Bug Bounty</a>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="footer-bottom">
          <p className="copyright">
            © 2025 Civitas Sovereign Network. All rights reserved.
          </p>
          <p className="tagline">
            Building the decentralized future, one block at a time.
          </p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <NovusferreInlineLink />
          </div>
        </div>
      </div>
      
      <style>{`
        .global-footer {
          background: linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 100%);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding: 2rem 0 0;
          margin-top: auto;
        }
        
        .global-footer.dashboard {
          background: #0f0f1a;
          border-top: 1px solid rgba(255, 215, 0, 0.2);
        }
        
        .footer-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }
        
        .footer-links {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 2rem;
          padding: 2rem 0;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .link-group h4 {
          color: #ffd700;
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 1rem;
        }
        
        .link-group a {
          display: block;
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          font-size: 0.875rem;
          padding: 0.35rem 0;
          transition: color 0.2s ease;
        }
        
        .link-group a:hover {
          color: #fff;
        }
        
        .footer-bottom {
          text-align: center;
          padding: 1.5rem 0;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .copyright {
          color: rgba(255, 255, 255, 0.5);
          font-size: 0.875rem;
        }
        
        .tagline {
          color: rgba(255, 215, 0, 0.6);
          font-size: 0.75rem;
          margin-top: 0.5rem;
          font-style: italic;
        }
        
        .global-footer.minimal {
          padding: 1rem 0;
          text-align: center;
        }
      `}</style>
    </footer>
  );
};

export default GlobalFooter;
