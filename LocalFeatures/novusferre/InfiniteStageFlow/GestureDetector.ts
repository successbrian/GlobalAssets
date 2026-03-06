/**
 * GESTURE DETECTOR - Touch & Mouse Gesture Recognition
 * Handles vertical/horizontal swipes for the Infinite Stage Flow
 */

import { 
  GESTURE_TYPE, 
  GestureEvent, 
  GestureConfig,
  GESTURE_CONSTANTS,
  SwipeDirection 
} from './infiniteStageTypes';

export class GestureDetector {
  private config: GestureConfig;
  private startX: number = 0;
  private startY: number = 0;
  private startTime: number = 0;
  private lastTapTime: number = 0;
  private touchStartPoints: Map<number, { x: number; y: number }> = new Map();
  private initialPinchDistance: number = 0;
  private isTracking: boolean = false;
  private element: HTMLElement | null = null;
  
  // Callbacks
  private onSwipeUp?: (event: GestureEvent) => void;
  private onSwipeDown?: (event: GestureEvent) => void;
  private onSwipeLeft?: (event: GestureEvent) => void;
  private onSwipeRight?: (event: GestureEvent) => void;
  private onTap?: (event: GestureEvent) => void;
  private onDoubleTap?: (event: GestureEvent) => void;
  private onPinch?: (event: GestureEvent, scale: number) => void;

  constructor(config?: Partial<GestureConfig>) {
    this.config = {
      swipeThreshold: config?.swipeThreshold ?? GESTURE_CONSTANTS.SWIPE_THRESHOLD,
      tapThreshold: config?.tapThreshold ?? GESTURE_CONSTANTS.TAP_THRESHOLD,
      pinchThreshold: config?.pinchThreshold ?? GESTURE_CONSTANTS.PINCH_THRESHOLD,
      verticalSensitivity: config?.verticalSensitivity ?? GESTURE_CONSTANTS.VERTICAL_SENSITIVITY,
      horizontalSensitivity: config?.horizontalSensitivity ?? GESTURE_CONSTANTS.HORIZONTAL_SENSITIVITY,
    };
  }

  /**
   * Attach gesture detection to an element
   */
  attach(element: HTMLElement): void {
    this.element = element;
    this.bindEvents();
  }

  /**
   * Detach from element and cleanup
   */
  detach(): void {
    if (this.element) {
      this.unbindEvents();
      this.element = null;
    }
  }

  /**
   * Set callback handlers
   */
  setCallbacks(callbacks: {
    onSwipeUp?: (event: GestureEvent) => void;
    onSwipeDown?: (event: GestureEvent) => void;
    onSwipeLeft?: (event: GestureEvent) => void;
    onSwipeRight?: (event: GestureEvent) => void;
    onTap?: (event: GestureEvent) => void;
    onDoubleTap?: (event: GestureEvent) => void;
    onPinch?: (event: GestureEvent, scale: number) => void;
  }): void {
    this.onSwipeUp = callbacks.onSwipeUp;
    this.onSwipeDown = callbacks.onSwipeDown;
    this.onSwipeLeft = callbacks.onSwipeLeft;
    this.onSwipeRight = callbacks.onSwipeRight;
    this.onTap = callbacks.onTap;
    this.onDoubleTap = callbacks.onDoubleTap;
    this.onPinch = callbacks.onPinch;
  }

  private bindEvents(): void {
    if (!this.element) return;

    // Touch events
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    this.element.addEventListener('touchcancel', this.handleTouchEnd.bind(this), { passive: false });

    // Mouse events
    this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.element.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.element.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.element.addEventListener('mouseleave', this.handleMouseUp.bind(this));
  }

  private unbindEvents(): void {
    if (!this.element) return;

    this.element.removeEventListener('touchstart', this.handleTouchStart.bind(this));
    this.element.removeEventListener('touchmove', this.handleTouchMove.bind(this));
    this.element.removeEventListener('touchend', this.handleTouchEnd.bind(this));
    this.element.removeEventListener('touchcancel', this.handleTouchEnd.bind(this));
    this.element.removeEventListener('mousedown', this.handleMouseDown.bind(this));
    this.element.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    this.element.removeEventListener('mouseup', this.handleMouseUp.bind(this));
    this.element.removeEventListener('mouseleave', this.handleMouseUp.bind(this));
  }

  // ============================================
  // TOUCH HANDLERS
  // ============================================

  private handleTouchStart(event: TouchEvent): void {
    event.preventDefault();
    
    if (event.touches.length === 1) {
      // Single touch - start tracking for swipe/tap
      const touch = event.touches[0];
      this.startX = touch.clientX;
      this.startY = touch.clientY;
      this.startTime = Date.now();
      this.isTracking = true;
    } else if (event.touches.length === 2) {
      // Multi-touch - start tracking pinch
      this.initialPinchDistance = this.getPinchDistance(event.touches);
      this.isTracking = true;
    }
  }

  private handleTouchMove(event: TouchEvent): void {
    event.preventDefault();
    
    // Prevent default only if we have multi-touch (pinch)
    if (event.touches.length === 2 && this.initialPinchDistance > 0) {
      const currentDistance = this.getPinchDistance(event.touches);
      const scale = currentDistance / this.initialPinchDistance;
      
      if (scale < this.config.pinchThreshold || scale > (1 / this.config.pinchThreshold)) {
        const touch0 = event.touches[0];
        const touch1 = event.touches[1];
        const centerX = (touch0.clientX + touch1.clientX) / 2;
        const centerY = (touch0.clientY + touch1.clientY) / 2;
        
        const gestureEvent: GestureEvent = {
          type: GESTURE_TYPE.PINCH,
          startX: this.startX,
          startY: this.startY,
          endX: centerX,
          endY: centerY,
          deltaX: centerX - this.startX,
          deltaY: centerY - this.startY,
          timestamp: Date.now(),
        };
        
        this.onPinch?.(gestureEvent, scale);
        this.initialPinchDistance = currentDistance;
      }
    }
  }

  private handleTouchEnd(event: TouchEvent): void {
    event.preventDefault();
    
    if (event.changedTouches.length === 1 && this.isTracking) {
      const touch = event.changedTouches[0];
      this.processGesture(
        touch.clientX,
        touch.clientY,
        Date.now() - this.startTime
      );
    }
    
    this.isTracking = false;
    this.initialPinchDistance = 0;
  }

  // ============================================
  // MOUSE HANDLERS
  // ============================================

  private handleMouseDown(event: MouseEvent): void {
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.startTime = Date.now();
    this.isTracking = true;
  }

  private handleMouseMove(event: MouseEvent): void {
    // Could track mouse velocity here if needed
  }

  private handleMouseUp(event: MouseEvent): void {
    if (!this.isTracking) return;
    
    this.processGesture(
      event.clientX,
      event.clientY,
      Date.now() - this.startTime
    );
    
    this.isTracking = false;
  }

  // ============================================
  // GESTURE PROCESSING
  // ============================================

  private processGesture(endX: number, endY: number, duration: number): void {
    const deltaX = endX - this.startX;
    const deltaY = endY - this.startY;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    const event: GestureEvent = {
      type: GESTURE_TYPE.TAP,
      startX: this.startX,
      startY: this.startY,
      endX,
      endY,
      deltaX,
      deltaY,
      timestamp: this.startTime,
    };

    // Check for tap (minimal movement)
    if (absDeltaX < this.config.tapThreshold && absDeltaY < this.config.tapThreshold) {
      const now = Date.now();
      const isDoubleTap = this.lastTapTime && (now - this.lastTapTime) < 300;
      this.lastTapTime = now;

      if (isDoubleTap && this.onDoubleTap) {
        event.type = GESTURE_TYPE.DOUBLE_TAP;
        this.onDoubleTap(event);
      } else if (this.onTap) {
        this.onTap(event);
      }
      return;
    }

    // Check for swipe (threshold exceeded)
    if (absDeltaX >= this.config.swipeThreshold || absDeltaY >= this.config.swipeThreshold) {
      // Determine direction based on dominant axis
      if (absDeltaY > absDeltaX * this.config.horizontalSensitivity) {
        // Vertical swipe
        if (deltaY < 0) {
          // Swipe UP
          event.type = GESTURE_TYPE.SWIPE_UP;
          this.onSwipeUp?.(event);
        } else {
          // Swipe DOWN
          event.type = GESTURE_TYPE.SWIPE_DOWN;
          this.onSwipeDown?.(event);
        }
      } else {
        // Horizontal swipe
        if (deltaX < 0) {
          // Swipe LEFT (Right-to-Left for Clean View toggle)
          event.type = GESTURE_TYPE.SWIPE_LEFT;
          this.onSwipeLeft?.(event);
        } else {
          // Swipe RIGHT
          event.type = GESTURE_TYPE.SWIPE_RIGHT;
          this.onSwipeRight?.(event);
        }
      }
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Calculate distance between two touch points for pinch detection
   */
  private getPinchDistance(touches: TouchList): number {
    const touch0 = touches[0];
    const touch1 = touches[1];
    const dx = touch0.clientX - touch1.clientX;
    const dy = touch0.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculate velocity of swipe for inertial scrolling
   */
  calculateVelocity(event: GestureEvent): { x: number; y: number } {
    const duration = event.timestamp - this.startTime || 1;
    return {
      x: event.deltaX / duration,
      y: event.deltaY / duration,
    };
  }

  /**
   * Determine swipe direction
   */
  static getSwipeDirection(event: GestureEvent): SwipeDirection {
    const absX = Math.abs(event.deltaX);
    const absY = Math.abs(event.deltaY);

    if (absY > absX) {
      return event.deltaY < 0 ? 'UP' : 'DOWN';
    }
    return event.deltaX < 0 ? 'LEFT' : 'RIGHT';
  }

  /**
   * Calculate progress (0-1) of gesture completion
   */
  static getGestureProgress(event: GestureEvent, threshold: number): number {
    const distance = Math.sqrt(event.deltaX ** 2 + event.deltaY ** 2);
    return Math.min(distance / threshold, 1);
  }
}

// ============================================
// SWIPE ANIMATION UTILITIES
// ============================================

export const SwipeAnimations = {
  /**
   * Get CSS transform for swipe animation
   */
  getSwipeTransform: (progress: number, direction: SwipeDirection): string => {
    const translateValue = progress * 100;
    const scaleValue = 1 - (progress * 0.1); // Slight scale down during swipe

    switch (direction) {
      case 'UP':
        return `translateY(${-translateValue}%) scale(${scaleValue})`;
      case 'DOWN':
        return `translateY(${translateValue}%) scale(${scaleValue})`;
      case 'LEFT':
        return `translateX(${-translateValue}%) scale(${scaleValue})`;
      case 'RIGHT':
        return `translateX(${translateValue}%) scale(${scaleValue})`;
    }
  },

  /**
   * Get opacity based on swipe progress (fade out)
   */
  getSwipeOpacity: (progress: number): number => {
    return 1 - progress;
  },

  /**
   * Get shadow intensity based on swipe progress
   */
  getSwipeShadow: (progress: number): string => {
    const intensity = progress * 20;
    return `0 ${intensity}px ${intensity * 2}px rgba(0, 0, 0, ${progress * 0.3})`;
  },
};

// ============================================
// CLEAN VIEW ANIMATIONS
// ============================================

export const CleanViewAnimations = {
  /**
   * Animate chat/UI overlay visibility
   */
  animateVisibility: (
    progress: number, // 0 = visible, 1 = hidden
    easing: 'linear' | 'ease-out' = 'ease-out'
  ): { opacity: number; transform: string } => {
    const easedProgress = easing === 'ease-out' ? 1 - Math.pow(1 - progress, 3) : progress;
    return {
      opacity: 1 - easedProgress,
      transform: `translateX(${easedProgress * 100}%)`,
    };
  },

  /**
   * Animate fullscreen expand
   */
  animateExpand: (progress: number): { scale: number; borderRadius: number } => {
    return {
      scale: 0.95 + (progress * 0.05),
      borderRadius: 20 - (progress * 18),
    };
  },
};
