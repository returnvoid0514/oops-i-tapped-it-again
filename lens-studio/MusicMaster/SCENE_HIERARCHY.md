# Lens Studio Scene Hierarchy Reference

This is the recommended scene structure for your rhythm game.

```
📁 Scene
│
├── 📷 Camera [Orthographic]
│   └── 🎵 AudioComponent (attached)
│       └── Script: Conductor.ts
│
├── 🎮 GameLogic (or GameManager)
│   ├── Script: NoteSpawner.ts
│   │   ├── References:
│   │   │   ├── conductor → Conductor
│   │   │   ├── notePrefab → NotePrefab (from Resources)
│   │   │   └── songDataAsset → (optional)
│   │   └── Settings:
│   │       ├── infiniteMode: false
│   │       ├── spawnInterval: 1.0
│   │       └── pool: SceneObject[] (public, auto-managed)
│   │
│   └── Script: HitZoneManager.ts
│       ├── References:
│       │   ├── conductor → Conductor
│       │   ├── noteSpawnerObject → GameLogic (SAME object, NOT prefab!)
│       │   ├── hitLineLeft → HitLine_Left
│       │   ├── hitLineCenter → HitLine_Center
│       │   ├── hitLineRight → HitLine_Right
│       │   └── camera → Camera
│       └── Settings:
│           ├── hitWindow: 0.8
│           └── lanePositions: [-8.0, 0.0, 8.0]
│
├── 🖼️ Canvas [Screen Image]
│   │
│   ├── 📏 HitLine_Left [Image]
│   │   ├── Position: (-8, 0, 0)
│   │   ├── Size: (6, 1)
│   │   └── Script: HitLineFeedback.ts
│   │
│   ├── 📏 HitLine_Center [Image]
│   │   ├── Position: (0, 0, 0)
│   │   ├── Size: (6, 1)
│   │   └── Script: HitLineFeedback.ts
│   │
│   ├── 📏 HitLine_Right [Image]
│   │   ├── Position: (8, 0, 0)
│   │   ├── Size: (6, 1)
│   │   └── Script: HitLineFeedback.ts
│   │
│   └── 📊 ScoreText [Text] (optional)
│       └── Position: (0, 40, 0)
│
└── 📦 Resources
    └── 🎯 NotePrefab [Prefab]
        ├── Component: Sprite or Image
        ├── Script: Note.ts
        └── Settings:
            └── speed: 15.0
```

---

## Component Connections Map

```
┌─────────────┐
│  Conductor  │ ← Audio playback & beat tracking
└──────┬──────┘
       │
       ├──→ NoteSpawner (knows when to spawn notes)
       ├──→ Note instances (for position calculation)
       └──→ HitZoneManager (for hit detection)

┌──────────────┐
│ NoteSpawner  │ ← Creates and manages note pool
└──────┬───────┘
       │
       └──→ HitZoneManager (provides pool reference)

┌──────────────────┐
│ HitZoneManager   │ ← Touch input & hit detection
└──────┬───────────┘
       │
       ├──→ HitLine objects (for visual feedback)
       └──→ NoteSpawner.pool (to check notes)
```

---

## Script Dependencies

### NoteSpawner.ts
- **Imports**: `Conductor`, `Note`, `SongData`
- **Needs**: Conductor reference, NotePrefab asset
- **Provides**: Public `pool` array of notes (accessible by HitZoneManager)
- **Modes**:
  - Infinite Mode: Randomly spawns notes at spawnInterval
  - Chart Mode: Spawns notes from TestSongData.ts

### Note.ts
- **Imports**: None
- **Needs**: `conductor` reference (set by NoteSpawner)
- **Behavior**: Moves based on beat difference

### Conductor.ts
- **Imports**: None
- **Needs**: AudioComponent reference
- **Provides**: `currentBeat`, `getBeatError()`

### HitZoneManager.ts
- **Imports**: `Conductor`
- **Needs**:
  - Conductor reference
  - NoteSpawner object reference (MUST be scene object with NoteSpawner script, NOT prefab)
  - 3 HitLine object references
  - Camera reference
- **Behavior**:
  - Handles TouchStartEvent for touch input
  - Uses time-based hit detection (beat error, not visual position)
  - Accesses NoteSpawner's public pool to check notes
  - Determines hit quality: Perfect/Great/Good/OK/Miss

### HitLineFeedback.ts
- **Imports**: None
- **Needs**: Image component on same object
- **Behavior**: Visual flash on hit

---

## Setup Checklist

### ✅ In Lens Studio Objects Panel:

- [ ] Camera with Orthographic projection
- [ ] AudioComponent on Camera
- [ ] GameManager empty object
- [ ] Canvas Screen Image
- [ ] 3 Hit Line images under Canvas
- [ ] NotePrefab in Resources

### ✅ Script Assignments:

- [ ] Conductor.ts on AudioComponent object
- [ ] NoteSpawner.ts on GameManager
- [ ] HitZoneManager.ts on GameManager
- [ ] Note.ts on NotePrefab
- [ ] HitLineFeedback.ts on each HitLine

### ✅ Inspector References:

#### Conductor:
- [ ] audioTrack → AudioComponent
- [ ] bpm → 120 (or your song's BPM)
- [ ] offset → 0.0

#### NoteSpawner:
- [ ] conductor → Conductor object
- [ ] notePrefab → NotePrefab from Resources
- [ ] infiniteMode → false (or true for testing)
- [ ] spawnInterval → 1.0

#### HitZoneManager:
- [ ] conductor → Conductor object
- [ ] noteSpawnerObject → GameLogic object (SAME object with NoteSpawner script, NOT prefab!)
- [ ] hitLineLeft → HitLine_Left
- [ ] hitLineCenter → HitLine_Center
- [ ] hitLineRight → HitLine_Right
- [ ] camera → Camera (must be Orthographic)
- [ ] hitWindow → 0.8 (adjust for difficulty)

#### Each HitLine:
- [ ] Image component with material
- [ ] Color: White (1, 1, 1, 0.5)
- [ ] Size: 6 x 1

### ✅ NotePrefab Setup:

- [ ] Has visual component (Sprite/Image)
- [ ] Has Note.ts script
- [ ] speed: 15.0
- [ ] Is saved as Prefab in Resources

---

## Lane Coordinate System

```
        Left Lane        Center Lane      Right Lane
           (0)              (1)              (2)
           │                │                │
     X = -8.0           X = 0.0          X = +8.0
           │                │                │
           ▼                ▼                ▼
    ┌─────────┐      ┌─────────┐      ┌─────────┐
    │HitLine_L│      │HitLine_C│      │HitLine_R│  ← Y = 0
    └─────────┘      └─────────┘      └─────────┘
```

**Note Movement:**
- Spawns at Y = 100
- Moves down to Y = 0 (hit line)
- Disabled at Y = -20

---

## Event Flow

### 1. Game Start:
```
Conductor.onAwake()
  → Starts audio playback
  → Begins tracking beats

NoteSpawner.onAwake()
  → Initializes note pool
  → Loads song data

HitZoneManager.onAwake()
  → Sets up touch listener
```

### 2. Every Frame:
```
Conductor.onUpdate()
  → Updates currentBeat based on audio position

NoteSpawner.onUpdate()
  → Checks if it's time to spawn next note
  → Spawns note from pool if needed

Note.onUpdate() (for each active note)
  → Calculates position based on beat difference
  → Moves note down screen
  → Disables if off screen
```

### 3. On Touch:
```
HitZoneManager.onTouch()
  → Determines which lane was touched (screen divided into thirds)
  → Accesses NoteSpawner.pool to find active notes
  → Filters notes by lane position (X coordinate)
  → Filters by time window (beat error < 2.0)
  → Finds closest note and checks if within hitWindow
  → If hit: disables note, flashes hit line, prints quality
  → If miss: prints "❌ Miss"
```

---

## Quick Reference Values

### Timing:
- **Hit Window**: 0.8 beats (adjustable - lower = harder)
- **Perfect**: < 0.15 beats error
- **Great**: < 0.3 beats error
- **Good**: < 0.5 beats error
- **OK**: < hitWindow
- **Note**: System uses time-based detection, not visual position

### Positions:
- **Note Spawn Y**: 100
- **Hit Line Y**: 0
- **Note Destroy Y**: -20
- **Lane Spacing**: 8 units

### Performance:
- **Pool Size**: 30 notes
- **Spawn Window**: 8 beats ahead
- **Note Speed**: 15 units per beat

---

Use this reference when setting up your scene in Lens Studio!
