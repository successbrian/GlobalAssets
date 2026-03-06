/**
 * GLOBAL ASSETS - SOCIAL DISCOVERY FEED
 * Novusferre Discovery Interface
 * 
 * Features:
 * - Masonry grid layout
 * - Live creators PRIORITIZED to top
 * - Hot or Not voting (0.10 Credits)
 * - Type B Credit gating for private DMs/Backstage
 */

import React, { useState, useMemo } from 'react';

// ============================================
// TYPES
// ============================================

export interface CreatorProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  price: number;                    // Market price
  isLive: boolean;                  // Currently on stage
  heatLevel: number;               // 0-100 from stage
  votes: number;                   // Hot or Not votes
  isEligibleTypeB: boolean;         // Has Type B credits
  tags: string[];
  lastActive: string;
}

export interface VoteResult {
  success: boolean;
  newVoteCount: number;
  newRank: number;
}

// ============================================
// COMPONENT
// ============================================

interface SocialDiscoveryFeedProps {
  creators: CreatorProfile[];
  onCreatorClick?: (creatorId: string) => void;
  onVote?: (creatorId: string) => Promise<VoteResult>;
  onRequestDM?: (creatorId: string) => void;
  currentUserId?: string;
  userHasTypeB?: boolean;
}

export const SocialDiscoveryFeed: React.FC<SocialDiscoveryFeedProps> = ({
  creators,
  onCreatorClick,
  onVote,
  onRequestDM,
  currentUserId,
  userHasTypeB = false,
}) => {
  const [votingInProgress, setVotingInProgress] = useState<Set<string>>(new Set());

  // Sort creators: LIVE first, then by votes (Hot or Not ranking)
  const sortedCreators = useMemo(() => {
    return [...creators].sort((a, b) => {
      // Priority 1: Live status
      if (a.isLive && !b.isLive) return -1;
      if (!a.isLive && b.isLive) return 1;
      
      // Priority 2: Heat level (for live creators)
      if (a.isLive && b.isLive) {
        return b.heatLevel - a.heatLevel;
      }
      
      // Priority 3: Vote count (Hot or Not ranking)
      return b.votes - a.votes;
    });
  }, [creators]);

  // Handle voting
  const handleVote = async (creatorId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (votingInProgress.has(creatorId)) return;
    
    setVotingInProgress(prev => new Set(prev).add(creatorId));
    
    try {
      const result = await onVote?.(creatorId);
      if (!result?.success) {
        console.log('[Vote] Failed - may need credits');
      }
    } finally {
      setVotingInProgress(prev => {
        const next = new Set(prev);
        next.delete(creatorId);
        return next;
      });
    }
  };

  // Handle DM request (requires Type B)
  const handleDMRequest = (creatorId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!userHasTypeB) {
      alert('💳 Private DMs require Type B Credits. Visit the marketplace to upgrade!');
      return;
    }
    
    onRequestDM?.(creatorId);
  };

  return (
    <div style={{
      padding: '20px',
      background: 'linear-gradient(180deg, #0d0d1a 0%, #1a1a2e 100%)',
      minHeight: '100vh',
    }}>
      {/* HEADER */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        padding: '0 4px',
      }}>
        <h1 style={{
          fontSize: '1.8rem',
          fontWeight: 'bold',
          color: '#fff',
          margin: 0,
        }}>
          🔥 Hot or Not
        </h1>
        <div style={{
          display: 'flex',
          gap: '12px',
          fontSize: '0.85rem',
          color: '#888',
        }}>
          <span>🎤 LIVE: {creators.filter(c => c.isLive).length}</span>
          <span>👥 Total: {creators.length}</span>
        </div>
      </div>

      {/* MASONRY GRID */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px',
      }}>
        {sortedCreators.map((creator, index) => (
          <CreatorCard
            key={creator.id}
            creator={creator}
            rank={index + 1}
            isVoting={votingInProgress.has(creator.id)}
            onVote={handleVote}
            onCreatorClick={onCreatorClick}
            onRequestDM={handleDMRequest}
            userHasTypeB={userHasTypeB}
          />
        ))}
      </div>

      {/* EMPTY STATE */}
      {creators.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: '#666',
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>👀</div>
          <h3 style={{ color: '#888', marginBottom: '8px' }}>No Creators Found</h3>
          <p style={{ fontSize: '0.9rem' }}>
            Check back soon for new talent!
          </p>
        </div>
      )}
    </div>
  );
};

// ============================================
// CREATOR CARD COMPONENT
// ============================================

interface CreatorCardProps {
  creator: CreatorProfile;
  rank: number;
  isVoting: boolean;
  onVote: (creatorId: string, e: React.MouseEvent) => void;
  onCreatorClick?: (creatorId: string) => void;
  onRequestDM: (creatorId: string, e: React.MouseEvent) => void;
  userHasTypeB: boolean;
}

const CreatorCard: React.FC<CreatorCardProps> = ({
  creator,
  rank,
  isVoting,
  onVote,
  onCreatorClick,
  onRequestDM,
  userHasTypeB,
}) => {
  const isLive = creator.isLive;
  const isTopRank = rank <= 3;

  return (
    <div
      onClick={() => onCreatorClick?.(creator.id)}
      style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #0d0d1a 100%)',
        borderRadius: '16px',
        border: isLive 
          ? '2px solid #ff00ff' 
          : isTopRank 
            ? '2px solid #ffd700' 
            : '1px solid #333',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        transform: isLive ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isLive 
          ? '0 0 20px rgba(255, 0, 255, 0.3)' 
          : isTopRank 
            ? '0 0 15px rgba(255, 215, 0, 0.2)' 
            : 'none',
      }}
    >
      {/* LIVE BADGE */}
      {isLive && (
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          background: 'linear-gradient(135deg, #ff00ff 0%, #cc00cc 100%)',
          borderRadius: '20px',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          color: '#fff',
          boxShadow: '0 4px 12px rgba(255, 0, 255, 0.4)',
          animation: 'pulse 2s infinite',
        }}>
          <span>🔴</span>
          <span>LIVE</span>
        </div>
      )}

      {/* HEAT METER (Live only) */}
      {isLive && (
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 10px',
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          borderRadius: '20px',
          fontSize: '0.75rem',
          color: creator.heatLevel > 70 ? '#ff4444' : creator.heatLevel > 40 ? '#ff9900' : '#00ff88',
          fontWeight: 'bold',
        }}>
          {creator.heatLevel > 70 ? '🔥' : creator.heatLevel > 40 ? '🌡️' : '❄️'}
          {creator.heatLevel.toFixed(0)}%
        </div>
      )}

      {/* AVATAR PLACEHOLDER */}
      <div style={{
        height: '200px',
        background: 'linear-gradient(180deg, #1a1a2e 0%, #0d0d1a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '4rem',
      }}>
        {creator.avatarUrl ? (
          <img 
            src={creator.avatarUrl} 
            alt={creator.displayName}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          '👤'
        )}
      </div>

      {/* CARD CONTENT */}
      <div style={{ padding: '16px' }}>
        {/* RANK & NAME */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '8px',
        }}>
          <span style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: isTopRank 
              ? 'linear-gradient(135deg, #ffd700, #ffaa00)' 
              : '#333',
            color: isTopRank ? '#000' : '#888',
            fontSize: '0.8rem',
            fontWeight: 'bold',
          }}>
            {rank}
          </span>
          <div>
            <div style={{
              fontSize: '1.1rem',
              fontWeight: 'bold',
              color: '#fff',
            }}>
              {creator.displayName}
            </div>
            <div style={{
              fontSize: '0.8rem',
              color: '#666',
            }}>
              @{creator.username}
            </div>
          </div>
        </div>

        {/* PRICE */}
        <div style={{
          fontSize: '1.3rem',
          fontWeight: 'bold',
          color: '#00ff88',
          marginBottom: '8px',
        }}>
          ${creator.price.toFixed(2)}
        </div>

        {/* BIO */}
        <p style={{
          fontSize: '0.85rem',
          color: '#888',
          marginBottom: '12px',
          lineHeight: 1.4,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {creator.bio || 'No bio yet...'}
        </p>

        {/* TAGS */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          marginBottom: '16px',
        }}>
          {creator.tags.slice(0, 3).map(tag => (
            <span key={tag} style={{
              padding: '4px 8px',
              background: 'rgba(255, 0, 255, 0.1)',
              border: '1px solid rgba(255, 0, 255, 0.3)',
              borderRadius: '12px',
              fontSize: '0.7rem',
              color: '#ff00ff',
            }}>
              #{tag}
            </span>
          ))}
        </div>

        {/* ACTIONS */}
        <div style={{
          display: 'flex',
          gap: '10px',
        }}>
          {/* VOTE BUTTON */}
          <button
            onClick={(e) => onVote(creator.id, e)}
            disabled={isVoting}
            style={{
              flex: 1,
              padding: '10px 12px',
              background: isVoting 
                ? '#444' 
                : 'linear-gradient(135deg, #1a1a2e 0%, #0d0d1a 100%)',
              border: '1px solid #444',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              cursor: isVoting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
          >
            {isVoting ? '⏳' : '👍'}
            <span>Vote</span>
            <span style={{
              fontSize: '0.7rem',
              color: '#888',
              background: '#222',
              padding: '2px 6px',
              borderRadius: '8px',
            }}>
              0.10
            </span>
          </button>

          {/* DM BUTTON */}
          <button
            onClick={(e) => onRequestDM(creator.id, e)}
            style={{
              flex: 1,
              padding: '10px 12px',
              background: userHasTypeB 
                ? 'linear-gradient(135deg, #ff00ff 0%, #cc00cc 100%)'
                : 'linear-gradient(135deg, #1a1a2e 0%, #0d0d1a 100%)',
              border: userHasTypeB ? 'none' : '1px solid #444',
              borderRadius: '10px',
              color: userHasTypeB ? '#fff' : '#666',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              cursor: userHasTypeB ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              boxShadow: userHasTypeB ? '0 4px 12px rgba(255, 0, 255, 0.3)' : 'none',
            }}
          >
            {userHasTypeB ? '💬' : '🔒'}
            <span>{userHasTypeB ? 'DM' : 'Locked'}</span>
          </button>
        </div>

        {/* VOTE COUNT */}
        <div style={{
          textAlign: 'center',
          marginTop: '10px',
          fontSize: '0.8rem',
          color: '#666',
        }}>
          {creator.votes.toLocaleString()} votes
        </div>
      </div>
    </div>
  );
};

// ============================================
// MOCK DATA FOR TESTING
// ============================================

export const MOCK_CREATORS: CreatorProfile[] = [
  {
    id: '1',
    username: 'sophia_nyx',
    displayName: 'Sophia Nyx',
    avatarUrl: '',
    bio: 'Late night vibes 🎤',
    price: 45.50,
    isLive: true,
    heatLevel: 85,
    votes: 1250,
    isEligibleTypeB: true,
    tags: ['singer', 'late-night', 'acoustic'],
    lastActive: new Date().toISOString(),
  },
  {
    id: '2',
    username: 'jade_whisper',
    displayName: 'Jade Whisper',
    avatarUrl: '',
    bio: 'Flowers and dreams 💐',
    price: 32.00,
    isLive: true,
    heatLevel: 62,
    votes: 890,
    isEligibleTypeB: true,
    tags: ['nature', 'calm', 'artist'],
    lastActive: new Date().toISOString(),
  },
  {
    id: '3',
    username: 'ruby_fire',
    displayName: 'Ruby Fire',
    avatarUrl: '',
    bio: 'Red hot performances 🔥',
    price: 78.00,
    isLive: false,
    heatLevel: 0,
    votes: 2100,
    isEligibleTypeB: true,
    tags: ['performer', 'energetic', 'dance'],
    lastActive: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '4',
    username: 'luna_starlight',
    displayName: 'Luna Starlight',
    avatarUrl: '',
    bio: 'Dreaming under the stars ✨',
    price: 55.25,
    isLive: false,
    heatLevel: 0,
    votes: 1675,
    isEligibleTypeB: true,
    tags: ['dreamy', 'cosmic', 'artist'],
    lastActive: new Date(Date.now() - 7200000).toISOString(),
  },
];

export default SocialDiscoveryFeed;
