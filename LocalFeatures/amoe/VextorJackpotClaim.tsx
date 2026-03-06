/**
 * VEXTORGRID - JACKPOT CLAIM COMPONENT
 * Generate Daily Entry Code for Novusferre Jackpot
 * 
 * "Get My Daily Entry Code"
 */

import React, { useState } from 'react';

interface VextorJackpotClaimProps {
  userId: string;
  userName: string;
  onCodeGenerated: (code: string) => void;
}

// ============================================
// COMPONENT
// ============================================

export const VextorJackpotClaim: React.FC<VextorJackpotClaimProps> = ({
  userId,
  userName,
  onCodeGenerated,
}) => {
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateCode = async () => {
    setLoading(true);
    setError(null);
    setCopied(false);

    try {
      const response = await fetch('/api/amoe/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (data.success) {
        setCode(data.code);
        onCodeGenerated(data.code);
      } else {
        setError(data.error || 'Failed to generate code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (code) {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0d1a0d 0%, #1a2e1a 100%)',
      border: '2px solid #00ff88',
      borderRadius: '16px',
      padding: '24px',
      maxWidth: '420px',
      margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{
          color: '#00ff88',
          margin: '0 0 8px 0',
          fontSize: '1.4rem',
        }}>
          🎰 DAILY JACKPOT ENTRY
        </h2>
        <p style={{
          color: '#888',
          margin: 0,
          fontSize: '0.9rem',
        }}>
          VextorGrid → Novusferre
        </p>
      </div>

      {/* Current Jackpot */}
      <div style={{
        background: 'rgba(0, 255, 136, 0.1)',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '20px',
        textAlign: 'center',
      }}>
        <div style={{
          color: '#ffd700',
          fontSize: '2rem',
          fontWeight: 'bold',
        }}>
          $4,999.99
        </div>
        <div style={{ color: '#888', fontSize: '0.85rem' }}>
          Ghost Stash Jackpot
        </div>
      </div>

      {/* User Badge */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '8px',
        padding: '10px',
        marginBottom: '20px',
        fontSize: '0.85rem',
        color: '#aaa',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <span style={{ color: '#00ff88' }}>👤</span>
        {userName}
      </div>

      {/* Action Button */}
      {!code ? (
        <button
          onClick={generateCode}
          disabled={loading}
          style={{
            width: '100%',
            padding: '16px',
            background: loading 
              ? '#333' 
              : 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
            border: 'none',
            borderRadius: '12px',
            color: loading ? '#666' : '#0d1a0d',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
          }}
        >
          {loading ? '⏳ Generating...' : '🎁 Get My Daily Entry Code'}
        </button>
      ) : (
        /* Code Display */
        <div style={{
          background: '#0d0d1a',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
          border: '2px solid #00ff88',
        }}>
          <div style={{
            color: '#666',
            fontSize: '0.8rem',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            Your Entry Code
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
            color: '#0d1a0d',
            fontSize: '1.6rem',
            fontWeight: 'bold',
            letterSpacing: '3px',
            padding: '14px',
            borderRadius: '8px',
            fontFamily: 'monospace',
            marginBottom: '12px',
          }}>
            {code}
          </div>
          
          <button
            onClick={copyToClipboard}
            style={{
              padding: '10px 24px',
              background: copied ? '#00ff88' : 'transparent',
              border: '2px solid #00ff88',
              borderRadius: '8px',
              color: copied ? '#0d1a0d' : '#00ff88',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              transition: 'all 0.2s ease',
            }}
          >
            {copied ? '✓ COPIED!' : '📋 COPY CODE'}
          </button>
        </div>
      )}

      {/* Success Message */}
      {code && !loading && (
        <div style={{
          marginTop: '16px',
          padding: '14px',
          background: 'rgba(0, 255, 136, 0.15)',
          border: '1px solid #00ff88',
          borderRadius: '10px',
          color: '#00ff88',
          fontSize: '0.9rem',
          textAlign: 'center',
          lineHeight: '1.5',
        }}>
          ✓ Code Copied! Now head over to{' '}
          <span style={{ fontWeight: 'bold', color: '#ff00ff' }}>Novusferre</span>
          {' '}to deposit your entry for the{' '}
          <span style={{ fontWeight: 'bold' }}>$4,999.99 Jackpot</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: 'rgba(255, 68, 68, 0.1)',
          border: '1px solid #ff4444',
          borderRadius: '8px',
          color: '#ff4444',
          fontSize: '0.85rem',
          textAlign: 'center',
        }}>
          {error}
        </div>
      )}

      {/* Info Footer */}
      <div style={{
        marginTop: '20px',
        paddingTop: '16px',
        borderTop: '1px solid #2a2a2a',
        color: '#555',
        fontSize: '0.75rem',
        textAlign: 'center',
      }}>
        <p style={{ margin: '4px 0' }}>
          ✓ One code per 24 hours
        </p>
        <p style={{ margin: '4px 0' }}>
          ✓ Redeem on Novusferre for jackpot entry
        </p>
        <p style={{ margin: '4px 0' }}>
          ✓ Code expires in 24 hours
        </p>
      </div>
    </div>
  );
};

export default VextorJackpotClaim;
