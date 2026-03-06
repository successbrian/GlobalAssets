/**
 * ROTATION ENGINE - 10-Step Content Loop Logic
 * Manages the sequential rotation between Live Stages, Discovery Clips, and Video Ads
 */

import {
  ROTATION_INDEX,
  CONTENT_TYPE,
  PREFERENCE_ACTION,
  ROTATION_CONSTANTS,
  RotationContent,
  LiveStageItem,
  DiscoveryClipItem,
  VideoAdItem,
  UserPreferences,
  RotationConfig,
} from './infiniteStageTypes';

// ============================================
// PRIORITY CALCULATOR
// ============================================

export class PriorityCalculator {
  /**
   * Calculate priority score for a live stage room
   */
  static calculateLiveStagePriority(room: LiveStageItem, preferences: UserPreferences): number {
    let score = 0;

    const creatorId = room.creatorId || '';

    // Tier D priority (highest)
    if (room.tier === 'TIER_D') {
      score += ROTATION_CONSTANTS.TIER_D_MULTIPLIER;
    }

    // Battle status bonus
    if (room.battleStatus === 'ACTIVE') {
      score += ROTATION_CONSTANTS.BATTLE_BONUS;
    } else if (room.battleStatus === 'PENDING') {
      score += ROTATION_CONSTANTS.BATTLE_BONUS * 0.5;
    }

    // Heat score weight
    score += room.heatScore * ROTATION_CONSTANTS.HEAT_WEIGHT;

    // User preference adjustments
    if (creatorId && preferences.favorites.has(creatorId)) {
      score *= ROTATION_CONSTANTS.TIER_D_MULTIPLIER; // 2x weight
    }

    // Exclusion list penalty (exclude entirely)
    if (creatorId && preferences.exclusionList.has(creatorId)) {
      return -Infinity;
    }

    // Neutral history decay
    if (creatorId && preferences.neutralHistory.includes(creatorId)) {
      score *= 0.5;
    }

    return Math.min(score, ROTATION_CONSTANTS.MAX_PRIORITY);
  }

  /**
   * Get discovery clip from Novusferre Media
   */
  static async getDiscoveryClip(): Promise<DiscoveryClipItem> {
    // In production, this would call the Novusferre Media API
    return {
      index: ROTATION_INDEX.DISCOVERY_CLIP,
      contentType: CONTENT_TYPE.DISCOVERY_CLIP,
      contentId: `disc_${Date.now()}`,
      creatorName: 'Featured Creator',
      duration: 10,
      novusferreMediaId: `NOVUS_${Math.random().toString(36).substr(2, 9)}`,
      clipUrl: 'https://novusferre.media/discovery/clip.mp4',
      clipThumbnail: 'https://novusferre.media/discovery/thumb.jpg',
      priority: 50,
    };
  }

  /**
   * Get video ad from BannerBedlam Ad Network
   */
  static async getVideoAd(): Promise<VideoAdItem> {
    // In production, this would call the BannerBedlam Ad API
    return {
      index: ROTATION_INDEX.AD_SLOT,
      contentType: CONTENT_TYPE.VIDEO_AD,
      contentId: `ad_${Date.now()}`,
      advertiserName: 'BannerBedlam Campaign',
      duration: 10,
      bannerBedlamId: `BB_AD_${Math.random().toString(36).substr(2, 9)}`,
      campaignId: `CAMP_${Math.random().toString(36).substr(2, 9)}`,
      adUrl: 'https://bannerbedlam.ads/rotation.mp4',
      adThumbnail: 'https://bannerbedlam.ads/thumb.jpg',
      priority: 10,
    };
  }
}

// ============================================
// ROTATION ENGINE
// ============================================

export class RotationEngine {
  private config: RotationConfig;
  private currentIndex: number = 1;
  private loopCount: number = 0;
  private liveStages: LiveStageItem[] = [];
  private preferences: UserPreferences;
  private callbacks: {
    onRotationComplete?: (loopCount: number) => void;
    onItemSelected?: (item: RotationContent) => void;
  } = {};

  constructor(config?: Partial<RotationConfig>) {
    this.config = {
      loopCount: config?.loopCount ?? 0,
      maxRotationItems: config?.maxRotationItems ?? 10,
      discoveryClipProbability: config?.discoveryClipProbability ?? 0.1,
      adPlacementInterval: config?.adPlacementInterval ?? 10,
      tierDPriorityMultiplier: config?.tierDPriorityMultiplier ?? ROTATION_CONSTANTS.TIER_D_MULTIPLIER,
      battlePriorityBonus: config?.battlePriorityBonus ?? ROTATION_CONSTANTS.BATTLE_BONUS,
      heatScoreWeight: config?.heatScoreWeight ?? ROTATION_CONSTANTS.HEAT_WEIGHT,
    };

    this.preferences = {
      favorites: new Set(),
      exclusionList: new Set(),
      neutralHistory: [],
      lastSessionDate: new Date().toISOString(),
      totalSwipes: 0,
    };
  }

  /**
   * Set callbacks for rotation events
   */
  setCallbacks(callbacks: {
    onRotationComplete?: (loopCount: number) => void;
    onItemSelected?: (item: RotationContent) => void;
  }): void {
    this.callbacks = callbacks;
  }

  /**
   * Initialize with live stages data
   */
  initialize(liveStages: LiveStageItem[]): void {
    this.liveStages = liveStages.map(stage => ({
      ...stage,
      priority: PriorityCalculator.calculateLiveStagePriority(stage, this.preferences),
    }));

    // Sort by priority (highest first)
    this.liveStages.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get next item in rotation
   */
  async getNextItem(): Promise<RotationContent> {
    // Determine content type based on index
    const content = await this.determineContentForIndex(this.currentIndex);
    
    this.currentIndex++;
    
    // Reset index if we've completed a full rotation
    if (this.currentIndex > ROTATION_INDEX.MAX) {
      this.currentIndex = ROTATION_INDEX.MIN;
      this.loopCount++;
      this.callbacks.onRotationComplete?.(this.loopCount);
    }

    this.callbacks.onItemSelected?.(content);
    return content;
  }

  /**
   * Get previous item in rotation
   */
  async getPreviousItem(): Promise<RotationContent> {
    this.currentIndex--;
    
    if (this.currentIndex < ROTATION_INDEX.MIN) {
      this.currentIndex = ROTATION_INDEX.MAX;
      this.loopCount--;
    }

    return this.determineContentForIndex(this.currentIndex);
  }

  /**
   * Jump to specific index
   */
  async jumpToIndex(index: number): Promise<RotationContent> {
    if (index < ROTATION_INDEX.MIN || index > ROTATION_INDEX.MAX) {
      throw new Error(`Invalid rotation index: ${index}`);
    }

    this.currentIndex = index;
    return this.determineContentForIndex(index);
  }

  /**
   * Determine content type for a specific index
   */
  private async determineContentForIndex(index: number): Promise<RotationContent> {
    // Index 5: Discovery Clip
    if (index === ROTATION_INDEX.DISCOVERY_CLIP) {
      return PriorityCalculator.getDiscoveryClip();
    }

    // Index 10: Video Ad
    if (index === ROTATION_INDEX.AD_SLOT) {
      return PriorityCalculator.getVideoAd();
    }

    // Index 1-4, 6-9: Live Stage Rooms
    return this.getNextLiveStage();
  }

  /**
   * Get next live stage from the pool
   */
  private getNextLiveStage(): LiveStageItem {
    // Filter out excluded creators and already shown in this rotation
    const availableStages = this.liveStages.filter(stage => {
      const creatorId = stage.creatorId || '';
      if (this.preferences.exclusionList.has(creatorId)) {
        return false;
      }
      return true;
    });

    if (availableStages.length === 0) {
      // Fallback: return a placeholder or discovery clip
      return {
        index: this.currentIndex,
        contentType: CONTENT_TYPE.LIVE_STAGE,
        contentId: 'placeholder',
        creatorName: 'No Live Streams',
        tier: 'STANDARD',
        heatScore: 0,
        battleStatus: 'NONE',
        viewerCount: 0,
        streamUrl: '',
        thumbnailUrl: '',
        priority: 0,
      };
    }

    // Return highest priority stage
    return availableStages[0];
  }

  /**
   * Update user preference after thumbs up/down
   */
  processPreferenceAction(creatorId: string | undefined, action: PREFERENCE_ACTION): void {
    const safeCreatorId = creatorId || '';
    this.preferences.totalSwipes++;

    switch (action) {
      case PREFERENCE_ACTION.THUMBS_UP:
        if (safeCreatorId) {
          this.preferences.favorites.add(safeCreatorId);
          this.preferences.exclusionList.delete(safeCreatorId);
        }
        break;

      case PREFERENCE_ACTION.THUMBS_DOWN:
        if (safeCreatorId) {
          this.preferences.exclusionList.add(safeCreatorId);
          this.preferences.favorites.delete(safeCreatorId);
        }
        break;

      case PREFERENCE_ACTION.NEUTRAL:
      case PREFERENCE_ACTION.EXPIRED:
        if (safeCreatorId && !this.preferences.neutralHistory.includes(safeCreatorId)) {
          this.preferences.neutralHistory.push(safeCreatorId);
        }
        // Keep lists in sync
        if (safeCreatorId) {
          this.preferences.favorites.delete(safeCreatorId);
          this.preferences.exclusionList.delete(safeCreatorId);
        }
        break;
    }

    // Re-sort live stages based on updated preferences
    this.liveStages = this.liveStages.map(stage => ({
      ...stage,
      priority: PriorityCalculator.calculateLiveStagePriority(stage, this.preferences),
    }));
    this.liveStages.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get current rotation state
   */
  getState(): {
    currentIndex: number;
    loopCount: number;
    totalLiveStages: number;
    favoritesCount: number;
    exclusionCount: number;
  } {
    return {
      currentIndex: this.currentIndex,
      loopCount: this.loopCount,
      totalLiveStages: this.liveStages.length,
      favoritesCount: this.preferences.favorites.size,
      exclusionCount: this.preferences.exclusionList.size,
    };
  }

  /**
   * Reset rotation to initial state
   */
  reset(): void {
    this.currentIndex = ROTATION_INDEX.MIN;
    this.loopCount = 0;
    this.preferences.neutralHistory = [];
    this.preferences.totalSwipes = 0;
  }

  /**
   * Export preferences for storage
   */
  exportPreferences(): string {
    return JSON.stringify({
      favorites: Array.from(this.preferences.favorites),
      exclusionList: Array.from(this.preferences.exclusionList),
      neutralHistory: this.preferences.neutralHistory,
      lastSessionDate: this.preferences.lastSessionDate,
      totalSwipes: this.preferences.totalSwipes,
    });
  }

  /**
   * Import preferences from storage
   */
  importPreferences(json: string): void {
    try {
      const data = JSON.parse(json);
      this.preferences = {
        favorites: new Set(data.favorites || []),
        exclusionList: new Set(data.exclusionList || []),
        neutralHistory: data.neutralHistory || [],
        lastSessionDate: data.lastSessionDate || new Date().toISOString(),
        totalSwipes: data.totalSwipes || 0,
      };
    } catch (error) {
      console.error('Failed to import preferences:', error);
    }
  }
}

// ============================================
// ROTATION VISUALIZER
// ============================================

export class RotationVisualizer {
  private engine: RotationEngine;
  private container: HTMLElement | null = null;

  constructor(engine: RotationEngine) {
    this.engine = engine;
  }

  /**
   * Attach visualizer to DOM element
   */
  attach(container: HTMLElement): void {
    this.container = container;
    this.render();
  }

  /**
   * Render the current rotation state
   */
  render(): void {
    if (!this.container) return;

    const state = this.engine.getState();
    this.container.innerHTML = `
      <div class="rotation-visualizer">
        <div class="rotation-indicators">
          ${this.renderIndicators()}
        </div>
        <div class="rotation-info">
          <span>Loop: ${state.loopCount}</span>
          <span>Index: ${state.currentIndex}/10</span>
          <span>⭐ ${state.favoritesCount} | 🚫 ${state.exclusionCount}</span>
        </div>
      </div>
    `;
  }

  private renderIndicators(): string {
    const state = this.engine.getState();
    const indicators = [];

    for (let i = 1; i <= 10; i++) {
      let indicatorClass = 'rotation-indicator';
      if (i === state.currentIndex) {
        indicatorClass += ' active';
      } else if (i === 5) {
        indicatorClass += ' discovery';
      } else if (i === 10) {
        indicatorClass += ' ad';
      }

      indicators.push(`<div class="${indicatorClass}" data-index="${i}"></div>`);
    }

    return indicators.join('');
  }

  /**
   * Update visualizer (call after state change)
   */
  update(): void {
    this.render();
  }
}
