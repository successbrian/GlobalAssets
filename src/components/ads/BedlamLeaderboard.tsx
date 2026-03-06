// BedlamLeaderboard.tsx - Shared Ad Component for BannerBedlam Integration
// This component is designed to be imported by all apps in the monorepo
// Usage: Import from GlobalAssets/src/components/ads/BedlamLeaderboard

export interface BedlamLeaderboardProps {
  category: string;
  position: string;
}

export const BedlamLeaderboard = ({ category, position }: BedlamLeaderboardProps) => {
  // Check if admin - in production, import from your auth context
  const isAdmin = typeof window !== 'undefined' && 
    (localStorage.getItem('isAdmin') === 'true' || false);

  if (isAdmin) {
    return (
      <div
        className="bedlam-leaderboard-admin"
        style={{
          width: '100%',
          maxWidth: '728px',
          height: '90px',
          margin: '0 auto',
          backgroundColor: '#f3f4f6',
          border: '2px dashed #9ca3af',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6b7280',
          fontSize: '14px',
          fontWeight: 500,
        }}
      >
        <span style={{ marginRight: '8px' }}>🛡️</span>
        [ADMIN SHIELD] Bedlam Slot: {category} | Status: Ready
      </div>
    );
  }

  return (
    <div
      className="bedlam-leaderboard"
      style={{
        width: '100%',
        maxWidth: '728px',
        height: '90px',
        margin: '0 auto',
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
        }}
        data-ad-client="ca-pub-PLACEHOLDER"
        data-ad-slot=""
        data-ad-format="horizontal"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export const BedlamLeaderboardMobile = ({ category, position }: BedlamLeaderboardProps) => {
  const isAdmin = typeof window !== 'undefined' && 
    (localStorage.getItem('isAdmin') === 'true' || false);

  if (isAdmin) {
    return (
      <div
        className="bedlam-leaderboard-admin-mobile"
        style={{
          width: '100%',
          maxWidth: '320px',
          height: '50px',
          margin: '0 auto',
          backgroundColor: '#f3f4f6',
          border: '2px dashed #9ca3af',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6b7280',
          fontSize: '12px',
          fontWeight: 500,
        }}
      >
        <span style={{ marginRight: '6px' }}>🛡️</span>
        [ADMIN SHIELD] Bedlam: {category}
      </div>
    );
  }

  return (
    <div
      className="bedlam-leaderboard-mobile"
      style={{
        width: '100%',
        maxWidth: '320px',
        height: '50px',
        margin: '0 auto',
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        overflow: 'hidden',
      }}
    >
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
        }}
        data-ad-client="ca-pub-PLACEHOLDER"
        data-ad-slot=""
        data-ad-format="horizontal"
        data-full-width-responsive="true"
      />
    </div>
  );
};
