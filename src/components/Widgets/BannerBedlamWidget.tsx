/**
 * BannerBedlamWidget.tsx - Lazy-Loaded Ad Display Component
 * 
 * Features:
 * - Lazy loads BannerBedlam ads using - F IntersectionObserver
 *ails gracefully: collapses to 0px if ad fails to load
 * - Core Web Vitals friendly (doesn't block main thread)
 * - Configurable zone ID and fallback behavior
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

// BannerBedlam API configuration
const BANNERBEDLAM_API_BASE = 'https://bannerbedlam.com/api';

interface BannerBedlamWidgetProps {
  zoneId: string;
  width?: number;
  height?: number;
  fallbackText?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
  className?: string;
  testMode?: boolean;
}

interface AdResponse {
  success: boolean;
  data?: {
    banner_url: string;
    click_url: string;
    impression_id: string;
    alt_text?: string;
  };
  error?: string;
}

export const BannerBedlamWidget: React.FC<BannerBedlamWidgetProps> = ({
  zoneId,
  width = 728,
  height = 90,
  fallbackText = 'Advertisement',
  onLoad,
  onError,
  className = '',
  testMode = false
}) => {
  const [adData, setAdData] = useState<AdResponse['data'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch ad data from BannerBedlam API
  const fetchAd = useCallback(async () => {
    if (testMode) {
      // Test mode: simulate ad response
      setAdData({
        banner_url: 'https://via.placeholder.com/728x90/1a1a2e/ffd700?text=BannerBedlam+Test+Ad',
        click_url: 'https://bannerbedlam.com',
        impression_id: 'test-impression-' + Date.now(),
        alt_text: 'Test advertisement'
      });
      setIsLoading(false);
      onLoad?.();
      return;
    }

    try {
      const response = await fetch(`${BANNERBEDLAM_API_BASE}/zone/${zoneId}/fetch`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        // Prevent caching issues
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: AdResponse = await response.json();

      if (data.success && data.data) {
        setAdData(data.data);
        onLoad?.();
      } else {
        throw new Error(data.error || 'Failed to fetch ad');
      }
    } catch (error) {
      setHasError(true);
      setIsCollapsed(true);
      onError?.(error instanceof Error ? error : new Error('Unknown error'));
      console.warn('[BannerBedlamWidget] Ad fetch failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [zoneId, testMode, onLoad, onError]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    // Create observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Fetch ad when component becomes visible
          fetchAd();
          // Disconnect after first intersection
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin: '100px', // Start loading 100px before visible
        threshold: 0
      }
    );

    // Observe container
    if (containerRef.current) {
      observerRef.current.observe(containerRef.current);
    }

    // Cleanup
    return () => {
      observerRef.current?.disconnect();
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [fetchAd]);

  // Handle click tracking
  const handleClick = () => {
    if (adData?.click_url) {
      // Track impression click
      fetch(`${BANNERBEDLAM_API_BASE}/impression/${adData.impression_id}/click`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).catch(console.warn);
      
      // Open in new tab
      window.open(adData.click_url, '_blank', 'noopener,noreferrer');
    }
  };

  // Don't render anything if collapsed (fail-safe)
  if (isCollapsed) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className={`bannerbedlam-widget ${className}`}
      style={{ 
        minHeight: isLoading || hasError ? 0 : height,
        width: '100%',
        maxWidth: width,
        margin: '1rem auto'
      }}
    >
      {isLoading && (
        <div className="ad-loading" style={{ height }}>
          <div className="loading-spinner" />
          <span>Loading advertisement...</span>
        </div>
      )}

      {hasError && (
        <div className="ad-error" style={{ height }}>
          <span className="error-text">{fallbackText}</span>
        </div>
      )}

      {isVisible && !isLoading && !hasError && adData && (
        <a
          href={adData.click_url}
          onClick={handleClick}
          className="ad-banner"
          target="_blank"
          rel="noopener noreferrer"
          title={adData.alt_text || 'Advertisement'}
          style={{ display: 'block' }}
        >
          <img
            src={adData.banner_url}
            alt={adData.alt_text || 'Advertisement'}
            width={width}
            height={height}
            loading="lazy"
            decoding="async"
            className="ad-image"
          />
        </a>
      )}

      <style>{`
        .bannerbedlam-widget {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
          overflow: hidden;
        }
        
        .ad-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.75rem;
        }
        
        .loading-spinner {
          width: 24px;
          height: 24px;
          border: 2px solid rgba(255, 215, 0, 0.2);
          border-top-color: #ffd700;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .ad-error {
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.3);
          font-size: 0.75rem;
          font-style: italic;
        }
        
        .ad-banner {
          display: block;
          width: 100%;
          height: 100%;
          transition: transform 0.2s ease;
        }
        
        .ad-banner:hover {
          transform: scale(1.02);
        }
        
        .ad-image {
          display: block;
          width: 100%;
          height: auto;
          object-fit: contain;
        }
      `}</style>
    </div>
  );
};

// Export default with default props
const DefaultBannerBedlamWidget: React.FC<Partial<BannerBedlamWidgetProps>> = (props) => (
  <BannerBedlamWidget zoneId="footer-zone-001" {...props} />
);

export default DefaultBannerBedlamWidget;
