/**
 * ShoutoutTicker.tsx
 * Self-contained Realtime Shoutout Notification
 * 
 * "When someone pays for a shoutout, the empire knows."
 * 
 * Usage: Just drop <ShoutoutTicker /> in the layout - zero config required.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Volume2, 
  VolumeX,
  Sparkles,
  Crown,
  Ghost,
  X
} from 'lucide-react';

// ============================================
// SHARED TYPES (Contract)
// ============================================
export interface Shoutout {
  id: string;
  content: string;           // The roast/message
  ghost_signature: string;    // 🦁 or other ghost emoji
  tropes: string[];           // ['fired', 'clown', 'genuine', etc.]
  site_origin: string;       // Which empire site sent this
  sender_name?: string;       // Optional sender display name
  amount_paid?: number;       // Payment amount
  created_at: string;
}

export interface ShoutoutConfig {
  position?: 'top' | 'bottom';
  maxVisible?: number;
  duration?: number;
  soundEnabled?: boolean;
}

// ============================================
// COMPONENT
// ============================================
export default function ShoutoutTicker({
  position = 'top',
  maxVisible = 3,
  duration = 8000,
  soundEnabled = false
}: ShoutoutConfig) {
  const [shoutouts, setShoutouts] = useState<Shoutout[]>([]);
  const [sound, setSound] = useState(soundEnabled);
  const [isPaused, setIsPaused] = useState(false);

  // Create internal Supabase client using empire env var
  const supabase = createClient(
    process.env.NEXT_PUBLIC_ORACLE_DB_URL!,
    process.env.NEXT_PUBLIC_ORACLE_DB_KEY!,
    {
      auth: { persistSession: false }
    }
  );

  // Sound effect for new shoutout
  const playShoutoutSound = useCallback(() => {
    if (!sound) return;
    
    // Create a simple beep using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  }, [sound]);

  // Add new shoutout to queue
  const addShoutout = useCallback((newShoutout: Shoutout) => {
    setShoutouts(prev => {
      const updated = [newShoutout, ...prev];
      return updated.slice(0, maxVisible);
    });
    
    playShoutoutSound();
  }, [maxVisible, playShoutoutSound]);

  // Remove shoutout from queue
  const removeShoutout = useCallback((id: string) => {
    setShoutouts(prev => prev.filter(s => s.id !== id));
  }, []);

  // Setup realtime subscription
  useEffect(() => {
    // Fetch initial recent shoutouts
    const fetchRecent = async () => {
      const { data } = await supabase
        .from('global_shoutout_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (data && data.length > 0) {
        setShoutouts(data as Shoutout[]);
      }
    };

    fetchRecent();

    // Subscribe to new rows
    const channel = supabase
      .channel('shoutout-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'global_shoutout_log',
        },
        (payload) => {
          const newShoutout = payload.new as Shoutout;
          addShoutout(newShoutout);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [addShoutout, supabase]);

  // Auto-remove shoutouts after duration
  useEffect(() => {
    if (shoutouts.length === 0) return;

    const timer = setTimeout(() => {
      if (!isPaused) {
        const oldest = shoutouts[shoutouts.length - 1];
        if (oldest) {
          removeShoutout(oldest.id);
        }
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [shoutouts, duration, isPaused, removeShoutout]);

  // Get trope color
  const getTropeColor = (trope: string): string => {
    const colors: Record<string, string> = {
      fired: 'bg-red-500/20 text-red-400 border-red-500/30',
      clown: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      genuine: 'bg-green-500/20 text-green-400 border-green-500/30',
      hype: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      roast: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      mystery: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    return colors[trope] || colors.mystery;
  };

  // Get random ghost content based on trope
  const generateGhostContent = (trope: string): string => {
    const content: Record<string, string[]> = {
      fired: [
        "Your productivity just got a termination notice 📄",
        "HR wants to see you. Immediately.",
        "Your desk is already being cleared out."
      ],
      clown: [
        "🎈 The circus is in town and you're the main act!",
        "Red nose not included but you're fitting in perfectly 🤡",
        "Honk honk! That's you leaving, right?"
      ],
      genuine: [
        "Someone believes in you! (It happens sometimes)",
        "Your vibes are actually immaculate for once 🌟",
        "Even the ghosts are rooting for you!"
      ],
      hype: [
        "THE CROWD GOES WILD! 📣",
        "LEGENDARY STATUS ACHIEVED! 🏆",
        "Your name is being carved into history!"
      ],
      roast: [
        "Oof. Even the ghosts are wincing 😬",
        "Your browser history is showing, bestie",
        "Please sit down. This is embarrassing."
      ],
      mystery: [
        "👁️ Something watches. Something judges.",
        "The void has... thoughts about you.",
        "🦁 *The ghost observes in silence*"
      ],
    };
    
    const options = content[trope] || content.mystery;
    return options[Math.floor(Math.random() * options.length)];
  };

  return (
    <>
      {/* Sound Toggle */}
      <button
        onClick={() => setSound(!sound)}
        className={`fixed ${position === 'top' ? 'top-4' : 'bottom-20'} right-4 z-50 p-2 rounded-full bg-gray-800/80 hover:bg-gray-700 transition-colors`}
        title={sound ? 'Mute shoutouts' : 'Enable shoutout sounds'}
      >
        {sound ? (
          <Volume2 className="w-5 h-5 text-green-400" />
        ) : (
          <VolumeX className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {/* Pause Toggle */}
      <button
        onClick={() => setIsPaused(!isPaused)}
        className={`fixed ${position === 'top' ? 'top-4' : 'bottom-20'} right-14 z-50 p-2 rounded-full bg-gray-800/80 hover:bg-gray-700 transition-colors`}
        title={isPaused ? 'Resume shoutouts' : 'Pause shoutouts'}
      >
        {isPaused ? (
          <Crown className="w-5 h-5 text-yellow-400" />
        ) : (
          <Sparkles className="w-5 h-5 text-blue-400" />
        )}
      </button>

      {/* Shoutout Container */}
      <div className={`fixed ${position === 'top' ? 'top-4' : 'bottom-4'} left-4 right-20 z-40 flex flex-col gap-2 pointer-events-none`}>
        <AnimatePresence mode="popLayout">
          {shoutouts.map((shoutout) => (
            <motion.div
              key={shoutout.id}
              initial={{ 
                opacity: 0, 
                x: -100, 
                scale: 0.8 
              }}
              animate={{ 
                opacity: 1, 
                x: 0, 
                scale: 1 
              }}
              exit={{ 
                opacity: 0, 
                x: 100, 
                scale: 0.8 
              }}
              transition={{ 
                type: 'spring',
                stiffness: 300,
                damping: 25
              }}
              className="pointer-events-auto"
            >
              <div className={`
                relative overflow-hidden rounded-xl 
                bg-gradient-to-r from-gray-900 to-gray-800 
                border border-gray-700 shadow-2xl
                max-w-md
              `}>
                {/* Animated accent bar */}
                <motion.div
                  className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-500 to-amber-500"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  exit={{ scaleY: 0 }}
                />

                {/* Close button */}
                <button
                  onClick={() => removeShoutout(shoutout.id)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="p-4 pl-5">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      <Ghost className="w-4 h-4 text-orange-400" />
                      <span className="text-orange-400 text-xs font-medium uppercase tracking-wider">
                        Ghost Shoutout
                      </span>
                    </div>
                    <span className="text-gray-600 text-xs">•</span>
                    <span className="text-gray-500 text-xs">
                      {shoutout.site_origin}
                    </span>
                  </div>

                  {/* Ghost Content (The Roast) */}
                  <p className="text-white font-medium mb-2">
                    {shoutout.content || generateGhostContent(shoutout.tropes[0])}
                  </p>

                  {/* Ghost Signature */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {shoutout.tropes.map((trope) => (
                        <span
                          key={trope}
                          className={`px-2 py-0.5 text-xs rounded-full border ${getTropeColor(trope)}`}
                        >
                          {trope}
                        </span>
                      ))}
                    </div>
                    <span className="text-lg">
                      {shoutout.ghost_signature || '🦁'}
                    </span>
                  </div>

                  {/* Sender info (if available) */}
                  {shoutout.sender_name && (
                    <p className="text-gray-500 text-xs mt-2 pt-2 border-t border-gray-700">
                      Sent by {shoutout.sender_name}
                      {shoutout.amount_paid && (
                        <span className="text-green-400 ml-2">
                          💰 ${shoutout.amount_paid}
                        </span>
                      )}
                    </p>
                  )}
                </div>

                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ width: '50%' }}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}

// ============================================
// ZERO-CONFIG DEFAULT EXPORT
// ============================================
/**
 * Novusferre just drops this in the layout:
 * 
 * import ShoutoutTicker from '@global-assets/shoutouts/ShoutoutTicker';
 * 
 * <Layout>
 *   <ShoutoutTicker />
 *   <Children />
 * </Layout>
 * 
 * It automatically connects to global_shoutout_log via Oracle DB
 * and shows toast animations for new shoutouts.
 */
export default function ZeroConfigShoutoutTicker() {
  return <ShoutoutTicker />;
}

export type { Shoutout, ShoutoutConfig };
