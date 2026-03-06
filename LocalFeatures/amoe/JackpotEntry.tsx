/**
 * NOVUSFERRE - JACKPOT ENTRY MODAL
 * Redeem VextorGrid Codes
 * 
 * "Enter the Jackpot"
 */

import React, { useState } from 'react';

interface JackpotEntryProps {
  userId: string;
  onEntrySuccess: (entry: any) => void;
  onClose: () => void;
}

// ============================================
// COMPONENT
// ============================================

export const JackpotEntryModal: React.FC<JackpotEntryProps> = ({
  userId,
  onEntrySuccess,
  onClose,
}) => {
  const [code, setCode] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate format first
      if (code.length !== 8) {
        setError('Code must be exactly 8 characters');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/amoe/redeem-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code, 
          userId,
          captchaToken: captcha,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.entry);
        onEntrySuccess(data.entry);
      } else {
        setError(data.error || 'Invalid code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success State
  if (success) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #1a0d2e 0%, #0d0d1a 100%)',
          border: '2px solid #ffd700',
          borderRadius: '20px',
          padding: '40px',
          maxWidth: '450px',
          textAlign: 'center',
        }}>
          {/* Success Animation */}
          <div style={{
            fontSize: '4rem',
            marginBottom: '20px',
          }}>
            🎉
          </div>
          
          <h2 style={{
            color: '#ffd700',
            margin: '0 0 16px 0',
          }}>
            ENTRY CONFIRMED!
          </h2>
          
          <div style={{
            background: 'rgba(255, 215, 0, 0.1)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '24px',
          }}>
            <div style={{
              color: '#888',
              fontSize: '0.9rem',
              marginBottom: '8px',
            }}>
              Jackpot Value
            </div>
            <div style={{
              color: '#ffd700',
              fontSize: '2.5rem',
              fontWeight: 'bold',
            }}>
              $4,999.99
            </div>
          </div>

          <p style={{ color: '#888', marginBottom: '24px' }}>
            Your entry has been added to the pool.<br />
            Good luck! 🍀
          </p>

          <button
            onClick={onClose}
            style={{
              padding: '12px 40px',
              background: 'linear-gradient(135deg, #ffd700 0%, #ff8c00 100%)',
              border: 'none',
              borderRadius: '12px',
              color: '#0d0d1a',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            CLOSE
          </button>
        </div>
      </div>
    );
  }

  // Form State
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a0d2e 0%, #0d0d1a 100%)',
        border: '2px solid #ff00ff',
        borderRadius: '20px',
        padding: '32px',
        maxWidth: '400px',
        width: '90%',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <button
            onClick={onClose}
            style={{
              float: 'right',
              background: 'none',
              border: 'none',
              color: '#666',
              fontSize: '1.5rem',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
          
          <h2 style={{
            color: '#ff00ff',
            margin: '0 0 8px 0',
            clear: 'both',
          }}>
            🎰 JACKPOT ENTRY
          </h2>
          <p style={{
            color: '#888',
            margin: 0,
            fontSize: '0.9rem',
          }}>
            Redeem your VextorGrid code
          </p>
        </div>

        {/* Jackpot Display */}
        <div style={{
          background: 'rgba(255, 0, 255, 0.1)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
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
            Current Jackpot
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Code Input */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              color: '#ccc',
              marginBottom: '8px',
              fontSize: '0.9rem',
            }}>
              8-Digit Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="XXXXXXXX"
              maxLength={8}
              style={{
                width: '100%',
                padding: '14px',
                background: '#0d0d1a',
                border: '2px solid #333',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '1.2rem',
                fontFamily: 'monospace',
                letterSpacing: '4px',
                textAlign: 'center',
                outline: 'none',
              }}
            />
          </div>

          {/* Captcha Placeholder */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              color: '#ccc',
              marginBottom: '8px',
              fontSize: '0.9rem',
            }}>
              Human Verification
            </label>
            <div style={{
              background: '#1a1a2e',
              borderRadius: '8px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <input
                type="checkbox"
                id="captcha"
                checked={captcha === 'human'}
                onChange={() => setCaptcha(captcha === 'human' ? '' : 'human')}
                style={{ width: '20px', height: '20px' }}
              />
              <label htmlFor="captcha" style={{ color: '#888', cursor: 'pointer' }}>
                I'm not a robot
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !code || !captcha}
            style={{
              width: '100%',
              padding: '16px',
              background: (loading || !code || !captcha)
                ? '#444'
                : 'linear-gradient(135deg, #ff00ff 0%, #ffd700 100%)',
              border: 'none',
              borderRadius: '12px',
              color: (loading || !code || !captcha) ? '#888' : '#0d0d1a',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: (loading || !code || !captcha) ? 'not-allowed' : 'pointer',
              marginBottom: '16px',
            }}
          >
            {loading ? 'Processing...' : '🎁 CLAIM ENTRY'}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div style={{
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

        {/* Footer Info */}
        <div style={{
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid #333',
          color: '#666',
          fontSize: '0.75rem',
          textAlign: 'center',
        }}>
          <p style={{ margin: '4px 0' }}>
            One entry per 24 hours
          </p>
          <p style={{ margin: '4px 0' }}>
            Code expires in 24 hours
          </p>
        </div>
      </div>
    </div>
  );
};

export default JackpotEntryModal;
