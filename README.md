# Oops I Tapped It Again

A rhythm beat game built for the **[Play Everywhere: Build with Snap Games Lensathon](https://snapgames.devpost.com/)**.

![Lens Studio](https://img.shields.io/badge/Lens%20Studio-5.0+-yellow)
![Platform](https://img.shields.io/badge/Platform-Snapchat-yellow)
![Category](https://img.shields.io/badge/Category-2D%20Games-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Hackathon Submission

| Field | Value |
|-------|-------|
| **Category** | 2D Games (Leaderboard, Quick Play) |
| **Deadline** | February 2, 2026 @ 11:45pm PST |
| **Lens Link** | *[To be added after publishing]* |
| **Demo Video** | *[Included in Lens Studio publish]* |

---

## Game Overview

**Oops I Tapped It Again** is a rhythm-based mobile game where players tap falling notes in sync with the music. Test your timing, build combos, and compete with friends on the global leaderboard!

### Features

- 3-lane rhythm gameplay with falling notes
- Timing-based scoring system (Perfect, Great, Good, Miss)
- Combo multiplier for consecutive hits
- Global leaderboard with friend rankings (Leaderboard Component)
- Pre-generated beatmap synced to music
- Quick play sessions perfect for Snapchat

---

## How to Play

1. **Watch** - Notes fall from the top of the screen in 3 lanes (Left, Center, Right)
2. **Tap** - Hit the notes when they reach the hit zone at the bottom
3. **Score** - Better timing = higher score. Build combos for bonus points!
4. **Compete** - Submit your score to the leaderboard and challenge friends

---

## Technical Architecture

### Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    LENS STUDIO (CLIENT)                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Conductor  │  │ NoteSpawner │  │   HitZoneManager    │  │
│  │  (Timing)   │──│  (Notes)    │──│  (Input & Scoring)  │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│         │                │                    │              │
│         ▼                ▼                    ▼              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    SongLibrary.ts                        ││
│  │              (Pre-generated Beatmap Data)                ││
│  └─────────────────────────────────────────────────────────┘│
│                            │                                 │
│                            ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              Leaderboard Component (Built-in)            ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 OFFLINE TOOLS (Python)                       │
├─────────────────────────────────────────────────────────────┤
│  generate_beatmap.py                                         │
│  ├── Audio Analysis (librosa)                                │
│  ├── Beat Detection & Tempo Extraction                       │
│  ├── Lane Assignment (spectral centroid analysis)            │
│  └── Output: SongLibrary.ts                                  │
└─────────────────────────────────────────────────────────────┘
```

### Core Components

| Component | File | Description |
|-----------|------|-------------|
| **Conductor** | `Conductor.ts` | Tracks song position and beat timing |
| **NoteSpawner** | `NoteSpawner.ts` | Spawns notes based on beatmap data |
| **Note** | `Note.ts` | Individual note behavior and movement |
| **HitZoneManager** | `HitZoneManager.ts` | Handles input detection and scoring |
| **SongLibrary** | `SongLibrary.ts` | Pre-generated beatmap data |
| **SongEndDetector** | `SongEndDetector.ts` | Detects song end and triggers leaderboard |

### Beatmap Generation

Beatmaps are generated offline using Python + librosa:

```bash
cd tools
python generate_beatmap.py "song.mp3" --typescript --difficulty medium
```

The generator:
1. Analyzes audio using librosa (tempo, beats, onsets)
2. Assigns lanes based on spectral centroid (sound frequency)
3. Filters notes by difficulty (spacing)
4. Outputs TypeScript for Lens Studio

---

## Project Structure

```
oops-i-tapped-it-again/
├── lens-studio/                 # Lens Studio project
│   └── OopsITappedItAgain/
│       └── Assets/
│           ├── Scripts/
│           │   ├── Conductor.ts         # Beat timing
│           │   ├── NoteSpawner.ts       # Note spawning
│           │   ├── Note.ts              # Note behavior
│           │   ├── HitZoneManager.ts    # Input & scoring
│           │   ├── SongLibrary.ts       # Beatmap data
│           │   ├── SongEndDetector.ts   # End detection
│           │   ├── InputManager.ts      # Touch input
│           │   └── HitLineFeedback.ts   # Visual feedback
│           └── Sample Song.mp3          # Game music
├── tools/                       # Beatmap generation
│   ├── generate_beatmap.py      # Main generator script
│   ├── requirements.txt         # Python dependencies
│   └── output.json              # Generated beatmap
├── assets/                      # Visual assets
├── doc/                         # Documentation
└── README.md
```

---

## Current Song Stats

| Property | Value |
|----------|-------|
| Song Name | Sample Song |
| Duration | 61.72 seconds |
| BPM | 95.7 |
| Total Notes | 79 |
| Difficulty | Medium |
| Lane Distribution | Left: 16, Center: 42, Right: 21 |

---

## Getting Started

### Prerequisites

- [Lens Studio 5.0+](https://ar.snap.com/lens-studio)
- Python 3.8+ (for beatmap generation)
- Snapchat account (for testing)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-repo/expedition.git
   cd expedition
   ```

2. **Open in Lens Studio**
   - Launch Lens Studio
   - Open `lens-studio/OopsITappedItAgain/OopsITappedItAgain.lsproj`

3. **Test the Lens**
   - Click "Preview" in Lens Studio
   - Or pair with Snapchat for device testing

### Generate New Beatmap (Optional)

```bash
cd tools
pip install -r requirements.txt
python generate_beatmap.py "../lens-studio/OopsITappedItAgain/Assets/Sample Song.mp3" \
    --typescript --difficulty medium --spacing 1.0
```

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Lens Studio** | Game development platform |
| **TypeScript** | Game logic |
| **Python** | Beatmap generation |
| **librosa** | Audio analysis |
| **Leaderboard Component** | Score tracking (built-in) |

---

## Lens Studio Features Used

- **Leaderboard Component** - Friend rankings and score submission
- **Audio Component** - Music playback
- **Touch Input** - Tap detection
- **Canvas + Orthographic Camera** - 2D rendering
- **Script Components** - Game logic (TypeScript)

---

## Judging Criteria Alignment

| Criteria | How We Address It |
|----------|-------------------|
| **Technological Implementation** | Custom beatmap generator with audio analysis (librosa), clean TypeScript architecture, proper use of Lens Studio components |
| **Design** | Intuitive 3-lane tap gameplay, visual feedback on hits, clean UI with score/combo display |
| **Fun** | Rhythm games are inherently engaging; leaderboard competition with friends adds replayability |
| **Quality of the Idea** | Combines music rhythm gameplay with Snapchat's social features; easy to share and compete |

---

## Resources

- [Lens Studio Documentation](https://developers.snap.com/lens-studio)
- [Leaderboard Component Guide](https://developers.snap.com/lens-studio/features/user-context/leaderboard)
- [Audio Component](https://developers.snap.com/lens-studio/features/audio/playing-audio)
- [Building Games for Snapchat](https://developers.snap.com/lens-studio/features/games)
- [Snap Games Lensathon](https://snapgames.devpost.com/)

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Built for the **[Play Everywhere: Build with Snap Games Lensathon](https://snapgames.devpost.com/)**
- Audio analysis powered by [librosa](https://librosa.org/)
- Game framework by [Lens Studio](https://ar.snap.com/lens-studio)
