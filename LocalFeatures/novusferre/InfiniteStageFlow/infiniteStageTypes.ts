/**
 * INFINITE STAGE FLOW - TYPE DEFINITIONS
 * Gesture-Driven Content Navigation System
 */

import { Asset, User } from '../novusferreTypes';

// ============================================
// ENUMS
// ============================================

export enum ROTATION_INDEX {
  MIN = 1,
  MAX = 10,
  DISCOVERY_CLIP = 5,
  AD_SLOT = 10,
}

export enum GESTURE_TYPE {
  SWIPE_UP = 'SWIPE_UP',
  SWIPE_DOWN = 'SWIPE_DOWN',
  SWIPE_LEFT = 'SWIPE_LEFT',
  SWIPE_RIGHT = 'SWIPE_RIGHT',
  TAP = 'TAP',
  PINCH = 'PINCH',
  DOUBLE_TAP = 'DOUBLE_TAP',
}

export enum CONTENT_TYPE {
  LIVE_STAGE = 'LIVE_STAGE',
  DISCOVERY_CLIP = 'DISCOVERY_CLIP',
  VIDEO_AD = 'VIDEO_AD',
}

export enum PREFERENCE_ACTION {
  THUMBS_UP = 'THUMBS_UP',
  THUMBS_DOWN = 'THUMBS_DOWN',
  NEUTRAL = 'NEUTRAL',
  EXPIRED = 'EXPIRED',
}

export enum VIDEO_STATE {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  BUFFERING = 'BUFFERING',
  ERROR = 'ERROR',
  ENDED = 'ENDED',
}

export enum TIER_D_STATUS {
  NOT_APPLICABLE = 'NOT_APPLICABLE',
  ARRIVAL_TRIGGERED = 'ARRIVAL_TRIGGERED',
  ALREADY_SEEN = 'ALREADY_SEEN',
}

// ============================================
// CORE INTERFACES
// ============================================

export interface GestureEvent {
  type: GESTURE_TYPE;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  deltaX: number;
  deltaY: number;
  timestamp: number;
  targetElement?: HTMLElement;
}

export interface RotationItem {
  index: number;
  contentType: CONTENT_TYPE;
  contentId: string;
  creatorId?: string;
  priority: number;
  duration?: number; // For clips/ads
  metadata?: Record<string, any>;
}

export interface LiveStageItem extends RotationItem {
  contentType: CONTENT_TYPE.LIVE_STAGE;
  creatorName: string;
  tier: 'STANDARD' | 'WHALE' | 'LEGENDARY' | 'TIER_D';
  heatScore: number;
  battleStatus: 'NONE' | 'PENDING' | 'ACTIVE' | 'COMPLETED';
  viewerCount: number;
  streamUrl: string;
  thumbnailUrl: string;
}

export interface DiscoveryClipItem extends RotationItem {
  contentType: CONTENT_TYPE.DISCOVERY_CLIP;
  clipUrl: string;
  clipThumbnail: string;
  creatorName: string;
  duration: 10; // Fixed 10 seconds
  novusferreMediaId: string;
}

export interface VideoAdItem extends RotationItem {
  contentType: CONTENT_TYPE.VIDEO_AD;
  adUrl: string;
  adThumbnail: string;
  advertiserName: string;
  bannerBedlamId: string;
  duration: 10; // Fixed 10 seconds
  campaignId: string;
}

export type RotationContent = LiveStageItem | DiscoveryClipItem | VideoAdItem;

export interface UserPreferences {
  favorites: Set<string>; // Creator IDs with thumbs up
  exclusionList: Set<string>; // Creator IDs with thumbs down
  neutralHistory: string[]; // Creator IDs with no action
  lastSessionDate: string;
  totalSwipes: number;
}

export interface PreferenceState {
  isVisible: boolean;
  secondsRemaining: number;
  creatorId: string;
  actionTaken: boolean;
}

export interface PrefetchItem {
  item: RotationContent;
  state: VIDEO_STATE;
  progress: number; // 0-100
  error?: string;
}

export interface TierDArrivalEffects {
  confetti: {
    enabled: boolean;
    particleCount: number;
    colors: string[];
    duration: number;
  };
  crowdCheer: {
    enabled: boolean;
    audioUrl: string;
    volume: number;
  };
  overlay: {
    enabled: boolean;
    text: string;
    animation: 'zoom-in-pulse' | 'fade-in-scale' | 'cascade';
  };
}

export interface CleanViewState {
  isCleanView: boolean;
  chatOpacity: number;
  uiOpacity: number;
  animationProgress: number;
}

export interface VideoPlayerState {
  state: VIDEO_STATE;
  currentTime: number;
  duration: number;
  buffered: number;
  volume: number;
  isMuted: boolean;
  quality: 'auto' | '720p' | '1080p';
}

export interface GestureConfig {
  swipeThreshold: number;
  tapThreshold: number;
  pinchThreshold: number;
  verticalSensitivity: number;
  horizontalSensitivity: number;
}

export interface RotationConfig {
  loopCount: number;
  maxRotationItems: number;
  discoveryClipProbability: number;
  adPlacementInterval: number;
  tierDPriorityMultiplier: number;
  battlePriorityBonus: number;
  heatScoreWeight: number;
}

export interface PrefetchConfig {
  maxBufferSize: number;
  preloadDistance: number;
  garbageCollectAfter: number;
  maxConcurrent: number;
}

export interface InfiniteStageState {
  currentIndex: number;
  rotationQueue: RotationContent[];
  prefetchBuffer: PrefetchItem[];
  userPreferences: UserPreferences;
  cleanView: CleanViewState;
  currentVideo: VideoPlayerState | null;
  preference: PreferenceState | null;
  isTierDArrival: boolean;
  lastUpdate: string;
}

export interface InfiniteStageCallbacks {
  onSwipeUp: (item: RotationContent) => void;
  onSwipeDown: (item: RotationContent) => void;
  onCleanViewToggle: (isCleanView: boolean) => void;
  onPreferenceAction: (action: PREFERENCE_ACTION, creatorId: string) => void;
  onTierDArrival: (creatorId: string) => void;
  onContentLoad: (item: RotationContent) => void;
  onContentError: (item: RotationContent, error: string) => void;
  onRotationComplete: (loopCount: number) => void;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface LiveRoomsResponse {
  rooms: LiveStageItem[];
  totalCount: number;
  page: number;
}

export interface DiscoveryClipResponse {
  clip: DiscoveryClipItem;
  suggestedNext: DiscoveryClipItem[];
}

export interface VideoAdResponse {
  ad: VideoAdItem;
  targeting: {
    site: string;
    demographic: string;
    interests: string[];
  };
}

// ============================================
// THEME ASPECT RATIOS
// ============================================

export interface ThemeAspectRatio {
  themeId: string;
  ratio: number; // e.g., 16/9 = 1.777
  name: string;
}

export const THEME_ASPECT_RATIOS: ThemeAspectRatio[] = [
  { themeId: 'novusferre', ratio: 16/9, name: 'Novusferre Standard' },
  { themeId: 'civitas-reserve', ratio: 4/3, name: 'Civitas Classic' },
  { themeId: 'vextor-grid', ratio: 9/16, name: 'Vextor Vertical' },
  { themeId: 'banner-bedlam', ratio: 21/9, name: 'Bedlam Cinematic' },
  { themeId: 'civitas-dex', ratio: 1/1, name: 'DEX Square' },
  { themeId: 'dough-diamonds', ratio: 3/4, name: 'Dough Portrait' },
  { themeId: 'crypto-bot-craze', ratio: 16/9, name: 'Bot Standard' },
  { themeId: 'success-academy', ratio: 4/3, name: 'Academy Educational' },
  { themeId: 'social-ops', ratio: 1/1, name: 'OPS Square' },
  { themeId: 'munitions-reserve', ratio: 16/9, name: 'Munitions Wide' },
  { themeId: 'contact-flow', ratio: 9/16, name: 'Contact Vertical' },
  { themeId: 'chooz-poll', ratio: 1/1, name: 'Poll Square' },
  { themeId: 'sparky-ai', ratio: 16/9, name: 'AI Standard' },
  { themeId: 'civitas-market', ratio: 4/3, name: 'Market Classic' },
];

// ============================================
// CONSTANTS
// ============================================

export const GESTURE_CONSTANTS = {
  SWIPE_THRESHOLD: 100,
  TAP_THRESHOLD: 10,
  PINCH_THRESHOLD: 0.8,
  VERTICAL_SENSITIVITY: 1.0,
  HORIZONTAL_SENSITIVITY: 1.2,
  MIN_VELOCITY: 0.5,
} as const;

export const PREFERENCE_CONSTANTS = {
  DISPLAY_DURATION_MS: 5000,
  FADE_START_MS: 4000,
  THUMBS_UP_WEIGHT: 2.0,
  THUMBS_DOWN_EXCLUSION: true,
  NEUTRAL_DECAY: 0.9,
} as const;

export const ROTATION_CONSTANTS = {
  TOTAL_SLOTS: 10,
  STAGE_SLOTS: 8, // 1-4, 6-9
  DISCOVERY_SLOT: 5,
  AD_SLOT: 10,
  TIER_D_MULTIPLIER: 100,
  BATTLE_BONUS: 50,
  HEAT_WEIGHT: 1,
  MAX_PRIORITY: 1000,
} as const;

export const PREFETCH_CONSTANTS = {
  MAX_BUFFER_SIZE: 2,
  PRELOAD_DISTANCE: 1000,
  GARBAGE_COLLECT_AFTER_MS: 30000,
  MAX_CONCURRENT: 3,
} as const;

export const TIER_D_EFFECTS = {
  CONFETTI: {
    PARTICLE_COUNT: 500,
    COLORS: ['#0d0d1a', '#ff00ff', '#ffd700', '#00ffff'],
    DURATION: 3000,
  },
  OVERLAY: {
    TEXT: '⭐ TIER D ARRIVAL ⭐',
    ANIMATION: 'zoom-in-pulse' as const,
    DURATION: 2000,
  },
} as const;

// ============================================
// HELPER TYPES
// ============================================

export type SwipeDirection = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface SwipeVelocity {
  x: number;
  y: number;
  timestamp: number;
}

export interface AnimationFrame {
  id: number;
  progress: number;
  easing: 'linear' | 'ease-out' | 'ease-in-out';
}

export interface TouchPoint {
  identifier: number;
  x: number;
  y: number;
}
