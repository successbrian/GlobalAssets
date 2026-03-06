/**
 * useGhostOracle - Cross-Site @SatoshiGhost Broadcasting
 * 
 * Connects to Supabase global-oracle channel to listen for
 * cross-site broadcasts from the Oracle Brain.
 * 
 * Features:
 * - Real-time listening for @SatoshiGhost posts
 * - Browser notifications for new broadcasts
 * - Ghost Note display
 * - Trope highlighting
 */

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../src/lib/supabase';

export interface GhostPost {
  id: string;
  ghost_content: string;
  ghost_note: string;
  tropes_used: string[];
  source_site: string;
  timestamp: string;
}

export interface UseGhostOracleOptions {
  enabled?: boolean;
  showNotifications?: boolean;
  onNewBroadcast?: (post: GhostPost) => void;
}

export function useGhostOracle(options: UseGhostOracleOptions = {}) {
  const {
    enabled = true,
    showNotifications = true,
    onNewBroadcast,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [latestPost, setLatestPost] = useState<GhostPost | null>(null);
  const [broadcasts, setBroadcasts] = useState<GhostPost[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to global-oracle channel
  useEffect(() => {
    if (!enabled) return;

    const channel = supabase
      .channel('global-oracle-broadcasts')
      .on(
        'postgres_changes' as any,
        {
          event: 'INSERT',
          schema: 'public',
          table: 'global_shoutout_log',
          filter: 'broadcast_status=eq.delivered',
        },
        (payload: any) => {
          const newPost = payload.new as any;
          const ghostPost: GhostPost = {
            id: newPost.id,
            ghost_content: newPost.ghost_content,
            ghost_note: newPost.ghost_note,
            tropes_used: newPost.tropes_used || [],
            source_site: newPost.source_site_id,
            timestamp: newPost.delivered_at,
          };

          // Update state
          setLatestPost(ghostPost);
          setBroadcasts((prev) => [ghostPost, ...prev.slice(0, 9)]);

          // Trigger notification
          if (showNotifications && 'Notification' in window) {
            if (Notification.permission === 'granted') {
              new Notification('🦁 @SatoshiGhost', {
                body: ghostPost.ghost_content.slice(0, 100) + '...',
                icon: '/favicon.ico',
              });
            }
          }

          // Callback
          if (onNewBroadcast) {
            onNewBroadcast(ghostPost);
          }
        }
      )
      .subscribe((status: string) => {
        setIsConnected(status === 'SUBSCRIBED');
        if (status === 'SUBSCRIBED') {
          console.log('🔮 Connected to Oracle Brain');
        }
      });

    // Request notification permission
    if (showNotifications && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      supabase.removeChannel(channel);
      setIsConnected(false);
    };
  }, [enabled, showNotifications, onNewBroadcast]);

  // Fetch recent broadcasts
  const fetchRecentBroadcasts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('global_shoutout_log')
        .select('*')
        .eq('broadcast_status', 'delivered')
        .order('delivered_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const posts: GhostPost[] = (data || []).map((post: any) => ({
        id: post.id,
        ghost_content: post.ghost_content,
        ghost_note: post.ghost_note,
        tropes_used: post.tropes_used || [],
        source_site: post.source_site_id,
        timestamp: post.delivered_at,
      }));

      setBroadcasts(posts);
      if (posts.length > 0) {
        setLatestPost(posts[0]);
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching broadcasts:', err);
    }
  }, []);

  // Manually trigger broadcast refresh
  const refresh = useCallback(() => {
    fetchRecentBroadcasts();
  }, [fetchRecentBroadcasts]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchRecentBroadcasts();
    }
  }, [enabled, fetchRecentBroadcasts]);

  return {
    isConnected,
    latestPost,
    broadcasts,
    error,
    refresh,
    isEnabled: enabled,
  };
}

/**
 * GhostNote - Layman explanation component helper
 */
export function formatGhostNote(note: string): string {
  if (!note) return '';
  return `💭 ${note}`;
}

/**
 * TropeHighlighter - Highlight nerd tropes in content
 */
export function highlightTropes(
  content: string,
  tropes: string[]
): { text: string; isTrope: boolean[] } {
  if (!tropes || tropes.length === 0) {
    return { text: content, isTrope: [] };
  }

  const tropePatterns = tropes.map((t) => new RegExp(t, 'gi'));
  let result = content;
  const isTrope: boolean[] = [];

  // Simple implementation - in production, use proper tokenization
  tropePatterns.forEach((pattern) => {
    result = result.replace(pattern, (match) => `[[${match}]]`);
  });

  return {
    text: result,
    isTrope,
  };
}

export default useGhostOracle;
