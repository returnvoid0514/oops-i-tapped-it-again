# Rhythm Game Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     LENS STUDIO SCENE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐         ┌──────────────┐                     │
│  │   Camera     │         │ AudioComponent│                     │
│  │              │◄────────┤              │                     │
│  └──────────────┘         │  🎵 Music    │                     │
│                           └───────┬──────┘                      │
│                                   │                             │
│                           ┌───────▼──────┐                      │
│                           │  Conductor   │                      │
│                           │              │                      │
│                           │ • currentBeat│                      │
│                           │ • BPM        │                      │
│                           │ • offset     │                      │
│                           └───┬──────┬───┘                      │
│                               │      │                          │
│                ┌──────────────┘      └────────────┐             │
│                │                                  │             │
│        ┌───────▼────────┐                ┌───────▼──────┐      │
│        │  NoteSpawner   │                │HitZoneManager│      │
│        │                │                │              │      │
│        │ • pool[]       │◄───Reference───┤ • onTouch()  │      │
│        │ • spawnNote()  │                │ • checkHit() │      │
│        └────────┬───────┘                └──────┬───────┘      │
│                 │                               │              │
│                 │                               │              │
│        ┌────────▼─────────┐            ┌────────▼────────┐    │
│        │   Note Pool      │            │   Hit Lines     │    │
│        │  (30 instances)  │            │                 │    │
│        │                  │            │ • Left          │    │
│        │  🔴 🔴 🔴 🔴    │            │ • Center        │    │
│        │  🔴 🔴 🔴 🔴    │            │ • Right         │    │
│        └──────────────────┘            └─────────────────┘    │
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
  └──► HitZoneManager.onAwake()
         │
         └─► Set up touch event listener
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
  └──► Note.onUpdate() × N active notes
         │
         └─► Calculate position based on beat:
               beatDiff = targetBeat - currentBeat
               yPos = beatDiff × speed

               IF (yPos < -20) THEN disable note
```

### 3. Touch Input Flow

```
TOUCH EVENT
  │
  └──► HitZoneManager.onTouch(eventData)
         │
         ├─► Get touch position (x, y)
         │
         ├─► Determine lane from X position:
         │     IF (x < 0.33) → Lane 0 (Left)
         │     ELSE IF (x < 0.66) → Lane 1 (Center)
         │     ELSE → Lane 2 (Right)
         │
         ├─► Find active notes in lane:
         │     FOR each note in pool:
         │       IF note.enabled AND
         │          note.x ≈ laneX AND
         │          |note.y| < 30
         │       THEN add to candidates
         │
         ├─► Check timing for each candidate:
         │     error = |currentBeat - note.targetBeat|
         │
         │     Find note with smallest error < hitWindow
         │
         └─► Grade the hit:
               IF error < 0.05 → "Perfect!"
               ELSE IF error < 0.1 → "Great!"
               ELSE IF error < 0.15 → "Good"
               ELSE IF error < 0.25 → "OK"
               ELSE → "Miss"

               Disable hit note
               Flash hit line
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
- Lane 0 → X = -8 (Left)
- Lane 1 → X = 0 (Center)
- Lane 2 → X = 8 (Right)

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

### HitZoneManager (Input Handler)
**File**: [HitZoneManager.ts](Assets/Scripts/HitZoneManager.ts)

**Responsibilities**:
- Listen for touch input
- Determine touched lane
- Find notes near hit line
- Check timing accuracy
- Provide feedback

**Key Properties**:
- `hitWindow` (number) - Maximum error for valid hit (0.25 beats)
- `lanePositions` (number[]) - X coordinates of lanes
- `camera` (Camera) - For touch position conversion

**Lane Detection Algorithm**:
```typescript
screenX = touchPosition.x // Normalized 0-1

IF (screenX < 0.33) → Lane 0
ELSE IF (screenX < 0.66) → Lane 1
ELSE → Lane 2
```

**Hit Detection Algorithm**:
```
1. Get all active notes in touched lane
2. For each note, calculate timing error:
   error = |currentBeat - note.targetBeat|
3. Find note with minimum error
4. If error < hitWindow:
   - Grade the hit (Perfect/Great/Good/OK)
   - Disable the note
   - Flash hit line
5. Else:
   - Show miss message
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

### Hit Window

Default hit window: **0.25 beats**

At 120 BPM:
- 0.25 beats = 0.125 seconds = 125ms

Quality ranges:
```
Perfect: 0.00 - 0.05 beats (0-25ms)
Great:   0.05 - 0.10 beats (25-50ms)
Good:    0.10 - 0.15 beats (50-75ms)
OK:      0.15 - 0.25 beats (75-125ms)
Miss:    > 0.25 beats (>125ms)
```

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
           │    🔴 🔴 🔴
           │      ↓  ↓  ↓
           │
           │    🔴 🔴 🔴
           │      ↓  ↓  ↓
           │
Y = 0 ─────┼─────────────── Hit Line
           │   📏 📏 📏
           │
           ↓
      Y = -20 (Destroy)

X:  -8     0     +8
   Left  Center Right
```

### Screen Space (Touch)

```
(0, 0)                    (1, 0)
  ┌───────────────────────┐
  │                       │
  │   Touch coordinates   │
  │   Normalized 0-1      │
  │                       │
  └───────────────────────┘
(0, 1)                    (1, 1)

Lane division:
0.0 - 0.33: Left lane
0.33 - 0.66: Center lane
0.66 - 1.0: Right lane
```

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

## Extension Points

### Easy to Add:

1. **Score System**:
   - Hook into `HitZoneManager.hitNote()`
   - Track points, combo, accuracy

2. **Combo System**:
   - Increment on successful hit
   - Reset on miss
   - Apply multiplier

3. **Visual Effects**:
   - Particle systems on hit
   - Trail effects on notes
   - Screen flash on perfect

4. **Multiple Difficulties**:
   - Adjust `hitWindow` value
   - Smaller window = harder
   - Larger window = easier

5. **Long Notes**:
   - Add `isLong` property to SongData
   - Hold detection in HitZoneManager
   - Visual tail on note

---

## File Dependencies Graph

```
TestSongData.ts
      │
      └──► NoteSpawner.ts ──┐
                │           │
                └──► Note.ts│
                            │
Conductor.ts ───────────────┤
      │                     │
      └──────────────► HitZoneManager.ts
                            │
HitLineFeedback.ts ─────────┘
```

**No circular dependencies** ✅
**Clear separation of concerns** ✅
**Easy to test and extend** ✅

---

This architecture provides a solid foundation for your rhythm game and is easily extensible for future features!
