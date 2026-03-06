/**
 * INFINITE STAGE FLOW - Main Orchestrator
 * Gesture-Driven Content Navigation System for 14-Site Empire
 * 
 * "Seamless transitions. Infinite content. One Empire."
 */

import {
  GESTURE_TYPE,
  CONTENT_TYPE,
  PREFERENCE_ACTION,
  VIDEO_STATE,
  TIER_D_STATUS,
  RotationContent,
  LiveStageItem,
  DiscoveryClipItem,
  VideoAdItem,
  UserPreferences,
  PreferenceState,
  CleanViewState,
  VideoPlayerState,
  InfiniteStageState,
  InfiniteStageCallbacks,
  GestureConfig,
  RotationConfig,
  PrefetchConfig,
  GESTURE_CONSTANTS,
  ROTATION_CONSTANTS,
  PREFETCH_CONSTANTS,
  PREFERENCE_CONSTANTS,
  TIER_D_EFFECTS,
} from './infiniteStageTypes';
import { GestureDetector, SwipeAnimations, CleanViewAnimations } from './GestureDetector';
import { RotationEngine, PriorityCalculator } from './RotationEngine';

// ============================================
// PREFERENCE OVERLAY CONTROLLER
// ============================================

class PreferenceOverlayController {
  private state: PreferenceState | null = null;
  private timer: number | null = null;
  private callbacks: {
    onThumbsUp?: (creatorId: string) => void;
    onThumbsDown?: (creatorId: string) => void;
    onExpired?: (creatorId: string) => void;
  } = {};

  show(creatorId: string): void {
    this.state = {
      isVisible: true,
      secondsRemaining: 5,
      creatorId,
      actionTaken: false,
    };
    this.startCountdown();
  }

  hide(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.state = null;
  }

  thumbsUp(): void {
    if (!this.state || this.state.actionTaken) return;
    this.state.actionTaken = true;
    this.callbacks.onThumbsUp?.(this.state.creatorId);
    this.hide();
  }

  thumbsDown(): void {
    if (!this.state || this.state.actionTaken) return;
    this.state.actionTaken = true;
    this.callbacks.onThumbsDown?.(this.state.creatorId);
    this.hide();
  }

  setCallbacks(callbacks: {
    onThumbsUp?: (creatorId: string) => void;
    onThumbsDown?: (creatorId: string) => void;
    onExpired?: (creatorId: string) => void;
  }): void {
    this.callbacks = callbacks;
  }

  getState(): PreferenceState | null {
    return this.state;
  }

  private startCountdown(): void {
    this.timer = window.setInterval(() => {
      if (!this.state) {
        this.stopCountdown();
        return;
      }
      this.state.secondsRemaining--;
      if (this.state.secondsRemaining <= 0) {
        this.state.actionTaken = true;
        this.callbacks.onExpired?.(this.state.creatorId);
        this.hide();
      }
    }, 1000);
  }

  private stopCountdown(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

// ============================================
// CLEAN VIEW CONTROLLER
// ============================================

class CleanViewController {
  private state: CleanViewState = {
    isCleanView: false,
    chatOpacity: 1,
    uiOpacity: 1,
    animationProgress: 0,
  };
  private callbacks: {
    onToggle?: (isCleanView: boolean) => void;
  } = {};

  toggle(): void {
    this.state.isCleanView = !this.state.isCleanView;
    this.callbacks.onToggle?.(this.state.isCleanView);
  }

  enter(): void {
    if (!this.state.isCleanView) {
      this.state.isCleanView = true;
      this.callbacks.onToggle?.(true);
    }
  }

  exit(): void {
    if (this.state.isCleanView) {
      this.state.isCleanView = false;
      this.callbacks.onToggle?.(false);
    }
  }

  setCallbacks(callbacks: {
    onToggle?: (isCleanView: boolean) => void;
  }): void {
    this.callbacks = callbacks;
  }

  getAnimationValues(): { chatOpacity: number; uiOpacity: number; transform: string } {
    const progress = this.state.isCleanView ? 1 : 0;
    const { opacity } = CleanViewAnimations.animateVisibility(progress);
    return {
      chatOpacity: opacity,
      uiOpacity: opacity,
      transform: `translateX(${this.state.isCleanView ? '100%' : '0%'})`,
    };
  }

  getState(): CleanViewState {
    return { ...this.state };
  }
}

// ============================================
// TIER D ARRIVAL CONTROLLER
// ============================================

class TierDArrivalController {
  private isArrivalActive: boolean = false;
  private seenTierD: Set<string> = new Set();
  private callbacks: {
    onArrival?: (creatorId: string) => void;
  } = {};

  checkAndTrigger(creator: LiveStageItem): TIER_D_STATUS {
    if (creator.tier !== 'TIER_D') {
      return TIER_D_STATUS.NOT_APPLICABLE;
    }
    const creatorId = creator.creatorId || '';
    if (this.seenTierD.has(creatorId)) {
      return TIER_D_STATUS.ALREADY_SEEN;
    }
    if (!this.isArrivalActive) {
      this.isArrivalActive = true;
      this.seenTierD.add(creatorId);
      this.callbacks.onArrival?.(creatorId);
      setTimeout(() => {
        this.isArrivalActive = false;
      }, TIER_D_EFFECTS.OVERLAY.DURATION);
    }
    return TIER_D_STATUS.ARRIVAL_TRIGGERED;
  }

  markAsSeen(creatorId: string): void {
    this.seenTierD.add(creatorId);
  }

  setCallbacks(callbacks: {
    onArrival?: (creatorId: string) => void;
  }): void {
    this.callbacks = callbacks;
  }

  getEffectsConfig(): typeof TIER_D_EFFECTS {
    return { ...TIER_D_EFFECTS };
  }

  isActive(): boolean {
    return this.isArrivalActive;
  }
}

// ============================================
// PREFETCH MANAGER
// ============================================

class PrefetchManager {
  private config: PrefetchConfig;
  private buffer: Map<number, RotationContent> = new Map();
  private loadedIndices: Set<number> = new Set();
  private callbacks: {
    onItemReady?: (index: number, item: RotationContent) => void;
    onItemError?: (index: number, error: string) => void;
  } = {};

  constructor(config?: Partial<PrefetchConfig>) {
    this.config = {
      maxBufferSize: config?.maxBufferSize ?? PREFETCH_CONSTANTS.MAX_BUFFER_SIZE,
      preloadDistance: config?.preloadDistance ?? PREFETCH_CONSTANTS.PRELOAD_DISTANCE,
      garbageCollectAfter: config?.garbageCollectAfter ?? PREFETCH_CONSTANTS.GARBAGE_COLLECT_AFTER_MS,
      maxConcurrent: config?.maxConcurrent ?? PREFETCH_CONSTANTS.MAX_CONCURRENT,
    };
  }

  async prefetch(currentIndex: number, items: RotationContent[]): Promise<void> {
    this.buffer.clear();
    for (let i = 1; i <= this.config.maxBufferSize; i++) {
      const targetIndex = ((currentIndex + i - 2) % 10) + 1;
      const item = items.find(item => item.index === targetIndex);
      if (item) {
        await this.loadItem(targetIndex, item);
      }
    }
  }

  private async loadItem(index: number, item: RotationContent): Promise<void> {
    try {
      await this.simulateLoad(item);
      this.buffer.set(index, item);
      this.loadedIndices.add(index);
      this.callbacks.onItemReady?.(index, item);
    } catch (error) {
      this.callbacks.onItemError?.(index, (error as Error).message);
    }
  }

  private async simulateLoad(_item: RotationContent): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(), 500);
    });
  }

  getPrefetched(index: number): RotationContent | undefined {
    return this.buffer.get(index);
  }

  isReady(index: number): boolean {
    return this.loadedIndices.has(index);
  }

  setCallbacks(callbacks: {
    onItemReady?: (index: number, item: RotationContent) => void;
    onItemError?: (index: number, error: string) => void;
  }): void {
    this.callbacks = callbacks;
  }

  clear(): void {
    this.buffer.clear();
    this.loadedIndices.clear();
  }
}

// ============================================
// THEME ASPECT RATIO MANAGER
// ============================================

const THEME_ASPECT_RATIOS = [
  { themeId: 'novusferre', ratio: 16/9 },
  { themeId: 'civitas-reserve', ratio: 4/3 },
  { themeId: 'vextor-grid', ratio: 9/16 },
  { themeId: 'banner-bedlam', ratio: 21/9 },
  { themeId: 'civitas-dex', ratio: 1/1 },
  { themeId: 'dough-diamonds', ratio: 3/4 },
  { themeId: 'crypto-bot-craze', ratio: 16/9 },
  { themeId: 'success-academy', ratio: 4/3 },
  { themeId: 'social-ops', ratio: 1/1 },
  { themeId: 'munitions-reserve', ratio: 16/9 },
  { themeId: 'contact-flow', ratio: 9/16 },
  { themeId: 'chooz-poll', ratio: 1/1 },
  { themeId: 'sparky-ai', ratio: 16/9 },
  { themeId: 'civitas-market', ratio: 4/3 },
];

class ThemeAspectRatioManager {
  private currentTheme: string = 'novusferre';

  getRatio(themeId?: string): number {
    const theme = themeId || this.currentTheme;
    const found = THEME_ASPECT_RATIOS.find(t => t.themeId === theme);
    return found?.ratio ?? (16 / 9);
  }

  getCSSValue(themeId?: string): string {
    return this.getRatio(themeId).toString();
  }

  setTheme(themeId: string): void {
    this.currentTheme = themeId;
  }

  getContainerStyles(themeId?: string): object {
    const ratio = this.getRatio(themeId);
    return {
      aspectRatio: ratio,
      maxHeight: '100vh',
      maxWidth: '100%',
      objectFit: 'contain' as const,
    };
  }

  getAllThemes(): typeof THEME_ASPECT_RATIOS {
    return [...THEME_ASPECT_RATIOS];
  }
}

// ============================================
// MAIN INFINITE STAGE FLOW
// ============================================

export class InfiniteStageFlow {
  private gestureDetector: GestureDetector;
  private rotationEngine: RotationEngine;
  private preferenceOverlay: PreferenceOverlayController;
  private cleanView: CleanViewController;
  private tierDArrival: TierDArrivalController;
  private prefetchManager: PrefetchManager;
  private aspectRatioManager: ThemeAspectRatioManager;
  
  private currentItem: RotationContent | null = null;
  private rotationQueue: RotationContent[] = [];
  private videoState: VideoPlayerState | null = null;
  
  private callbacks: Partial<InfiniteStageCallbacks> = {};
  private isInitialized: boolean = false;

  constructor(config?: {
    gestureConfig?: Partial<GestureConfig>;
    rotationConfig?: Partial<RotationConfig>;
    prefetchConfig?: Partial<PrefetchConfig>;
  }) {
    this.gestureDetector = new GestureDetector(config?.gestureConfig);
    this.rotationEngine = new RotationEngine(config?.rotationConfig);
    this.preferenceOverlay = new PreferenceOverlayController();
    this.cleanView = new CleanViewController();
    this.tierDArrival = new TierDArrivalController();
    this.prefetchManager = new PrefetchManager(config?.prefetchConfig);
    this.aspectRatioManager = new ThemeAspectRatioManager();
    this.setupInternalCallbacks();
  }

  initialize(liveStages: LiveStageItem[]): void {
    this.rotationEngine.initialize(liveStages);
    this.isInitialized = true;
  }

  attach(element: HTMLElement): void {
    this.gestureDetector.attach(element);
  }

  detach(): void {
    this.gestureDetector.detach();
  }

  setCallbacks(callbacks: Partial<InfiniteStageCallbacks>): void {
    this.callbacks = { ...callbacks };
  }

  async start(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('InfiniteStageFlow not initialized');
    }
    const item = await this.rotationEngine.getNextItem();
    await this.displayItem(item);
  }

  private async handleSwipeUp(): Promise<void> {
    if (!this.currentItem) return;
    this.callbacks.onSwipeUp?.(this.currentItem);
    const nextItem = await this.rotationEngine.getNextItem();
    await this.displayItem(nextItem);
  }

  private async handleSwipeDown(): Promise<void> {
    if (!this.currentItem) return;
    this.callbacks.onSwipeDown?.(this.currentItem);
    const prevItem = await this.rotationEngine.getPreviousItem();
    await this.displayItem(prevItem);
  }

  private handleSwipeLeft(): void {
    this.cleanView.enter();
    this.callbacks.onCleanViewToggle?.(true);
  }

  private handleSwipeRight(): void {
    this.cleanView.exit();
    this.callbacks.onCleanViewToggle?.(false);
  }

  private async displayItem(item: RotationContent): Promise<void> {
    this.currentItem = item;
    this.rotationQueue.push(item);

    if (item.contentType === CONTENT_TYPE.LIVE_STAGE) {
      const tierStatus = this.tierDArrival.checkAndTrigger(item as LiveStageItem);
      if (tierStatus === TIER_D_STATUS.ARRIVAL_TRIGGERED) {
        this.callbacks.onTierDArrival?.(item.creatorId || '');
      }
    }

    if (item.contentType === CONTENT_TYPE.LIVE_STAGE) {
      this.preferenceOverlay.show(item.creatorId || '');
    }

    this.callbacks.onContentLoad?.(item);
    await this.prefetchManager.prefetch(item.index, this.rotationQueue);
  }

  private setupInternalCallbacks(): void {
    this.gestureDetector.setCallbacks({
      onSwipeUp: () => this.handleSwipeUp(),
      onSwipeDown: () => this.handleSwipeDown(),
      onSwipeLeft: () => this.handleSwipeLeft(),
      onSwipeRight: () => this.handleSwipeRight(),
    });

    this.preferenceOverlay.setCallbacks({
      onThumbsUp: (creatorId) => {
        this.rotationEngine.processPreferenceAction(creatorId, PREFERENCE_ACTION.THUMBS_UP);
        this.callbacks.onPreferenceAction?.(PREFERENCE_ACTION.THUMBS_UP, creatorId);
      },
      onThumbsDown: (creatorId) => {
        this.rotationEngine.processPreferenceAction(creatorId, PREFERENCE_ACTION.THUMBS_DOWN);
        this.callbacks.onPreferenceAction?.(PREFERENCE_ACTION.THUMBS_DOWN, creatorId);
      },
      onExpired: (creatorId) => {
        this.rotationEngine.processPreferenceAction(creatorId, PREFERENCE_ACTION.EXPIRED);
        this.callbacks.onPreferenceAction?.(PREFERENCE_ACTION.EXPIRED, creatorId);
      },
    });

    this.cleanView.setCallbacks({
      onToggle: (isCleanView) => {
        this.callbacks.onCleanViewToggle?.(isCleanView);
      },
    });

    this.tierDArrival.setCallbacks({
      onArrival: (_creatorId) => {},
    });

    this.prefetchManager.setCallbacks({
      onItemReady: (_index, _item) => {},
      onItemError: (_index, _error) => {},
    });
  }

  getState(): InfiniteStageState {
    return {
      currentIndex: this.currentItem?.index ?? 1,
      rotationQueue: [...this.rotationQueue],
      prefetchBuffer: [],
      userPreferences: {
        favorites: new Set(),
        exclusionList: new Set(),
        neutralHistory: [],
        lastSessionDate: new Date().toISOString(),
        totalSwipes: 0,
      },
      cleanView: this.cleanView.getState(),
      currentVideo: this.videoState,
      preference: this.preferenceOverlay.getState(),
      isTierDArrival: this.tierDArrival.isActive(),
      lastUpdate: new Date().toISOString(),
    };
  }

  toggleCleanView(): void {
    this.cleanView.toggle();
  }

  getCleanViewAnimation(): { chatOpacity: number; uiOpacity: number; transform: string } {
    return this.cleanView.getAnimationValues();
  }

  getAspectRatioStyles(themeId?: string): object {
    return this.aspectRatioManager.getContainerStyles(themeId);
  }

  thumbsUp(): void {
    this.preferenceOverlay.thumbsUp();
  }

  thumbsDown(): void {
    this.preferenceOverlay.thumbsDown();
  }

  async skip(): Promise<void> {
    await this.handleSwipeUp();
  }

  reset(): void {
    this.rotationEngine.reset();
    this.preferenceOverlay.hide();
    this.cleanView.exit();
    this.tierDArrival = new TierDArrivalController();
    this.prefetchManager.clear();
    this.currentItem = null;
    this.rotationQueue = [];
  }

  exportPreferences(): string {
    return this.rotationEngine.exportPreferences();
  }

  importPreferences(json: string): void {
    this.rotationEngine.importPreferences(json);
  }
}


