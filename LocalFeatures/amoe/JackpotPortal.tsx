/**
 * VEXTORGRID - JACKPOT PORTAL
 * Generate Novusferre Entry Codes
 * 
 * "Free Entry to the Novusferre Jackpot"
 */

import React, { useState } from 'react';

interface JackpotPortalProps {
  userId: string;
  userName: string;
  onCodeGenerated: (code: string) => void;
}

// ============================================
// COMPONENT
// ============================================

export const JackpotPortal: React.FC<JackpotPortalProps> = ({
  userId,
  userName,
  onCodeGenerated,
}) => {
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateCode = async () => {
    setLoading(true);
    setError(null);

    try {
      // Call API to generate code
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

  const copyToClipboard = () => {
    if (code) {
      navigator.clipboard.writeText(code);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      border: '2px solid #00d9ff',
      borderRadius: '16px',
      padding: '24px',
      maxWidth: '400px',
      margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{
          color: '#00d9ff',
          margin: '0 0 8px 0',
          fontSize: '1.5rem',
        }}>
          🎰 FREE JACKPOT ENTRY
        </h2>
        <p style={{
          color: '#888',
          margin: 0,
          fontSize: '0.9rem',
        }}>
          VextorGrid × Novusferre Cross-Promo
        </p>
      </div>

      {/* Current Jackpot */}
      <div style={{
        background: 'rgba(0, 217, 255, 0.1)',
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
          Current Jackpot Value
        </div>
      </div>

      {/* User Info */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: '20px',
        fontSize: '0.9rem',
        color: '#ccc',
      }}>
        <span style={{ color: '#00d9ff' }}>For:</span> {userName}
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
              ? '#444' 
              : 'linear-gradient(135deg, #00d9ff 0%, #00ff88 100%)',
            border: 'none',
            borderRadius: '12px',
            color: loading ? '#888' : '#1a1a2e',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
          }}
        >
          {loading ? 'Generating...' : '🎁 Generate Free Entry Code'}
        </button>
      ) : (
        /* Code Display */
        <div style={{
          background: '#0d0d1a',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
        }}>
          <div style={{
            color: '#888',
            fontSize: '0.85rem',
            marginBottom: '8px',
          }}>
            Your 8-Digit Code
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #ffd700 0%, #ff8c00 100%)',
            color: '#0d0d1a',
            fontSize: '1.8rem',
            fontWeight: 'bold',
            letterSpacing: '4px',
            padding: '16px',
            borderRadius: '8px',
            fontFamily: 'monospace',
          }}>
            {code}
          </div>
          <button
            onClick={copyToClipboard}
            style={{
              marginTop: '12px',
              padding: '8px 20px',
              background: 'transparent',
              border: '1px solid #00d9ff',
              borderRadius: '8px',
              color: '#00d9ff',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            📋 Copy Code
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: 'rgba(255, 0, 0, 0.1)',
          border: '1px solid #ff4444',
          borderRadius: '8px',
          color: '#ff4444',
          fontSize: '0.9rem',
          textAlign: 'center',
        }}>
          {error}
        </div>
      )}

      {/* Info Footer */}
      <div style={{
        marginTop: '20px',
        paddingTop: '16px',
        borderTop: '1px solid #333',
        color: '#666',
        fontSize: '0.8rem',
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

export default JackpotPortal;
