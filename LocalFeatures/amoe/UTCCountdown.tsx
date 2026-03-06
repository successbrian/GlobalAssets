/**
 * GLOBAL ASSETS - UTC COUNTDOWN WIDGET
 * Header Widget for All 6 Empire Sites
 * 
 * "Empire Day Ends In: [HH:MM:SS]"
 */

import React, { useState, useEffect } from 'react';

interface UTCCountdownProps {
  variant?: 'minimal' | 'full' | 'glow';
  showLabels?: boolean;
}

// ============================================
// COMPONENT
// ============================================

export const UTCCountdown: React.FC<UTCCountdownProps> = ({
  variant = 'full',
  showLabels = true,
}) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const utcNow = new Date(now.toISOString());
      
      // Next reset: 00:00 UTC tomorrow
      const nextReset = new Date(utcNow);
      nextReset.setUTCHours(0, 0, 0, 0);
      nextReset.setUTCDate(nextReset.getUTCDate() + 1);

      const diffMs = nextReset.getTime() - utcNow.getTime();
      
      if (diffMs <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      
      setTimeLeft({ hours, minutes, seconds, isExpired: false });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, '0');

  // Styles based on variant
  const styles = {
    minimal: {
      container: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.9rem',
        color: '#888',
      },
      timer: {
        fontFamily: 'monospace',
        fontWeight: 'bold',
        color: '#00ff88',
      },
      label: {
        fontSize: '0.75rem',
        textTransform: 'uppercase' as const,
        letterSpacing: '1px',
      },
    },
    full: {
      container: {
        background: 'linear-gradient(135deg, #1a1a2e 0%, #0d0d1a 100%)',
        border: '1px solid #333',
        borderRadius: '8px',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      },
      timer: {
        fontFamily: 'monospace',
        fontSize: '1.4rem',
        fontWeight: 'bold',
        color: '#00ff88',
        textShadow: '0 0 10px rgba(0, 255, 136, 0.5)',
      },
      label: {
        fontSize: '0.7rem',
        textTransform: 'uppercase' as const,
        letterSpacing: '1px',
        color: '#666',
        lineHeight: 1.3,
      },
    },
    glow: {
      container: {
        background: 'linear-gradient(135deg, #1a0d2e 0%, #0d0d1a 100%)',
        border: '2px solid #ff00ff',
        borderRadius: '12px',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        boxShadow: '0 0 20px rgba(255, 0, 255, 0.2)',
      },
      timer: {
        fontFamily: 'monospace',
        fontSize: '1.8rem',
        fontWeight: 'bold',
        background: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textShadow: '0 0 30px rgba(0, 255, 136, 0.5)',
      },
      label: {
        fontSize: '0.65rem',
        textTransform: 'uppercase' as const,
        letterSpacing: '2px',
        color: '#ff00ff',
        fontWeight: 'bold',
        lineHeight: 1.4,
      },
    },
  };

  const currentStyle = styles[variant];

  return (
    <div style={currentStyle.container}>
      {variant === 'minimal' ? (
        <>
          <span style={currentStyle.timer}>
            {timeLeft.isExpired ? '00:00:00' : `${pad(timeLeft.hours)}:${pad(timeLeft.minutes)}:${pad(timeLeft.seconds)}`}
          </span>
          {showLabels && <span style={currentStyle.label}>UTC</span>}
        </>
      ) : (
        <>
          <div style={{ textAlign: 'center' }}>
            <div style={currentStyle.timer!}>
              {timeLeft.isExpired ? '00:00:00' : `${pad(timeLeft.hours)}:${pad(timeLeft.minutes)}:${pad(timeLeft.seconds)}`}
            </div>
            {showLabels && (
              <div style={currentStyle.label!}>
                {variant === 'glow' ? (
                  <>
                    <div>EMPIRE DAY</div>
                    <div>ENDS IN</div>
                  </>
                ) : (
                  'Empire Day Ends (UTC)'
                )}
              </div>
            )}
          </div>
          {variant === 'glow' && (
            <div style={{
              width: '4px',
              height: '40px',
              background: 'linear-gradient(180deg, #ff00ff 0%, #00ff88 100%)',
              borderRadius: '2px',
            }} />
          )}
        </>
      )}
    </div>
  );
};

export default UTCCountdown;
