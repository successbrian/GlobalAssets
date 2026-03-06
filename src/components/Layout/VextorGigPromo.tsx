/**
 * ============================================================================
 * VEXTOR GIG PROMO - The Signpost
 * ============================================================================
 * Pre-Footer promotional component driving traffic to VextorGrid
 * Placed ABOVE the BannerBedlam widget in GlobalFooter
 * 
 * Theme: Dark Cyber-Grid pattern (Vextor Branding)
 * ============================================================================
 */

import React from 'react';

// UTM-tagged VextorGrid URLs
const VEXTOR_URLS = {
  findWork: 'https://vextorgrid.com/gigs/find?source=civitas_reserve&medium=footer_banner',
  hireHelp: 'https://vextorgrid.com/gigs/post?source=civitas_reserve&medium=footer_banner'
};

// Pages where promo should be hidden
const EXCLUDED_PATHS = ['/checkout', '/launchpad', '/admin'];

interface VextorGigPromoProps {
  currentPath?: string;
  className?: string;
}

/**
 * Cyber-grid background pattern component
 */
const CyberGridPattern = () => (
  <div 
    className="absolute inset-0 overflow-hidden pointer-events-none"
    style={{
      background: `
        linear-gradient(90deg, rgba(0, 255, 136, 0.03) 1px, transparent 1px),
        linear-gradient(rgba(0, 255, 136, 0.03) 1px, transparent 1px)
      `,
      backgroundSize: '40px 40px',
      maskImage: 'linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)'
    }}
  >
    {/* Animated grid lines */}
    <div className="absolute inset-0 animate-pulse opacity-30">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-vextor-green to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-vextor-green to-transparent" />
      <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-vextor-green to-transparent" />
      <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-vextor-green to-transparent" />
    </div>
  </div>
);

/**
 * Lightning bolt icon
 */
const LightningIcon = () => (
  <svg 
    className="w-8 h-8 text-vextor-green animate-pulse" 
    fill="currentColor" 
    viewBox="0 0 24 24"
  >
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

/**
 * Check if promo should be visible on current page
 */
function shouldShowPromo(currentPath: string = ''): boolean {
  return !EXCLUDED_PATHS.some(excluded => 
    currentPath.toLowerCase().includes(excluded.toLowerCase())
  );
}

export const VextorGigPromo: React.FC<VextorGigPromoProps> = ({ 
  currentPath = '', 
  className = '' 
}) => {
  if (!shouldShowPromo(currentPath)) {
    return null;
  }

  return (
    <section 
      className={`vextor-gig-promo ${className}`}
      style={{
        background: 'linear-gradient(180deg, #0a0f0d 0%, #0d1a14 50%, #0a0f0d 100%)',
        borderTop: '2px solid rgba(0, 255, 136, 0.3)'
      }}
    >
      <CyberGridPattern />
      
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* Main Content */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* Left: Icon + Headline */}
          <div className="flex items-center gap-6">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.2) 0%, rgba(0, 200, 100, 0.1) 100%)',
                border: '1px solid rgba(0, 255, 136, 0.4)'
              }}
            >
              <LightningIcon />
            </div>
            
            <div>
              <h2 
                className="text-3xl font-bold"
                style={{ 
                  color: '#00ff88',
                  textShadow: '0 0 30px rgba(0, 255, 136, 0.5)',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  letterSpacing: '0.05em'
                }}
              >
                WORK THE GRID.
              </h2>
              <p 
                className="text-gray-400 mt-1 max-w-md"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                Don't just live here. Build here. Post a task or find a gig on the Sovereign Labor Network.
              </p>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={VEXTOR_URLS.findWork}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative px-8 py-4 rounded-xl font-bold text-white overflow-hidden transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #00c864 0%, #00a050 100%)',
                boxShadow: '0 4px 20px rgba(0, 200, 100, 0.4)'
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                Find Work
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            
            <a
              href={VEXTOR_URLS.hireHelp}
              target="_blank"
              rel="noopener noreferrer"
              className="group px-8 py-4 rounded-xl font-bold text-white overflow-hidden transition-all hover:scale-105 border-2"
              style={{
                borderColor: 'rgba(0, 255, 136, 0.5)',
                background: 'rgba(0, 0, 0, 0.3)',
                boxShadow: 'inset 0 0 20px rgba(0, 255, 136, 0.1)'
              }}
            >
              <span className="relative z-10 flex items-center gap-2">
                Hire Help
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </span>
            </a>
          </div>
        </div>

        {/* Footer Badge */}
        <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-gray-800">
          <span className="text-xs text-gray-500 uppercase tracking-widest">
            Powered by
          </span>
          <span 
            className="text-sm font-bold"
            style={{ color: '#00ff88' }}
          >
            VEXTOR GRID
          </span>
          <span className="text-xs text-gray-600">
            | Sovereign Labor Network
          </span>
        </div>
      </div>

      {/* CSS-in-JS for custom styles */}
      <style>{`
        .vextor-gig-promo {
          position: relative;
          isolation: isolate;
        }
        
        .vextor-gig-promo:hover {
          borderTopColor: rgba(0, 255, 136, 0.6);
          transition: borderTopColor 0.3s ease;
        }

        .vextor-green {
          color: #00ff88;
        }

        .bg-vextor-green {
          background-color: #00ff88;
        }

        .border-vextor-green {
          border-color: #00ff88;
        }

        @keyframes vextor-pulse {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }

        .animate-vextor-pulse {
          animation: vextor-pulse 2s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default VextorGigPromo;
