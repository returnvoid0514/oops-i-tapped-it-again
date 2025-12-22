# Backend Design Document

> **Owner: Dev 1**
>
> Last Updated: Weekend 1

---

## Table of Contents
1. [Overview](#overview)
2. [What Dev 1 Builds vs What's Built-in](#what-dev-1-builds-vs-whats-built-in)
3. [Core Features](#core-features)
4. [API Specification](#api-specification)
5. [Database Schema](#database-schema)
6. [Storage Strategy](#storage-strategy)
7. [Deployment Architecture](#deployment-architecture)
8. [Song Sharing Flow](#song-sharing-flow)
9. [Technology Choices](#technology-choices)
10. [Timeline](#timeline)

---

## Overview

Backend services for the AI Music Beat Game. Handles:
- AI music generation
- Beat detection
- Song storage & retrieval
- Song sharing between users

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
│  │                      API Layer                            │  │
│  │  POST /generate    GET /song/:id    GET /songs (optional) │  │
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
- User provides: genre, mood, tempo preference
- Backend calls: Replicate (MusicGen)
- Returns: audio file + beat map

### 2. Beat Detection
- Input: generated audio
- Process: librosa analysis + difficulty filtering
- Output: timestamped beat map with types

### 3. Song Storage
- Store audio files in cloud storage
- Store metadata in database
- Enable retrieval by song ID

### 4. Song Sharing
- Each song has a unique ID
- Shareable via URL/deep link: `https://yourapp.com/song/{songId}`
- Friend opens link → Lens loads song → plays same beat map
- Both compete on same leaderboard (per song)

### 5. Song Library (Optional/Future)
- Browse all publicly generated songs
- Filter by genre, popularity, date
- Search functionality

---

## API Specification

### Required APIs

#### POST /generate

Create a new AI-generated song.

**Request:**
```json
{
  "prompt": "upbeat electronic dance music",
  "duration": 15,
  "difficulty": "medium",
  "creatorId": "snap_user_123"
}
```

**Response:**
```json
{
  "success": true,
  "song": {
    "id": "song_abc123",
    "audioUrl": "https://storage.example.com/songs/song_abc123.mp3",
    "beatMap": {
      "tempo": 128.0,
      "difficulty": "medium",
      "min_gap_ms": 180,
      "beats": [
        {"time": 0.5, "type": 1},
        {"time": 0.92, "type": 2}
      ]
    },
    "duration": 15.0,
    "shareUrl": "https://yourapp.com/song/song_abc123"
  }
}
```

**Notes:**
- Long-running operation (10-30 seconds)
- Consider async with polling, or client-side loading animation

---

#### GET /song/:id

Fetch a song by ID (for shared links).

**Request:**
```
GET /song/song_abc123
```

**Response:**
```json
{
  "success": true,
  "song": {
    "id": "song_abc123",
    "audioUrl": "https://storage.example.com/songs/song_abc123.mp3",
    "beatMap": {
      "tempo": 128.0,
      "difficulty": "medium",
      "beats": [...]
    },
    "duration": 15.0,
    "prompt": "upbeat electronic dance music",
    "createdAt": "2025-01-15T10:30:00Z",
    "playCount": 42
  }
}
```

**Notes:**
- Increment `playCount` on each fetch (for popularity tracking)
- Used when friend opens shared link

---

### Optional APIs (Song Library)

#### GET /songs

Browse song library.

**Request:**
```
GET /songs?genre=edm&sort=popular&limit=20&offset=0
```

**Response:**
```json
{
  "success": true,
  "songs": [
    {
      "id": "song_abc123",
      "prompt": "upbeat electronic",
      "duration": 15.0,
      "playCount": 42,
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ],
  "total": 150,
  "hasMore": true
}
```

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
  "audioUrl": "https://storage.example.com/songs/song_abc123.mp3",
  "beatMap": {
    "tempo": 128.0,
    "difficulty": "medium",
    "min_gap_ms": 180,
    "beats": [
      {"time": 0.5, "type": 1},
      {"time": 0.92, "type": 2}
    ]
  },
  "duration": 15.0,

  // Metadata
  "creatorId": "snap_user_123",      // Optional: track who created
  "genre": "edm",                     // Extracted from prompt
  "playCount": 42,                    // Increment on play

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
| `genre + playCount` | Popular by genre |

---

## Storage Strategy

### Audio Files

| Option | Pros | Cons | Cost |
|--------|------|------|------|
| Firebase Storage | Easy, integrated | Snap might not like | Free tier: 5GB |
| AWS S3 | Reliable, cheap | More setup | ~$0.023/GB |
| Cloudflare R2 | No egress fees | Newer | ~$0.015/GB |
| Lens Cloud | Native to Lens Studio | Limited docs | Free? |

**Recommendation:** Firebase Storage for hackathon (easy setup)

### File Structure

```
/songs
  /song_abc123.mp3
  /song_def456.mp3
  /...
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

### Recommended: Firebase (Serverless)

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

### Alternative: Railway/Render + Supabase

If Firebase Functions timeout is an issue (60s limit for free tier):

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Railway    │     │   Supabase   │     │   S3 / R2    │
│  (Node.js)   │────▶│  (Postgres)  │     │  (Storage)   │
└──────────────┘     └──────────────┘     └──────────────┘
```

---

## Song Sharing Flow

### How Sharing Works

```
1. USER A GENERATES SONG
   ┌─────────────────────────────────────────┐
   │ User A selects genre/mood              │
   │         ↓                               │
   │ POST /generate                          │
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
   │ GET /song/song_abc123                   │
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
| Framework | Flask or FastAPI | Simple, quick to build |
| Database | Firebase Firestore | Free, easy, NoSQL fits our data |
| Storage | Firebase Storage | Integrated, free tier |
| AI Music | Replicate (MusicGen) | No GPU needed, pay-per-use |
| Beat Detection | Librosa | Free, reliable, well-documented |
| Hosting | Firebase Functions | Free, serverless, auto-scale |

### Dependencies

```txt
# requirements.txt
flask>=2.0.0
firebase-admin>=6.0.0
librosa>=0.10.0
replicate>=0.15.0
numpy
requests
```

---

## Timeline

| Weekend | Tasks |
|---------|-------|
| **1** | Research & Experiment |
|       | ✅ Test beat detection locally |
|       | ✅ Test MusicGen on Replicate |
|       | ☐ Set up Firebase project |
|       | ☐ Test storage upload |
| **2** | Core API Development |
|       | ☐ Implement POST /generate |
|       | ☐ Implement GET /song/:id |
|       | ☐ Integrate beat detection |
|       | ☐ Deploy to Firebase Functions |
| **3** | Integration & Testing |
|       | ☐ Test with Lens Studio (Dev 2) |
|       | ☐ Fix API contract issues |
|       | ☐ Optimize response times |
|       | ☐ Add error handling |
| **4** | Polish & Optional Features |
|       | ☐ Generate preset songs (5-10) |
|       | ☐ Add playCount tracking |
|       | ☐ 🟢 OPTIONAL: GET /songs (library) |
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

## Appendix: Folder Structure

```
backend/
├── DESIGN.md              # This file
├── API_SPEC.md            # API details (deprecated, merged here)
├── README.md              # Quick start
├── requirements.txt       # Python dependencies
├── experiments/           # Local testing
│   ├── beat_detection.py
│   └── requirements.txt
├── functions/             # Firebase Functions
│   ├── main.py
│   ├── services/
│   │   ├── music_gen.py
│   │   ├── beat_detection.py
│   │   └── storage.py
│   └── requirements.txt
└── scripts/
    └── generate_presets.py
```
