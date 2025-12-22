# Backend Design Document

> **Owner: Dev 1**
>
> Last Updated: Weekend 1

---

## Table of Contents
1. [Overview](#overview)
2. [What Dev 1 Builds vs What's Built-in](#what-dev-1-builds-vs-whats-built-in)
3. [Core Features](#core-features)
4. [Database Schema](#database-schema)
5. [Storage Strategy](#storage-strategy)
6. [Deployment Architecture](#deployment-architecture)
7. [Song Sharing Flow](#song-sharing-flow)
8. [Technology Choices](#technology-choices)
9. [Timeline](#timeline)

---

## Overview

Backend services for the AI Music Beat Game. Handles:
- AI music generation
- Beat detection
- Song storage & retrieval
- Song sharing between users

**For API reference and usage, see [README.md](./README.md).**

### What Dev 1 Does NOT Build

| Feature | Why Not |
|---------|---------|
| Leaderboard | Built into Lens Studio (Leaderboard Component) |
| Score Storage | Handled by Snap's infrastructure |
| User Authentication | Handled by Snapchat |
| Friend Graph | Handled by Snapchat |
| PvP Sync | Handled by Sync Framework |
| Preset Songs | Bundled in Lens Studio (no API needed) |

---

## What Dev 1 Builds vs What's Built-in

```
┌─────────────────────────────────────────────────────────────────┐
│                         SNAPCHAT                                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │ Leaderboard │ │   Friends   │ │  PvP Sync   │               │
│  │  (scores)   │ │   (social)  │ │ (realtime)  │               │
│  └─────────────┘ └─────────────┘ └─────────────┘               │
│                         ▲                                        │
│                         │ Built-in                               │
└─────────────────────────┼───────────────────────────────────────┘
                          │
┌─────────────────────────┼───────────────────────────────────────┐
│                    LENS STUDIO                                   │
│                         │                                        │
│  ┌─────────────────────────────────────────┐                   │
│  │  Preset Songs (bundled audio + beatmaps) │                   │
│  └─────────────────────────────────────────┘                   │
│                         │                                        │
│                         ▼                                        │
│              Remote Service Module                               │
│                         │                                        │
└─────────────────────────┼───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DEV 1 BACKEND                                 │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                      API Layer (FastAPI)                  │  │
│  │  POST /generate    GET /song/:id    GET /songs            │  │
│  │  POST /detect-beats    GET /song/:id/audio                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                          │                                       │
│         ┌────────────────┼────────────────┐                     │
│         ▼                ▼                ▼                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐               │
│  │  MusicGen  │  │    Beat    │  │  Storage   │               │
│  │  Service   │  │  Detection │  │  Service   │               │
│  └────────────┘  └────────────┘  └────────────┘               │
│         │                               │                        │
│         ▼                               ▼                        │
│  ┌────────────┐                 ┌────────────┐                 │
│  │ Replicate  │                 │  Database  │                 │
│  │    API     │                 │ (Firestore)│                 │
│  └────────────┘                 └────────────┘                 │
│                                         │                        │
│                                         ▼                        │
│                                 ┌────────────┐                  │
│                                 │   Cloud    │                  │
│                                 │  Storage   │                  │
│                                 └────────────┘                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Core Features

### 1. AI Music Generation
- User provides: prompt (genre, mood, style)
- Backend calls: Replicate (MusicGen)
- Returns: audio file + beat map
- Mock mode available for local testing

### 2. Beat Detection
- Input: audio bytes or file path
- Process: librosa onset detection + beat tracking
- Two beat types:
  - Type 1: Main beats (aligned with tempo pulse)
  - Type 2: Extra hits (syncopation, off-beats)
- Difficulty filtering with min gap:
  - Easy: 250ms
  - Medium: 180ms
  - Hard: 120ms
  - Expert: 80ms
- Output: JSON with tempo, beats array, duration

### 3. Song Storage
- Store audio files in cloud storage
- Store metadata in database
- Enable retrieval by song ID

### 4. Song Sharing
- Each song has a unique ID
- Shareable via URL/deep link
- Friend opens link → Lens loads song → plays same beat map
- Both compete on same leaderboard (per song)

### 5. Song Library (Optional/Future)
- Browse all publicly generated songs
- Filter by creator, popularity, date

---

## Database Schema

### Songs Collection

```javascript
// Firestore: /songs/{songId}
{
  // Identity
  "id": "song_abc123",

  // Content
  "prompt": "upbeat electronic dance music",
  "audioUrl": "/songs/song_abc123/audio.mp3",
  "beatMap": {
    "tempo": 128.0,
    "difficulty": "medium",
    "min_gap_ms": 180,
    "beats": [
      {"time": 0.5, "type": 1},
      {"time": 0.92, "type": 2}
    ],
    "beat_count": 45,
    "duration": 15.0
  },
  "duration": 15.0,

  // Metadata
  "creatorId": "snap_user_123",
  "playCount": 42,

  // Timestamps
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

### Indexes Needed

| Index | Purpose |
|-------|---------|
| `createdAt DESC` | Recent songs |
| `playCount DESC` | Popular songs |
| `creatorId + createdAt` | User's songs |

---

## Storage Strategy

### Audio Files

| Option | Pros | Cons | Cost |
|--------|------|------|------|
| Firebase Storage | Easy, integrated | Snap might not like | Free tier: 5GB |
| AWS S3 | Reliable, cheap | More setup | ~$0.023/GB |
| Cloudflare R2 | No egress fees | Newer | ~$0.015/GB |

**Recommendation:** Firebase Storage for hackathon (easy setup)

### File Structure

```
/songs
  /song_abc123
    /audio.mp3
    /metadata.json
  /song_def456
    /audio.mp3
    /metadata.json
```

### Audio Format

- Format: MP3
- Channels: Mono (smaller files)
- Sample Rate: 44.1kHz
- Bitrate: 128kbps
- Duration: 15-30 seconds
- Estimated Size: ~200-400KB per song

---

## Deployment Architecture

### Local Development (Current)

```
┌─────────────────────────────────────────────────────────────────┐
│                     LOCAL DEVELOPMENT                            │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   FastAPI    │  │    Local     │  │    Local     │          │
│  │   Server     │  │   Storage    │  │    /data     │          │
│  │   (run.py)   │  │   (/songs)   │  │  (test mp3s) │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────┐                                               │
│  │  Mock Mode   │ (uses sample.mp3 instead of Replicate)        │
│  └──────────────┘                                               │
└─────────────────────────────────────────────────────────────────┘
```

### Production (Firebase)

```
┌─────────────────────────────────────────────────────────────────┐
│                     FIREBASE PROJECT                             │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Firebase   │  │   Firebase   │  │   Firebase   │          │
│  │  Functions   │  │  Firestore   │  │   Storage    │          │
│  │   (API)      │  │  (Database)  │  │   (Audio)    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────┐                                               │
│  │  Replicate   │ (External AI API)                             │
│  └──────────────┘                                               │
└─────────────────────────────────────────────────────────────────┘
```

**Why Firebase?**
- Free tier is generous
- All-in-one (functions + database + storage)
- Easy deployment
- Good for hackathon timeline

---

## Song Sharing Flow

### How Sharing Works

```
1. USER A GENERATES SONG
   ┌─────────────────────────────────────────┐
   │ User A selects genre/mood              │
   │         ↓                               │
   │ POST /api/generate                      │
   │         ↓                               │
   │ Backend generates song                  │
   │         ↓                               │
   │ Returns: songId, audioUrl, beatMap     │
   │         ↓                               │
   │ User A plays the song                   │
   │         ↓                               │
   │ Score submitted to Leaderboard          │
   └─────────────────────────────────────────┘

2. USER A SHARES
   ┌─────────────────────────────────────────┐
   │ User A taps "Share"                     │
   │         ↓                               │
   │ Snapchat share sheet opens              │
   │         ↓                               │
   │ Link: https://app.com/song/song_abc123 │
   │         ↓                               │
   │ Sends to User B via Snap/Chat          │
   └─────────────────────────────────────────┘

3. USER B PLAYS
   ┌─────────────────────────────────────────┐
   │ User B taps link                        │
   │         ↓                               │
   │ Opens Lens with songId param            │
   │         ↓                               │
   │ GET /api/song/song_abc123               │
   │         ↓                               │
   │ Load audio + beatMap                    │
   │         ↓                               │
   │ User B plays same song                  │
   │         ↓                               │
   │ Score submitted to SAME Leaderboard     │
   │         ↓                               │
   │ User B sees User A's score to beat!     │
   └─────────────────────────────────────────┘
```

### Leaderboard Per Song

Lens Studio's Leaderboard is **per-Lens**, but you can scope it per-song by:
- Using song ID as a leaderboard key
- Or: one global leaderboard (simpler, but less competitive)

**Note:** Check Lens Studio docs for leaderboard scoping options.

---

## Technology Choices

### Summary

| Component | Choice | Reason |
|-----------|--------|--------|
| Language | Python | Best for audio processing (librosa) |
| Framework | FastAPI | Async support, auto docs (Swagger) |
| Database | Firebase Firestore | Free, easy, NoSQL fits our data |
| Storage | Firebase Storage | Integrated, free tier |
| AI Music | Replicate (MusicGen) | No GPU needed, pay-per-use (~$0.05/song) |
| Beat Detection | Librosa | Free, reliable, well-documented |
| Hosting | Firebase Functions | Free, serverless, auto-scale |

---

## Timeline

| Weekend | Tasks |
|---------|-------|
| **1** | Research & Experiment |
|       | ✅ Test beat detection locally |
|       | ✅ Test MusicGen integration (mock mode) |
|       | ✅ Build local FastAPI server |
|       | ✅ Implement all core endpoints |
|       | ☐ Set up Firebase project |
| **2** | Core API Development |
|       | ☐ Deploy to Firebase Functions |
|       | ☐ Test with real Replicate API |
|       | ☐ Set up Firestore database |
|       | ☐ Set up Firebase Storage |
| **3** | Integration & Testing |
|       | ☐ Test with Lens Studio (Dev 2) |
|       | ☐ Fix API contract issues |
|       | ☐ Optimize response times |
|       | ☐ Add error handling |
| **4** | Polish & Optional Features |
|       | ☐ Generate preset songs (5-10) |
|       | ☐ 🟢 OPTIONAL: Song library browse |
|       | ☐ Performance optimization |
| **5** | Stability & Launch |
|       | ☐ Monitor for issues |
|       | ☐ Handle edge cases |
|       | ☐ Backup procedures |

---

## Open Questions

1. **Leaderboard scoping:** Can we have per-song leaderboards, or is it global per-Lens?
2. **Deep links:** How does Snapchat handle deep links to Lenses with parameters?
3. **Audio format:** Does Lens Studio Remote Assets prefer specific formats?
4. **Rate limiting:** Should we limit song generation per user?

---

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app
│   ├── config.py            # Configuration
│   ├── routes/
│   │   └── songs.py         # API endpoints
│   └── services/
│       ├── beat_detection.py
│       ├── music_generation.py
│       └── storage.py
├── data/                    # Test audio files (gitignored)
├── songs/                   # Generated songs storage (gitignored)
├── experiments/             # Standalone experiments
│   └── beat_detection.py
├── requirements.txt
├── run.py                   # Development server
├── .env.example
├── DESIGN.md                # This file (architecture)
└── README.md                # Quick start & API reference
```
