/**
 * ============================================================================
 * THE SOVEREIGN FAMILY BRIDGE - Novusferre Link
 * ============================================================================
 * Promotional component for Novusferre.com (Sovereign Dating)
 * Platinum/Silver aesthetic to contrast with Civitas Gold
 * ============================================================================
 */

import React from 'react';

// Configuration
const NOVUSFERRE_URL = import.meta.env.VITE_NOVUSFERRE_URL || 'https://novusferre.com';
const REFERRAL_PARAMS = '?source=civitas_reserve&medium=real_estate_listing&has_real_estate=true';

/**
 * Full Promotional Card Component
 * Used in Real Estate Listing sidebar
 */
export function NovusferreLink({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg border border-gray-700 hover:border-platinum-400 transition-colors">
        <span className="text-xl">💑</span>
        <a 
          href={`${NOVUSFERRE_URL}${REFERRAL_PARAMS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-300 hover:text-platinum-300 text-sm font-medium transition-colors"
        >
          Find your match on Novusferre
        </a>
      </div>
    );
  }

  return (
    <div 
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #2d2d44 50%, #1a1a2e 100%)',
        border: '1px solid rgba(192, 192, 192, 0.3)'
      }}
    >
      {/* Platinum accent glow */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          background: 'radial-gradient(ellipse at top right, rgba(192, 192, 192, 0.3), transparent 60%)'
        }}
      />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{
              background: 'linear-gradient(135deg, #c0c0c0 0%, #a8a8a8 100%)',
              boxShadow: '0 4px 15px rgba(192, 192, 192, 0.3)'
            }}
          >
            💑
          </div>
          <div>
            <h3 
              className="text-lg font-bold"
              style={{ 
                color: '#e5e5e5',
                textShadow: '0 0 20px rgba(192, 192, 192, 0.3)'
              }}
            >
              Novusferre
            </h3>
            <p className="text-gray-400 text-xs uppercase tracking-widest">
              Sovereign Dating
            </p>
          </div>
        </div>

        {/* Copy */}
        <p className="text-gray-300 text-sm leading-relaxed mb-6">
          A house is not a home until it is filled with family. 
          Find a partner who shares your values, your vision, 
          and your sovereignty.
        </p>

        {/* CTA Button */}
        <a
          href={`${NOVUSFERRE_URL}${REFERRAL_PARAMS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative w-full py-4 rounded-xl font-bold text-white overflow-hidden transition-all hover:scale-[1.02]"
          style={{
            background: 'linear-gradient(135deg, #c0c0c0 0%, #888888 100%)',
            boxShadow: '0 4px 20px rgba(192, 192, 192, 0.3)'
          }}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            Find Your Match
            <svg 
              className="w-4 h-4 group-hover:translate-x-1 transition-transform" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
          
          {/* Hover shine effect */}
          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>

        {/* Badge benefit */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-platinum-400">
          <span>✨</span>
          <span>Homeowner badge applied automatically</span>
        </div>
      </div>

      {/* Decorative bottom accent */}
      <div 
        className="h-1 w-full"
        style={{
          background: 'linear-gradient(90deg, transparent, #c0c0c0, transparent)'
        }}
      />
    </div>
  );
}

/**
 * Inline Link Component
 * Used in footers and smaller spaces
 */
export function NovusferreInlineLink() {
  return (
    <a 
      href={`${NOVUSFERRE_URL}${REFERRAL_PARAMS}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-gray-400 hover:text-platinum-300 transition-colors text-sm"
    >
      <span className="text-xs">💑</span>
      <span>Sovereign Dating</span>
    </a>
  );
}

/**
 * Floating Widget (for persistent display)
 */
export function NovusferreWidget() {
  return (
    <div 
      className="fixed bottom-6 right-6 z-50 w-72"
      style={{ zIndex: 9999 }}
    >
      <div className="relative">
        {/* Close button */}
        <button 
          className="absolute -top-2 -right-2 w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white text-xs border border-gray-600 z-10"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // Would hide widget in production
          }}
        >
          ×
        </button>

        <NovusferreLink compact />
      </div>
    </div>
  );
}

export default NovusferreLink;
