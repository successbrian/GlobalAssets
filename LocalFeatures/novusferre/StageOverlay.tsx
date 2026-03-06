/**
 * GLOBAL ASSETS - STAGE OVERLAY
 * Novusferre Live Streaming Interface
 * 
 * Features:
 * - Real-time ticker with creator's market price
 * - Interactive gift tray (10 Naughty Gifts)
 * - Heat meter visualization
 * - Live jitter on gifts
 */

import React, { useState, useEffect, useCallback } from 'react';

// ============================================
// GIFT CONFIGURATION
// ============================================

export interface NaughtyGift {
  id: string;
  name: string;
  price: number;
  emoji: string;
  jitterAmount: number;
  burnAmount: number;
}

export const STAGE_GIFTS: NaughtyGift[] = [
  { id: 'flame', name: 'Flame Kiss', price: 5, emoji: '🔥', jitterAmount: 0.02, burnAmount: 3 },
  { id: 'lingerie', name: 'Lingerie Set', price: 15, emoji: '👙', jitterAmount: 0.05, burnAmount: 9 },
  { id: 'champagne', name: 'Bubble Bath', price: 25, emoji: '🫧', jitterAmount: 0.08, burnAmount: 15 },
  { id: 'diamonds', name: 'Diamond Choker', price: 50, emoji: '💎', jitterAmount: 0.12, burnAmount: 30 },
  { id: 'heels', name: 'Sky Heels', price: 75, emoji: '👠', jitterAmount: 0.15, burnAmount: 45 },
  { id: 'pole', name: 'Pole Dance', price: 100, emoji: '💃', jitterAmount: 0.20, burnAmount: 60 },
  { id: 'masks', name: 'Venetian Masks', price: 150, emoji: '🎭', jitterAmount: 0.25, burnAmount: 90 },
  { id: 'crown', name: 'Diamond Crown', price: 250, emoji: '👑', jitterAmount: 0.30, burnAmount: 150 },
  { id: 'limo', name: 'Limo Ride', price: 500, emoji: '🚗', jitterAmount: 0.40, burnAmount: 300 },
  { id: 'private', name: 'Private Show', price: 1000, emoji: '🕴️', jitterAmount: 0.50, burnAmount: 600 },
];

export const BURN_WALLET = 'VextorGrid_Burn_Account';

export const BURN_PERCENTAGE = 0.60; // 60% to burn

// ============================================
// COMPONENT
// ============================================

interface StageOverlayProps {
  creatorId: string;
  creatorName: string;
  creatorPrice: number; // Current market price
  isLive: boolean;
  onGiftSent?: (gift: NaughtyGift, amount: number) => void;
  onVote?: () => void;
  heatLevel?: number; // 0-100, calculated from gifts/votes
}

export const StageOverlay: React.FC<StageOverlayProps> = ({
  creatorId,
  creatorName,
  creatorPrice,
  isLive,
  onGiftSent,
  onVote,
  heatLevel = 0,
}) => {
  const [selectedGift, setSelectedGift] = useState<NaughtyGift | null>(null);
  const [giftCount, setGiftCount] = useState(1);
  const [isSending, setIsSending] = useState(false);
  const [totalHeat, setTotalHeat] = useState(heatLevel);
  const [showVoteButton, setShowVoteButton] = useState(true);

  // Calculate total cost
  const totalCost = selectedGift ? selectedGift.price * giftCount : 0;
  
  // Calculate burn amount
  const burnAmount = totalCost * BURN_PERCENTAGE;
  const creatorShare = totalCost - burnAmount;

  // Handle gift sending
  const handleSendGift = useCallback(async () => {
    if (!selectedGift || !isLive) return;

    setIsSending(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Update heat level
    setTotalHeat(prev => Math.min(100, prev + selectedGift.jitterAmount * 100));
    
    // Trigger callback
    onGiftSent?.(selectedGift, totalCost);
    
    setIsSending(false);
    setSelectedGift(null);
    setGiftCount(1);
  }, [selectedGift, isLive, onGiftSent, totalCost]);

  // Handle vote
  const handleVote = useCallback(() => {
    setShowVoteButton(false);
    setTotalHeat(prev => Math.min(100, prev + 2)); // Small heat boost from vote
    onVote?.();
    
    // Re-enable after 3 seconds
    setTimeout(() => setShowVoteButton(true), 3000);
  }, [onVote]);

  // Format price with jitter display
  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (!isLive) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px',
        color: '#666',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📺</div>
        <h3 style={{ color: '#888', marginBottom: '8px' }}>Stage is Offline</h3>
        <p style={{ fontSize: '0.9rem' }}>
          {creatorName} is not currently streaming.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      padding: '20px',
      background: 'linear-gradient(180deg, rgba(20, 20, 40, 0.95) 0%, rgba(10, 10, 20, 0.98) 100%)',
      borderRadius: '16px',
      border: '1px solid #333',
      maxWidth: '400px',
      margin: '0 auto',
    }}>
      {/* HEADER: Creator Info + Price Ticker */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 16px',
        background: 'rgba(255, 0, 255, 0.1)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 0, 255, 0.3)',
      }}>
        <div>
          <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '4px' }}>
            NOW LIVE
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>
            {creatorName}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '4px' }}>
            MARKET PRICE
          </div>
          <div style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            color: '#00ff88',
            textShadow: '0 0 10px rgba(0, 255, 136, 0.5)',
          }}>
            {formatPrice(creatorPrice)}
          </div>
        </div>
      </div>

      {/* HEAT METER */}
      <div style={{
        padding: '12px 16px',
        background: '#1a1a2e',
        borderRadius: '12px',
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginBottom: '8px',
          fontSize: '0.85rem',
        }}>
          <span style={{ color: '#888' }}>🔥 HEAT METER</span>
          <span style={{ 
            color: totalHeat > 70 ? '#ff4444' : totalHeat > 40 ? '#ff9900' : '#00ff88',
            fontWeight: 'bold',
          }}>
            {totalHeat.toFixed(0)}%
          </span>
        </div>
        <div style={{
          height: '8px',
          background: '#333',
          borderRadius: '4px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${totalHeat}%`,
            height: '100%',
            background: totalHeat > 70 
              ? 'linear-gradient(90deg, #ff4444, #ff0000)' 
              : totalHeat > 40 
                ? 'linear-gradient(90deg, #ff9900, #ff6600)'
                : 'linear-gradient(90deg, #00ff88, #00cc6a)',
            transition: 'width 0.3s ease',
            boxShadow: totalHeat > 50 ? '0 0 10px rgba(255, 0, 255, 0.5)' : 'none',
          }} />
        </div>
      </div>

      {/* VOTE BUTTON */}
      {showVoteButton && (
        <button
          onClick={handleVote}
          style={{
            padding: '14px 20px',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #0d0d1a 100%)',
            border: '1px solid #444',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'all 0.2s ease',
          }}
        >
          <span>👍</span>
          <span>VOTE</span>
          <span style={{ 
            fontSize: '0.75rem', 
            color: '#888',
            background: '#222',
            padding: '2px 8px',
            borderRadius: '10px',
          }}>
            0.10 Credits
          </span>
        </button>
      )}

      {/* GIFT TRAY */}
      <div>
        <div style={{ 
          fontSize: '0.85rem', 
          color: '#888', 
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span>🎁</span>
          <span>SEND A GIFT</span>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '8px',
        }}>
          {STAGE_GIFTS.slice(0, 10).map((gift) => (
            <button
              key={gift.id}
              onClick={() => setSelectedGift(gift)}
              style={{
                padding: '12px 8px',
                background: selectedGift?.id === gift.id 
                  ? 'rgba(255, 0, 255, 0.2)' 
                  : 'rgba(20, 20, 40, 0.8)',
                border: selectedGift?.id === gift.id 
                  ? '2px solid #ff00ff' 
                  : '1px solid #333',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>{gift.emoji}</span>
              <span style={{ 
                fontSize: '0.7rem', 
                color: '#00ff88',
                fontWeight: 'bold',
              }}>
                ${gift.price}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* SELECTED GIFT ACTIONS */}
      {selectedGift && (
        <div style={{
          padding: '16px',
          background: 'rgba(255, 0, 255, 0.05)',
          border: '1px solid rgba(255, 0, 255, 0.3)',
          borderRadius: '12px',
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            marginBottom: '16px',
          }}>
            <span style={{ fontSize: '2rem' }}>{selectedGift.emoji}</span>
            <div>
              <div style={{ fontWeight: 'bold', color: '#fff' }}>
                {selectedGift.name}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#888' }}>
                Jitter: +{(selectedGift.jitterAmount * 100).toFixed(0)}% | Burn: ${selectedGift.burnAmount}
              </div>
            </div>
          </div>

          {/* Quantity Selector */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            marginBottom: '16px',
          }}>
            <button
              onClick={() => setGiftCount(prev => Math.max(1, prev - 1))}
              style={{
                width: '36px',
                height: '36px',
                background: '#333',
                border: 'none',
                borderRadius: '50%',
                color: '#fff',
                fontSize: '1.2rem',
                cursor: 'pointer',
              }}
            >
              -
            </button>
            <span style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold',
              color: '#fff',
              minWidth: '60px',
              textAlign: 'center',
            }}>
              {giftCount}
            </span>
            <button
              onClick={() => setGiftCount(prev => prev + 1)}
              style={{
                width: '36px',
                height: '36px',
                background: '#333',
                border: 'none',
                borderRadius: '50%',
                color: '#fff',
                fontSize: '1.2rem',
                cursor: 'pointer',
              }}
            >
              +
            </button>
          </div>

          {/* Cost Breakdown */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '12px',
            background: '#1a1a2e',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '0.9rem',
          }}>
            <span style={{ color: '#888' }}>Total Cost:</span>
            <span style={{ color: '#00ff88', fontWeight: 'bold' }}>
              {formatPrice(totalCost)}
            </span>
          </div>

          {/* Burn Warning */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px',
            background: 'rgba(255, 68, 68, 0.1)',
            border: '1px solid rgba(255, 68, 68, 0.3)',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '0.8rem',
            color: '#ff6666',
          }}>
            <span>🔥</span>
            <span>
              {formatPrice(burnAmount)} (60%) goes to {BURN_WALLET}
            </span>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendGift}
            disabled={isSending}
            style={{
              width: '100%',
              padding: '16px',
              background: isSending 
                ? '#444' 
                : 'linear-gradient(135deg, #ff00ff 0%, #cc00cc 100%)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: isSending ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: isSending ? 'none' : '0 4px 20px rgba(255, 0, 255, 0.4)',
            }}
          >
            {isSending ? 'SENDING...' : `SEND ${giftCount}x ${selectedGift.name}`}
          </button>
        </div>
      )}

      {/* BURN STATS */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '12px 16px',
        background: '#1a1a2e',
        borderRadius: '10px',
        fontSize: '0.8rem',
        color: '#666',
      }}>
        <span>🔥 60% BURN</span>
        <span>📈 LIVE JITTER ACTIVE</span>
        <span>🎤 FREE ENTRY</span>
      </div>
    </div>
  );
};

export default StageOverlay;
