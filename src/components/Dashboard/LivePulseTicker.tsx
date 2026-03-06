/**
 * LivePulseTicker.tsx - Real-Time Scrolling Events Ticker
 * 
 * Features:
 * - Scrolling text ticker showing real-time events
 * - Events from DEX, Reserve, and Market
 * - Smooth CSS animations
 * - Pause on hover
 */

import React, { useState, useEffect } from 'react';

interface PulseEvent {
  id: string;
  type: 'listing' | 'sale' | 'liquidity' | 'yield' | 'stake' | 'milestone';
  message: string;
  timestamp: string;
  icon: string;
}

interface LivePulseTickerProps {
  events?: PulseEvent[];
  speed?: number; // pixels per second
  className?: string;
}

// Sample events for demo
const sampleEvents: PulseEvent[] = [
  {
    id: '1',
    type: 'listing',
    message: 'New Listing: 3BR Condo in Dubai (Reserve)',
    timestamp: new Date().toISOString(),
    icon: '🏠'
  },
  {
    id: '2',
    type: 'liquidity',
    message: 'Whale Alert: $50k Liquidity Added to MCK/USDT (DEX)',
    timestamp: new Date().toISOString(),
    icon: '🐋'
  },
  {
    id: '3',
    type: 'sale',
    message: 'Just Sold: Vintage Rolex Submariner (Market)',
    timestamp: new Date().toISOString(),
    icon: '💎'
  },
  {
    id: '4',
    type: 'yield',
    message: 'Yield Distributed: 1,250 CVTR to Stakers',
    timestamp: new Date().toISOString(),
    icon: '💰'
  },
  {
    id: '5',
    type: 'stake',
    message: 'New Staker: Wallet 0x7a3... joined the empire',
    timestamp: new Date().toISOString(),
    icon: '🔒'
  },
  {
    id: '6',
    type: 'milestone',
    message: 'Milestone: TVL hits $4.25M on Civitas DEX',
    timestamp: new Date().toISOString(),
    icon: '🎯'
  },
  {
    id: '7',
    type: 'listing',
    message: 'New Merchant: Metro City Coffee Co. verified',
    timestamp: new Date().toISOString(),
    icon: '☕'
  },
  {
    id: '8',
    type: 'liquidity',
    message: 'LP Reward: 45 CVTR claimed by early providers',
    timestamp: new Date().toISOString(),
    icon: '🌊'
  }
];

export const LivePulseTicker: React.FC<LivePulseTickerProps> = ({
  events = sampleEvents,
  speed = 30,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Cycle through events
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length);
    }, 5000); // Change event every 5 seconds

    return () => clearInterval(interval);
  }, [events.length, isPaused]);

  const currentEvent = events[currentIndex];

  // Get color based on event type
  const getTypeColor = (type: PulseEvent['type']): string => {
    switch (type) {
      case 'listing': return '#00ff88';
      case 'sale': return '#ffd700';
      case 'liquidity': return '#00bfff';
      case 'yield': return '#9b59b6';
      case 'stake': return '#e74c3c';
      case 'milestone': return '#ff6b6b';
      default: return '#ffffff';
    }
  };

  return (
    <div 
      className={`live-pulse-ticker ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="ticker-header">
        <span className="pulse-indicator" />
        <span className="header-text">LIVE PULSE</span>
      </div>
      
      <div className="ticker-content">
        <div className="ticker-icon" style={{ color: getTypeColor(currentEvent.type) }}>
          {currentEvent.icon}
        </div>
        <div className="ticker-message">
          <span 
            className="message-text"
            style={{ color: getTypeColor(currentEvent.type) }}
          >
            {currentEvent.message}
          </span>
          <span className="message-time">
            {formatTime(currentEvent.timestamp)}
          </span>
        </div>
      </div>

      <div className="ticker-progress">
        {events.map((_, index) => (
          <div 
            key={index}
            className={`progress-dot ${index === currentIndex ? 'active' : ''}`}
            style={{ 
              backgroundColor: index === currentIndex 
                ? getTypeColor(currentEvent.type) 
                : 'rgba(255, 255, 255, 0.2)' 
            }}
          />
        ))}
      </div>

      <style>{`
        .live-pulse-ticker {
          background: linear-gradient(90deg, rgba(255, 215, 0, 0.1) 0%, rgba(0, 0, 0, 0) 100%);
          border: 1px solid rgba(255, 215, 0, 0.3);
          border-radius: 8px;
          padding: 1rem;
          overflow: hidden;
        }

        .ticker-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .pulse-indicator {
          width: 8px;
          height: 8px;
          background: #ff6b6b;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }

        .header-text {
          color: #ffd700;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.1em;
        }

        .ticker-content {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .ticker-icon {
          font-size: 2rem;
          min-width: 40px;
          text-align: center;
        }

        .ticker-message {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          min-width: 0;
          flex: 1;
        }

        .message-text {
          font-weight: 600;
          font-size: 0.875rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .message-time {
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.75rem;
        }

        .ticker-progress {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.75rem;
          justify-content: center;
        }

        .progress-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          transition: background-color 0.3s ease;
        }

        .progress-dot.active {
          animation: dotPulse 2s ease-in-out infinite;
        }

        @keyframes dotPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }

        /* Alternative: Scrolling marquee style */
        .live-pulse-ticker.scrolling {
          padding: 0.5rem 0;
        }

        .scrolling .ticker-wrapper {
          display: flex;
          animation: scroll var(--duration, 20s) linear infinite;
        }

        .scrolling .ticker-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0 2rem;
          white-space: nowrap;
        }

        @keyframes scroll {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
};

// Format timestamp to relative time
function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

// Continuous marquee version
export const MarqueeTicker: React.FC<{ events?: PulseEvent[] }> = ({ events = sampleEvents }) => {
  const duplicatedEvents = [...events, ...events, ...events]; // Triple for smooth loop
  
  return (
    <div className="marquee-ticker">
      <div className="marquee-content">
        {duplicatedEvents.map((event, index) => (
          <span key={`${event.id}-${index}`} className="marquee-item">
            <span className="item-icon">{event.icon}</span>
            <span className="item-message">{event.message}</span>
            <span className="item-separator">•••</span>
          </span>
        ))}
      </div>
      
      <style>{`
        .marquee-ticker {
          background: rgba(0, 0, 0, 0.8);
          border-top: 1px solid rgba(255, 215, 0, 0.3);
          border-bottom: 1px solid rgba(255, 215, 0, 0.3);
          padding: 0.75rem 0;
          overflow: hidden;
        }

        .marquee-content {
          display: flex;
          animation: marquee 60s linear infinite;
          width: max-content;
        }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }

        .marquee-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0 2rem;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.875rem;
        }

        .item-icon {
          font-size: 1rem;
        }

        .item-message {
          font-weight: 500;
        }

        .item-separator {
          color: rgba(255, 215, 0, 0.5);
        }

        .marquee-ticker:hover .marquee-content {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default LivePulseTicker;
