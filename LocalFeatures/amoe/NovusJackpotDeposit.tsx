/**
 * NOVUSFERRE - JACKPOT DEPOSIT COMPONENT
 * Redeem VextorGrid Codes for Jackpot Entry
 * 
 * "Deposit your entry for the Ghost Stash"
 */

import React, { useState } from 'react';

interface NovusJackpotDepositProps {
  userId: string;
  onDepositSuccess: (entry: any) => void;
  onClose: () => void;
}

// ============================================
// COMPONENT
// ============================================

export const NovusJackpotDeposit: React.FC<NovusJackpotDepositProps> = ({
  userId,
  onDepositSuccess,
  onClose,
}) => {
  const [code, setCode] = useState('');
  const [captcha, setCaptcha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Format validation
      if (code.length < 6 || code.length > 10) {
        setError('Invalid code format');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/amoe/redeem-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: code.toUpperCase(), 
          userId,
          captchaToken: captcha ? 'verified' : '',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.entry);
        onDepositSuccess(data.entry);
      } else {
        setError(data.error || 'Invalid or used code');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success State - Neon Purple & Gold Flash
  if (success) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #1a0d2e 0%, #0d0d1a 100%)',
          border: '3px solid #ffd700',
          borderRadius: '24px',
          padding: '48px',
          maxWidth: '500px',
          textAlign: 'center',
          animation: 'pulse 0.5s ease-in-out',
          boxShadow: '0 0 60px rgba(255, 215, 0, 0.3)',
        }}>
          {/* Success Animation */}
          <div style={{
            fontSize: '5rem',
            marginBottom: '24px',
            animation: 'bounce 0.6s ease',
          }}>
            ✨
          </div>
          
          <h2 style={{
            color: '#ffd700',
            margin: '0 0 20px 0',
            fontSize: '2rem',
            textShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
          }}>
            💜 ENTRY CONFIRMED! 💜
          </h2>
          
          <div style={{
            background: 'linear-gradient(135deg, rgba(255, 0, 255, 0.2) 0%, rgba(255, 215, 0, 0.2) 100%)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '28px',
            border: '2px solid #ff00ff',
          }}>
            <div style={{
              color: '#aaa',
              fontSize: '0.9rem',
              marginBottom: '8px',
            }}>
              You are in the running for the
            </div>
            <div style={{
              color: '#ffd700',
              fontSize: '3rem',
              fontWeight: 'bold',
              textShadow: '0 0 30px rgba(255, 215, 0, 0.6)',
            }}>
              $4,999.99
            </div>
            <div style={{
              color: '#ff00ff',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              marginTop: '8px',
            }}>
              Ghost Stash
            </div>
          </div>

          <p style={{ 
            color: '#ccc', 
            marginBottom: '32px',
            lineHeight: '1.6',
          }}>
            Your entry has been locked in.<br />
            Good luck, player! 🍀
          </p>

          <button
            onClick={onClose}
            style={{
              padding: '16px 48px',
              background: 'linear-gradient(135deg, #ffd700 0%, #ff8c00 100%)',
              border: 'none',
              borderRadius: '50px',
              color: '#0d0d1a',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 0 30px rgba(255, 215, 0, 0.4)',
            }}
          >
            CLOSE
          </button>
        </div>

        {/* CSS Animation */}
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
          }
          @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
        `}</style>
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
        padding: '36px',
        maxWidth: '420px',
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
              fontSize: '1.8rem',
              cursor: 'pointer',
              lineHeight: 1,
            }}
          >
            ×
          </button>
          
          <h2 style={{
            color: '#ff00ff',
            margin: '0 0 8px 0',
            fontSize: '1.6rem',
            clear: 'both',
          }}>
            🎰 DEPOSIT JACKPOT ENTRY
          </h2>
          <p style={{
            color: '#888',
            margin: 0,
            fontSize: '0.9rem',
          }}>
            Paste your VextorGrid code below
          </p>
        </div>

        {/* Jackpot Display */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 140, 0, 0.1) 100%)',
          borderRadius: '14px',
          padding: '18px',
          marginBottom: '28px',
          textAlign: 'center',
          border: '1px solid #ffd700',
        }}>
          <div style={{
            color: '#ffd700',
            fontSize: '2.2rem',
            fontWeight: 'bold',
          }}>
            $4,999.99
          </div>
          <div style={{ 
            color: '#ff00ff', 
            fontSize: '0.9rem',
            fontWeight: 'bold',
          }}>
            Ghost Stash
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Code Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              color: '#ccc',
              marginBottom: '10px',
              fontSize: '0.95rem',
            }}>
              Entry Code
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="VG-XXXXXX"
              maxLength={10}
              style={{
                width: '100%',
                padding: '16px',
                background: '#0d0d1a',
                border: '2px solid #333',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '1.3rem',
                fontFamily: 'monospace',
                letterSpacing: '2px',
                textAlign: 'center',
                outline: 'none',
                transition: 'border-color 0.2s ease',
              }}
            />
          </div>

          {/* Captcha */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{
              background: '#1a1a2e',
              borderRadius: '10px',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}>
              <input
                type="checkbox"
                id="novusCaptcha"
                checked={captcha}
                onChange={() => setCaptcha(!captcha)}
                style={{ 
                  width: '22px', 
                  height: '22px',
                  cursor: 'pointer',
                }}
              />
              <label 
                htmlFor="novusCaptcha" 
                style={{ 
                  color: '#888', 
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                I'm not a bot
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !code || !captcha}
            style={{
              width: '100%',
              padding: '18px',
              background: (loading || !code || !captcha)
                ? '#333'
                : 'linear-gradient(135deg, #ff00ff 0%, #aa00aa 100%)',
              border: 'none',
              borderRadius: '14px',
              color: (loading || !code || !captcha) ? '#666' : '#fff',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              cursor: (loading || !code || !captcha) ? 'not-allowed' : 'pointer',
              marginBottom: '16px',
              boxShadow: (loading || !code || !captcha) 
                ? 'none' 
                : '0 0 25px rgba(255, 0, 255, 0.4)',
            }}
          >
            {loading ? '⏳ Processing...' : '💜 DEPOSIT ENTRY'}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div style={{
            padding: '14px',
            background: 'rgba(255, 68, 68, 0.1)',
            border: '1px solid #ff4444',
            borderRadius: '10px',
            color: '#ff4444',
            fontSize: '0.9rem',
            textAlign: 'center',
          }}>
            {error}
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: '24px',
          paddingTop: '18px',
          borderTop: '1px solid #2a2a2a',
          color: '#555',
          fontSize: '0.75rem',
          textAlign: 'center',
        }}>
          <p style={{ margin: '4px 0' }}>
            One entry per 24 hours
          </p>
          <p style={{ margin: '4px 0' }}>
            Code expires in 24 hours from generation
          </p>
        </div>
      </div>
    </div>
  );
};

export default NovusJackpotDeposit;
