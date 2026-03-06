# Infinite Stage Flow - Architecture Plan

## Overview

The **Infinite Stage Flow** is a gesture-driven content navigation system for the 14-site Empire ecosystem. It provides seamless transitions between Live Rooms, Discovery Clips, and Video Ads using intuitive touch/mouse gestures.

## Core Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    INFINITE STAGE FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Gesture    │  │   Rotation   │  │   Preference         │  │
│  │   Detector   │─▶│   Engine     │─▶│   Overlay            │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│         │                 │                    │               │
│         ▼                 ▼                    ▼               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Clean View   │  │ 10-Step Loop │  │ User Signals         │  │
│  │ Toggle       │  │ (Stage/Ads)  │  │ (Favorites/Exclusion)│  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│         │                 │                    │               │
│         └─────────────────┼────────────────────┘               │
│                           ▼                                    │
│              ┌─────────────────────────┐                      │
│              │    Prefetch Manager     │                      │
│              │  (Next 2 Items Buffer)  │                      │
│              └─────────────────────────┘                      │
│                           │                                    │
│                           ▼                                    │
│              ┌─────────────────────────┐                      │
│              │  Theme-Aware Video      │                      │
│              │  Container (16:9/9:16)  │                      │
│              └─────────────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘
```

## 1. Gesture Detection System

### Vertical Swipe (Content Transition)
| Gesture | Threshold | Action |
|---------|-----------|--------|
| Swipe Up | > 100px | Next content in rotation |
| Swipe Down | > 100px | Previous content in rotation |
| Tap | < 10px | Select/Interact with current content |

### Horizontal Swipe (Clean View Toggle)
| Gesture | Threshold | Action |
|---------|-----------|--------|
| Swipe Right-to-Left | > 80px | Hide Chat/UI overlay |
| Swipe Left-to-Right | > 80px | Show Chat/UI overlay |
| Pinch | < 0.8x | Enter fullscreen |
| Double Tap | - | Toggle play/pause |

## 2. 10-Step Rotation Logic

```
INDEX  │ CONTENT TYPE              │ PRIORITY ORDER              │ DURATION
───────┼───────────────────────────┼─────────────────────────────┼─────────
1-4    │ Live Stage Rooms          │ Tier D > Active Battles     │ Until swipe
       │                           │ > High Heat                 │
───────┼───────────────────────────┼─────────────────────────────┼─────────
5      │ Discovery Clip (10s)       │ Novusferre Media Library    │ 10 seconds
       │                           │ Random selection             │
───────┼───────────────────────────┼─────────────────────────────┼─────────
6-9    │ Live Stage Rooms           │ Same priority as 1-4        │ Until swipe
       │                           │ (avoids repeats)            │
───────┼───────────────────────────┼─────────────────────────────┼─────────
10     │ Video Ad (10s)            │ BannerBedlam Ad Network     │ 10 seconds
       │                           │ Rotational campaign         │
───────┴───────────────────────────┴─────────────────────────────┴─────────
                                    │
                                    ▼
                          LOOP BACK TO INDEX 1
```

### Priority Scoring Algorithm
```typescript
priorityScore(room) = 
  (tier === 'TIER_D' ? 100 : 0) +
  (battleStatus === 'ACTIVE' ? 50 : 0) +
  (heatScore / 10) +
  (userFavorites.has(room.creatorId) ? 25 : 0) -
  (userExclusion.has(room.creatorId) ? 1000 : 0)
```

## 3. 5-Second Preference Overlay

### State Machine
```
┌─────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  ENTRY      │───▶│  5-SECOND        │───▶│  FADE/RECORD    │
│  (Enter)    │    │  COUNTDOWN       │    │  (No Action)    │
└─────────────┘    └──────────────────┘    └─────────────────┘
       │                   │                       │
       │                   │                       │
       ▼                   ▼                       ▼
┌─────────────┐    ┌──────────────────┐    ┌─────────────┐
│ THUMBS UP   │    │ THUMBS DOWN      │    │ NEUTRAL      │
│ (Immediate) │    │ (Immediate)      │    │ (Fade out)   │
└─────────────┘    └──────────────────┘    └─────────────┘
       │                   │                       │
       │                   │                       │
       ▼                   ▼                       ▼
┌─────────────┐    ┌──────────────────┐    ┌─────────────┐
│ +25 score   │    │ Next content     │    │ No change   │
│ Favorites   │    │ Exclusion list   │    │ Neutral     │
└─────────────┘    └──────────────────┘    └─────────────┘
```

### Visual Design
```
┌─────────────────────────────────────────┐
│                                         │
│    ┌─────────────────────────────────┐  │
│    │                                 │  │
│    │      [CREATOR NAME]             │  │
│    │      ⭐ TIER D                  │  │
│    │                                 │  │
│    │   ┌─────────┐   ┌─────────┐    │  │
│    │   │   👍    │   │   👎    │    │  │
│    │   │  LIKE   │   │  PASS   │    │  │
│    │   └─────────┘   └─────────┘    │  │
│    │                                 │  │
│    │      ⏱ 5 seconds remaining      │  │
│    └─────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

## 4. Tier D Integration (CelebrityArrival Hook)

### Trigger Conditions
- User swipes into a Tier D creator's room
- First time viewing this creator in current session

### Visual Effects
```typescript
interface CelebrityArrivalEffects {
  confetti: {
    colors: string[];      // Empire brand colors
    particleCount: number;  // 500-1000 particles
    duration: number;       // 3 seconds
  };
  crowdCheer: {
    audioFile: string;       // "cheer_empire.mp3"
    volume: number;         // 0.8
  };
  overlay: {
    text: "⭐ TIER D ARRIVAL ⭐";
    animation: "zoom-in-pulse";
  };
}
```

### Tier D Priority Behavior
```
TIER_D creators always appear at:
- Index 1 of fresh rotation
- Every 5th position if session > 10 minutes
- Never in exclusion list (override)
```

## 5. Performance Optimization

### Prefetch Strategy
```
Current Position: Index N
─────────────────────────
Prefetch Queue:
├─ Index N+1 (Primary)
├─ Index N+2 (Secondary)
└─ Index N+10 (Prepare next loop)

Buffer States:
├─ VIDEO_LOADED: Ready to play
├─ VIDEO_BUFFERING: Loading...
└─ VIDEO_ERROR: Failed, skip
```

### Memory Management
```typescript
const PREFETCH_CONFIG = {
  maxBufferSize: 2,          // Only prefetch 2 ahead
  preloadDistance: 1000,      // Start preload 1000px before
  garbageCollectAfter: 30000, // Clear unused after 30s
  maxConcurrent: 3,          // Max concurrent loads
};
```

### Aspect Ratio Handling
```typescript
const THEME_ASPECT_RATIOS: Record<SiteTheme, number> = {
  'midnight-purple': 16/9,
  'civitas-reserve': 4/3,
  'vextor-grid': 9/16,
  'banner-bedlam': 21/9,
  // ... 14 site themes
};

function getVideoContainerStyle(theme: SiteTheme) {
  const ratio = THEME_ASPECT_RATIOS[theme];
  return {
    aspectRatio: ratio,
    maxHeight: '100vh',
    objectFit: 'contain',
  };
}
```

## 6. Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User      │────▶│   Gesture   │────▶│  Rotation  │
│   Input     │     │   Handler   │     │   Engine   │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                     ┌─────────────────────────┼─────────────────────────┐
                     │                         │                         │
                     ▼                         ▼                         ▼
              ┌─────────────┐          ┌─────────────┐          ┌─────────────┐
              │   Prefetch  │          │  Preference │          │  Tier D     │
              │   Manager   │          │   Overlay  │          │  Effects    │
              └─────────────┘          └─────────────┘          └─────────────┘
                     │                         │                         │
                     └─────────────────────────┬─────────────────────────┘
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │   Video     │
                                        │   Player    │
                                        └─────────────┘
```

## File Structure

```
GlobalAssets/LocalFeatures/novusferre/
├── InfiniteStageFlow/
│   ├── index.ts                    # Main exports
│   ├── InfiniteStageFlow.ts       # Core engine (rotation, gestures)
│   ├── GestureDetector.ts         # Touch/mouse handling
│   ├── RotationEngine.ts          # 10-step logic
│   ├── PreferenceOverlay.tsx     # Thumbs up/down UI
│   ├── PrefetchManager.ts        # Video preloading
│   ├── TierDArrival.ts           # Celebrity effects
│   ├── CleanViewToggle.tsx       # Chat/UI toggle
│   └── infiniteStageTypes.ts     # Type definitions
```

## Implementation Priority

1. **Phase 1** - Core Infrastructure
   - GestureDetector.ts (Touch/Mouse handlers)
   - infiniteStageTypes.ts (Type definitions)
   - RotationEngine.ts (10-step logic)

2. **Phase 2** - UI Components
   - PreferenceOverlay.tsx (5-second timer)
   - CleanViewToggle.tsx (Chat toggle)
   - VideoContainer.tsx (Aspect ratio)

3. **Phase 3** - Intelligence
   - PrefetchManager.ts (Performance)
   - TierDArrival.ts (Celebrity effects)

4. **Phase 4** - Integration
   - InfiniteStageFlow.ts (Orchestrator)
   - NovusferreStage.ts (Connect to live stage)
