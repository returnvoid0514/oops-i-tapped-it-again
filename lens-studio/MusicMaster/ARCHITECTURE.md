# Rhythm Game Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     LENS STUDIO SCENE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐         ┌──────────────┐                     │
│  │   Camera     │         │ AudioComponent│                     │
│  │  Layer 1     │◄────────┤              │                     │
│  │ renderLayer: │         │  🎵 Music    │                     │
│  │  1835007     │         └───────┬──────┘                      │
│  └──────────────┘                 │                             │
│         │                 ┌───────▼──────┐                      │
│         │                 │  Conductor   │                      │
│         │                 │              │                      │
│         │                 │ • currentBeat│                      │
│         │                 │ • BPM        │                      │
│         │                 │ • offset     │                      │
│         │                 └───┬──────┬───┘                      │
│         │                     │      │                          │
│         │      ┌──────────────┘      └────────────┐             │
│         │      │                                  │             │
│         │ ┌────▼──────────┐             ┌────────▼──────┐      │
│         │ │  NoteSpawner  │             │HitZoneManager │      │
│         │ │               │             │               │      │
│         │ │ • pool[30]    │◄─Reference──┤ • scoreStats  │      │
│         │ │ • spawnNote() │             │ • onTouch()   │      │
│         │ └───────┬───────┘             │ • hitNote()   │      │
│         │         │                     └───────┬───────┘      │
│         │         │                             │              │
│         │ ┌───────▼────────┐         ┌──────────▼───────┐     │
│         │ │   Note Pool    │         │   Hit Lines      │     │
│         │ │ (30 instances) │         │  (with feedback) │     │
│         │ │                │         │                  │     │
│         │ │  🔴 🔴 🔴     │         │ • HitLine_Left   │     │
│         │ │  🔴 🔴 🔴     │         │ • HitLine_Center │     │
│         │ │  🔴 🔴 🔴     │         │ • HitLine_Right  │     │
│         │ └────────────────┘         └──────────────────┘     │
│         │                                                      │
│         │ ┌────────────────────────────────────────┐           │
│         └►│          UI Layer (Layer 1)            │           │
│           │                                        │           │
│           │  ┌──────────────────────────────┐     │           │
│           │  │      ComboText               │     │           │
│           │  │  "🔥 50 COMBO! 🔥"           │     │           │
│           │  │  (ScreenTransform)           │     │           │
│           │  │  Top of screen               │     │           │
│           │  └──────────────────────────────┘     │           │
│           │                                        │           │
│           └────────────────────────────────────────┘           │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │            SongEndDetector                              │   │
│  │  • Monitors audio completion                           │   │
│  │  • Triggers final score display                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

### 1. Initialization Flow

```
START
  │
  ├──► Conductor.onAwake()
  │      │
  │      ├─► Start audio playback
  │      └─► Begin beat tracking
  │
  ├──► NoteSpawner.onAwake()
  │      │
  │      ├─► Initialize note pool (30 notes)
  │      ├─► Load song data (TestSongData.ts)
  │      └─► Queue notes for spawning
  │
  ├──► HitZoneManager.onAwake()
  │      │
  │      ├─► Set up touch event listener
  │      ├─► Initialize score tracking
  │      └─► Initialize combo display
  │
  └──► SongEndDetector.onAwake()
         │
         └─► Set up update event for end detection
```

### 2. Game Loop (Every Frame)

```
UPDATE EVENT
  │
  ├──► Conductor.onUpdate()
  │      │
  │      └─► Calculate currentBeat from audio position
  │            currentBeat = (audioPosition × BPM) / 60
  │
  ├──► NoteSpawner.onUpdate()
  │      │
  │      ├─► Check: Should spawn next note?
  │      │     IF (currentBeat + 8.0 > nextNoteBeat)
  │      │       THEN spawn note from pool
  │      │
  │      └─► Set note properties:
  │            • targetBeat
  │            • lane position (x)
  │            • initial position (y = 100)
  │
  ├──► Note.onUpdate() × N active notes
  │      │
  │      └─► Calculate position based on beat:
  │            beatDiff = targetBeat - currentBeat
  │            yPos = beatDiff × speed
  │
  │            IF (yPos < -20) THEN disable note
  │
  └──► SongEndDetector.onUpdate()
         │
         └─► Check if song has ended:
               IF (audio.isPlaying() == false)
                 THEN trigger final score display
```

### 3. Touch Input Flow

```
TOUCH EVENT
  │
  └──► HitZoneManager.onTouch(eventData)
         │
         ├─► Convert touch to world position via camera
         │
         ├─► Determine lane from X position:
         │     Find closest lane to touch X coordinate
         │     Lanes at: -15.0 (Left), 0.0 (Center), 15.0 (Right)
         │
         ├─► Find active notes in lane:
         │     FOR each note in pool:
         │       IF note.enabled AND
         │          note.x ≈ laneX AND
         │          note is near hitline
         │       THEN add to candidates
         │
         ├─► Calculate Y-distance from hitline:
         │     Get hitline Y position for the lane
         │     Calculate yDistance = |note.y - hitline.y|
         │
         │     Find note with smallest yDistance
         │
         └─► Grade the hit (Y-DISTANCE BASED):
               IF yDistance < 0.6 → "Perfect!" (+100pts)
                 - Increment combo
                 - Update combo display
                 - Flash hitline
                 - Disable note

               ELSE IF yDistance < 1.0 → "Great!" (+70pts)
                 - Increment combo
                 - Update combo display
                 - Flash hitline
                 - Disable note

               ELSE IF yDistance < 1.5 → "Good" (+40pts)
                 - Increment combo
                 - Update combo display
                 - Flash hitline
                 - Disable note

               ELSE → "Miss" (+0pts)
                 - Reset combo to 0
                 - Update combo display
                 - Don't disable note (let it pass)
```

---

## Component Responsibilities

### Conductor (Music Timing Engine)
**File**: [Conductor.ts](Assets/Scripts/Conductor.ts)

**Responsibilities**:
- Play background music
- Track current playback position
- Calculate current beat number
- Provide timing accuracy check (`getBeatError()`)

**Key Properties**:
- `bpm` (number) - Beats per minute of the song
- `offset` (number) - Audio sync adjustment
- `currentBeat` (number) - Current beat position
- `audioTrack` (AudioComponent) - Reference to audio player

**Algorithm**:
```typescript
currentSongPosition = audioTrack.position - offset
currentBeat = (currentSongPosition × bpm) / 60
```

---

### NoteSpawner (Note Factory)
**File**: [NoteSpawner.ts](Assets/Scripts/NoteSpawner.ts)

**Responsibilities**:
- Create pool of reusable note objects
- Spawn notes at correct timing
- Position notes in correct lanes
- Load song data

**Key Properties**:
- `pool` (SceneObject[]) - Reusable note instances
- `notesQueue` (any[]) - Upcoming notes to spawn
- `conductor` (Conductor) - Reference for timing

**Spawning Algorithm**:
```typescript
spawnWindow = 8.0 beats // Look ahead time

IF (currentBeat + spawnWindow > nextNote.beat) THEN
  note = getDisabledNoteFromPool()
  note.targetBeat = nextNote.beat
  note.x = (nextNote.lane - 1) × 8.0
  note.y = 100
  note.enabled = true
```

**Lane Mapping**:
- Lane -1 → X = -15.0 (Left)
- Lane 0 → X = 0.0 (Center)
- Lane 1 → X = 15.0 (Right)

**Note**: Lane index is mapped to position via: `xPos = lane × 15.0`

---

### Note (Falling Object)
**File**: [Note.ts](Assets/Scripts/Note.ts)

**Responsibilities**:
- Move down based on music timing
- Maintain sync with beat
- Self-disable when off-screen

**Key Properties**:
- `targetBeat` (number) - When this note should be hit
- `conductor` (Conductor) - Reference for current beat
- `speed` (number) - Units per beat (default: 15)

**Movement Algorithm**:
```typescript
beatDiff = targetBeat - conductor.currentBeat
yPos = beatDiff × speed

// Example at 120 BPM:
// 2 beats away → y = 30
// 1 beat away → y = 15
// On beat → y = 0
// 1 beat past → y = -15
```

**Why this works**:
- When note spawns 8 beats early: y = 8 × 15 = 120
- As music plays, beatDiff decreases
- When beatDiff = 0, note is at y = 0 (hit line)
- Independent of framerate or lag

---

### HitZoneManager (Input Handler & Scoring System)
**File**: [HitZoneManager.ts](Assets/Scripts/HitZoneManager.ts)

**Responsibilities**:
- Listen for touch input
- Determine touched lane
- Find notes near hit line
- Check visual accuracy (Y-distance based)
- Track score and combo
- Update combo UI display
- Provide hit feedback

**Key Properties**:
- `lanePositions` (number[]) - X coordinates of lanes [-15.0, 0.0, 15.0]
- `camera` (Camera) - For touch position conversion
- `comboText` (Text) - UI text component for combo display
- `scoreStats` (object) - Tracks perfect, great, good, miss, totalScore, currentCombo, maxCombo

**Score Values**:
```typescript
Perfect: 100 points (Y-distance < 0.6)
Great:   70 points  (Y-distance < 1.0)
Good:    40 points  (Y-distance < 1.5)
Miss:    0 points   (Y-distance >= 1.5)
```

**Lane Detection Algorithm**:
```typescript
// Convert touch to world position via camera
worldPos = camera.screenSpaceToWorldSpace(touchPos)

// Find closest lane by X distance
closestLane = lanePositions.reduce((closest, laneX) => {
  return Math.abs(worldPos.x - laneX) < Math.abs(worldPos.x - closest)
    ? laneX : closest
})
```

**Hit Detection Algorithm** (Y-Distance Based):
```
1. Get all active notes in touched lane
2. For each note, calculate Y-distance from hitline:
   yDistance = |note.y - hitline.y|
3. Find note with minimum yDistance
4. Grade based on Y-distance:
   - If yDistance < 0.6: Perfect (+100pts, increment combo)
   - Else if yDistance < 1.0: Great (+70pts, increment combo)
   - Else if yDistance < 1.5: Good (+40pts, increment combo)
   - Else: Miss (+0pts, reset combo)
5. Update combo display on screen
6. Flash hit line on successful hits
7. Disable note only on successful hits (not on Miss)
```

**Combo Display System**:
```typescript
- 0 combo: "" (empty)
- 1-9 combo: "X COMBO"
- 10-49 combo: "X COMBO!"
- 50-99 combo: "🔥 X COMBO! 🔥"
- 100+ combo: "⭐ X COMBO!! ⭐"

Milestone celebrations at: 10, 50, 100
```

**Final Score Display** (triggered by SongEndDetector):
```
Shows:
- Total Score (with percentage of max possible)
- Accuracy percentage
- Max Combo achieved
- Count of Perfect/Great/Good/Miss hits
- Total notes and max possible score
```

---

### HitLineFeedback (Visual Effect)
**File**: [HitLineFeedback.ts](Assets/Scripts/HitLineFeedback.ts)

**Responsibilities**:
- Visual feedback when note is hit
- Flash hit line briefly
- Return to normal state

**Key Properties**:
- `normalColor` (vec4) - Default color (white, semi-transparent)
- `hitColor` (vec4) - Flash color (green, opaque)
- `flashDuration` (number) - How long to flash (0.1s)

**Note**: May encounter errors if material/shader graph is invalid. The game will work without this effect.

---

### SongEndDetector (Game Completion Handler)
**File**: [SongEndDetector.ts](Assets/Scripts/SongEndDetector.ts)

**Responsibilities**:
- Monitor audio playback status
- Detect when song has finished playing
- Trigger final score display
- Call HitZoneManager's `showFinalScore()` method

**Key Properties**:
- `audioComponent` (AudioComponent) - Reference to music player
- `hitZoneManager` (HitZoneManager) - Reference to scoring system
- `songDuration` (number) - Optional duration parameter

**Detection Logic**:
```typescript
onUpdate() {
  if (audio previously playing AND now stopped) {
    hitZoneManager.showFinalScore()
    // Display formatted score report in console
  }
}
```

---

## Timing Mathematics

### Beat Calculation

At 120 BPM:
- 1 minute = 120 beats
- 1 second = 2 beats
- 1 beat = 0.5 seconds

Formula:
```
beat = (time_in_seconds × BPM) / 60

Example:
At 6 seconds, 120 BPM:
beat = (6 × 120) / 60 = 12
```

### Hit Accuracy (Y-Distance Based)

**Current Implementation**: Visual accuracy based on Y-distance from hitline

Quality ranges (in world units):
```
Perfect: Y-distance < 0.6 units (+100 points)
Great:   Y-distance < 1.0 units (+70 points)
Good:    Y-distance < 1.5 units (+40 points)
Miss:    Y-distance >= 1.5 units (+0 points)
```

**Why Y-distance instead of beat timing?**
- More intuitive for players (visual feedback)
- Consistent regardless of BPM changes
- Easier to understand "hit it when it crosses the line"
- Still maintains rhythm accuracy since notes move with music

### Note Spawn Timing

```
spawnWindow = 8.0 beats

At 120 BPM:
8 beats = 4 seconds

Notes appear 4 seconds before they should be hit.
```

### Note Speed Calculation

```
speed = 15.0 units per beat

When 8 beats away:
y = 8 × 15 = 120 (spawn position)

When 0 beats away:
y = 0 × 15 = 0 (hit line)

When -1.33 beats away:
y = -1.33 × 15 = -20 (disabled)
```

---

## Object Pool Pattern

### Why Object Pooling?

**Without pooling**:
```typescript
// BAD: Creates new objects constantly
function spawnNote() {
  const note = prefab.instantiate()  // Expensive!
  // Later...
  note.destroy()  // Expensive!
}
// Causes lag, garbage collection, frame drops
```

**With pooling** (our implementation):
```typescript
// GOOD: Reuse objects
function spawnNote() {
  const note = pool.find(n => !n.enabled)  // Fast!
  note.enabled = true
  // Later...
  note.enabled = false  // Fast!
}
// Smooth performance, no garbage collection
```

### Pool Lifecycle

```
INITIALIZATION:
  Create 30 note instances
  Set all to disabled
  Store in pool[]

SPAWNING:
  Find first disabled note
  Set properties (targetBeat, position)
  Enable note

CLEANUP:
  When note y < -20
  Disable note
  Returns to pool automatically

REUSE:
  Same note can be spawned again
  No memory allocation
  Constant performance
```

---

## Coordinate System

### World Space Coordinates

```
        Y = 100 (Spawn)
           ↑
           │       🔴   🔴   🔴
           │        ↓    ↓    ↓
           │
           │       🔴   🔴   🔴
           │        ↓    ↓    ↓
           │
Y = -10 ───┼──────────────────── Hit Lines (3 separate hitlines)
           │      📏   📏   📏
           │
           ↓
      Y = -20 (Destroy)

X:     -15.0    0.0   +15.0
        Left  Center  Right
```

**Note**: The hitlines are positioned at Y = -10 with fullscreen width (scale 15x12).

### Screen Space (Touch) → World Space Conversion

```
Touch Input (Screen Space)
     ↓
camera.screenSpaceToWorldSpace()
     ↓
World Position (X, Y, Z)
     ↓
Find Closest Lane by X-distance
     ↓
Lane Selection: -15.0, 0.0, or 15.0
```

**Lane Detection**: Uses distance-based calculation to find closest lane, not screen division.

---

## Performance Considerations

### Optimizations Implemented:

1. **Object Pooling**:
   - No runtime instantiation
   - No garbage collection
   - Constant memory usage

2. **Early Termination**:
   - Notes disabled when off-screen
   - Touch only checks active notes
   - Only checks notes near hit line

3. **Efficient Queries**:
   - `pool.find()` stops at first match
   - Lane filtering before timing check
   - Distance check before beat check

### Performance Targets:

- **Frame Rate**: 60 FPS on mobile
- **Max Active Notes**: 10-15 simultaneous
- **Pool Size**: 30 (enough for dense patterns)
- **Touch Response**: < 16ms (1 frame)

---

## Current Features ✅

### Implemented:

1. **✅ Score System**:
   - Full point tracking (Perfect: 100, Great: 70, Good: 40, Miss: 0)
   - Total score calculation
   - Score percentage display
   - Accuracy tracking

2. **✅ Combo System**:
   - Increments on successful hits (Perfect/Great/Good)
   - Resets on miss
   - Max combo tracking
   - Visual combo display on screen (ComboText UI)
   - Milestone celebrations at 10, 50, 100

3. **✅ Visual Feedback**:
   - Hit line flash effect on successful hits
   - Combo text updates in real-time
   - Top-of-screen combo display

4. **✅ End-of-Song Summary**:
   - Final score display
   - Breakdown of Perfect/Great/Good/Miss counts
   - Max combo achieved
   - Accuracy percentage
   - Score percentage

5. **✅ Y-Distance Hit Detection**:
   - Visual-based accuracy (intuitive for players)
   - Consistent across different BPMs
   - Clear thresholds (0.6, 1.0, 1.5 units)

6. **✅ UI Layer System**:
   - Proper layer configuration (Layer 1)
   - Camera render layers set correctly
   - ScreenTransform for UI positioning

## Extension Points

### Easy to Add:

1. **Multiple Difficulties**:
   - Adjust Y-distance thresholds
   - Smaller ranges = harder (e.g., Perfect < 0.3)
   - Larger ranges = easier (e.g., Perfect < 1.0)

2. **Long Notes / Hold Notes**:
   - Add `isLong` and `duration` properties to SongData
   - Implement TouchEnd detection in HitZoneManager
   - Visual tail/trail on note
   - Continuous scoring while held

3. **Particle Effects**:
   - Particle systems on Perfect hits
   - Trail effects on falling notes
   - Screen flash/shake on combo milestones

4. **Custom Note Visuals**:
   - Different note prefabs for different difficulties
   - Color-coded notes per lane
   - Custom 2D images for notes (see note prefab setup guide)

5. **Multiplayer/Leaderboard**:
   - Save scores to persistent storage
   - Compare with friends
   - Online leaderboards

---

## File Dependencies Graph

```
TestSongData.ts
      │
      └──► NoteSpawner.ts ──────┐
                │               │
                └──► Note.ts    │
                                │
Conductor.ts ───────────────────┤
      │                         │
      │                         │
      └──────────────► HitZoneManager.ts ◄──── ComboText (UI)
                            │         │
                            │         │
HitLineFeedback.ts ─────────┘         │
                                      │
SongEndDetector.ts ───────────────────┘
                │
                └──► AudioComponent
```

**Component Summary**:
- **Conductor.ts**: Beat timing engine (references AudioComponent)
- **NoteSpawner.ts**: Object pool manager (references Conductor, Note prefab)
- **Note.ts**: Individual note movement (references Conductor)
- **HitZoneManager.ts**: Input, scoring, combo (references Conductor, NoteSpawner, ComboText)
- **HitLineFeedback.ts**: Visual effects (referenced by HitLines)
- **SongEndDetector.ts**: End detection (references HitZoneManager, AudioComponent)
- **UIDebugger.ts**: Development diagnostic tool (standalone)
- **TestSongData.ts**: Static chart data (referenced by NoteSpawner)

**No circular dependencies** ✅
**Clear separation of concerns** ✅
**Easy to test and extend** ✅

---

## Layer Configuration

### Camera Setup
- **Layer**: 1
- **renderLayer**: 1835007 (bitwise mask)
- **Purpose**: Renders both game objects and UI

### Game Objects (Layer 1)
- HitLine_Left
- HitLine_Center
- HitLine_Right
- Notes (all instances from pool)
- NoteSpawner
- Conductor
- SongEndDetector

### UI Objects (Layer 1)
- **ComboText**: Screen-space text at top of screen
  - Uses ScreenTransform component
  - Anchors: bottom=0.7, top=1.0 (top 30% of screen)
  - Scale: 5x5x1
  - Font size: 50
  - Color: Yellow (1, 1, 0, 1)

---

This architecture provides a complete, feature-rich rhythm game with scoring, combos, and visual feedback!
