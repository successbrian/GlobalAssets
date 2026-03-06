/**
 * PetOverlay.tsx
 * Self-contained Pet Avatar Overlay
 * 
 * "Your digital companion across the empire."
 * 
 * Usage: <PetOverlay userId="user-123" />
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Zap, 
  Star, 
  ChevronUp, 
  X,
  Bone,
  Utensils,
  Sparkles
} from 'lucide-react';

// ============================================
// SHARED TYPES (Contract)
// ============================================
export interface Pet {
  id: string;
  user_id: string;
  name: string;
  type: 'supporter' | 'titan';
  level: number;
  xp: number;
  xp_to_next_level: number;
  hunger: number;
  max_hunger: number;
  mood: 'happy' | 'neutral' | 'sad' | 'excited';
  avatar_url?: string;
  last_fed?: string;
  created_at: string;
}

export interface PetStats {
  totalXp: number;
  shoutoutsSent: number;
  daysActive: number;
  achievements: string[];
}

// ============================================
// COMPONENT
// ============================================
interface PetOverlayProps {
  userId: string;
  position?: 'bottom-right' | 'bottom-left';
  size?: 'small' | 'medium' | 'large';
}

export default function PetOverlay({ 
  userId, 
  position = 'bottom-right',
  size = 'medium' 
}: PetOverlayProps) {
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [showStats, setShowStats] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create internal Supabase client using empire env var
  const supabase = createClient(
    process.env.NEXT_PUBLIC_ORACLE_DB_URL!,
    process.env.NEXT_PUBLIC_ORACLE_DB_KEY!,
    {
      auth: { persistSession: false }
    }
  );

  // Fetch pet data
  const fetchPet = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('global_pet_registry')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPet(data as Pet);
      } else {
        // Create default pet for new users
        const { data: newPet, error: createError } = await supabase
          .from('global_pet_registry')
          .insert({
            user_id: userId,
            name: getRandomPetName(),
            type: 'supporter',
            level: 1,
            xp: 0,
            xp_to_next_level: 100,
            hunger: 80,
            max_hunger: 100,
            mood: 'happy',
          })
          .select()
          .single();

        if (createError) throw createError;
        setPet(newPet as Pet);
      }
    } catch (err) {
      console.error('PetOverlay: Failed to fetch pet:', err);
      setError('Pet unavailable');
    } finally {
      setLoading(false);
    }
  }, [userId, supabase]);

  useEffect(() => {
    fetchPet();
  }, [fetchPet]);

  // Calculate visual properties
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32',
  };

  const avatarEmoji = pet?.type === 'titan' ? '🦁' : '🐺';

  if (loading) {
    return (
      <div className={`fixed ${position === 'bottom-right' ? 'right-4' : 'left-4'} bottom-4 z-50`}>
        <div className={`${sizeClasses[size]} bg-gray-800/80 rounded-full animate-pulse flex items-center justify-center`}>
          <Bone className="w-6 h-6 text-gray-500" />
        </div>
      </div>
    );
  }

  if (error || !pet) {
    return null; // Silent fail - don't show error UI
  }

  return (
    <div className={`fixed ${position === 'bottom-right' ? 'right-4' : 'left-4'} bottom-4 z-50`}>
      <AnimatePresence>
        {/* Stats Card */}
        {showStats && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-full mb-3 right-0 w-72 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-2xl p-4 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center text-2xl shadow-lg">
                  {avatarEmoji}
                </div>
                <div>
                  <h3 className="text-white font-bold">{pet.name}</h3>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-400" />
                    Level {pet.level} {pet.type === 'titan' ? '🐲' : '🐺'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowStats(false)}
                className="text-gray-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* XP Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>XP Progress</span>
                <span>{pet.xp} / {pet.xp_to_next_level}</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(pet.xp / pet.xp_to_next_level) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Hunger Meter */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span className="flex items-center gap-1">
                  <Utensils className="w-3 h-3" />
                  Hunger
                </span>
                <span>{pet.hunger} / {pet.max_hunger}</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${
                    pet.hunger > 70 ? 'bg-green-500' : 
                    pet.hunger > 30 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(pet.hunger / pet.max_hunger) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Mood & Quick Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Mood:</span>
                <span className={`text-sm ${
                  pet.mood === 'excited' ? 'text-yellow-400' :
                  pet.mood === 'happy' ? 'text-green-400' :
                  pet.mood === 'sad' ? 'text-blue-400' : 'text-gray-400'
                }`}>
                  {pet.mood === 'excited' && '🤩 Excited'}
                  {pet.mood === 'happy' && '😊 Happy'}
                  {pet.mood === 'neutral' && '😐 Neutral'}
                  {pet.mood === 'sad' && '😢 Sad'}
                </span>
              </div>
              <button className="px-3 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 text-xs rounded-lg flex items-center gap-1 transition-colors">
                <Bone className="w-3 h-3" />
                Feed
              </button>
            </div>
          </motion.div>
        )}

        {/* Pet Avatar */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`${sizeClasses[size]} relative group cursor-pointer`}
          onClick={() => setShowStats(!showStats)}
        >
          {/* Glow effect for high level pets */}
          {pet.level >= 10 && (
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-500/30 to-orange-500/30 blur-xl animate-pulse" />
          )}
          
          {/* Pet Avatar */}
          <div className={`${sizeClasses[size]} relative rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border-2 ${
            pet.level >= 10 ? 'border-yellow-500' : 'border-gray-700'
          } shadow-2xl flex items-center justify-center overflow-hidden`}>
            
            {/* Avatar Emoji/Image */}
            <div className="text-4xl select-none transform transition-transform group-hover:scale-110">
              {avatarEmoji}
            </div>

            {/* Level Badge */}
            <div className="absolute -top-1 -right-1 w-7 h-7 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg border-2 border-gray-900">
              <span className="text-xs font-bold text-gray-900">{pet.level}</span>
            </div>

            {/* Hunger indicator */}
            {pet.hunger < 30 && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <Utensils className="w-3 h-3 text-white" />
              </div>
            )}

            {/* Floating XP indicator */}
            {pet.mood === 'excited' && (
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute top-2 left-1/2 -translate-x-1/2"
              >
                <Sparkles className="w-4 h-4 text-yellow-400" />
              </motion.div>
            )}
          </div>

          {/* Pet Name Label */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="text-xs text-gray-400 bg-gray-900/80 px-2 py-0.5 rounded-full">
              {pet.name}
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ============================================
// UTILITIES
// ============================================
function getRandomPetName(): string {
  const names = [
    'Luna', 'Max', 'Bella', 'Charlie', 'Lucy',
    'Cooper', 'Daisy', 'Milo', 'Lily', 'Rocky',
    'Chloe', 'Bear', 'Zoey', 'Goldie', 'Shadow'
  ];
  return names[Math.floor(Math.random() * names.length)];
}

// ============================================
// EXPORTS FOR MODULE SYSTEM
// ============================================
export { PetOverlay as default };
export type { Pet, PetStats, PetOverlayProps };
