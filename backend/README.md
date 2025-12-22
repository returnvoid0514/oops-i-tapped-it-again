# Backend

> **Owner: Dev 1**

AI/backend services for the beat game.

---

## Quick Start

```bash
# 1. Create virtual environment
cd backend
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# or: venv\Scripts\activate  # Windows

# 2. Install dependencies
pip install -r requirements.txt

# 3. Copy environment file
cp .env.example .env

# 4. Add a sample audio file for testing (mock mode)
curl -L "https://cdn.pixabay.com/audio/2024/11/29/audio_5e84fc5c43.mp3" -o data/sample.mp3

# 5. Run the server
python run.py
```

Server: http://localhost:8000

- **Swagger UI:** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/api/health

---

## API Reference

### All Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/generate` | Generate song with AI + beat detection |
| `POST` | `/api/detect-beats` | Upload audio → get beat map |
| `GET` | `/api/song/{id}` | Get song by ID (for sharing) |
| `GET` | `/api/song/{id}/audio` | Download audio file |
| `GET` | `/api/songs` | List songs (with filters) |

### Test Endpoints (Local Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/test/detect-beats?filename=xxx` | Beat detection from `/data` folder |
| `GET` | `/api/test/list-files` | List files in `/data` folder |

---

### POST /api/generate

Generate a new AI song with beat map.

```json
// Request
{
  "prompt": "upbeat electronic dance music",
  "duration": 15,
  "difficulty": "medium",
  "creatorId": "user_123"
}

// Response
{
  "success": true,
  "song": {
    "id": "song_abc123",
    "audioUrl": "/songs/song_abc123/audio.mp3",
    "beatMap": {
      "tempo": 128.0,
      "difficulty": "medium",
      "min_gap_ms": 180,
      "beats": [{"time": 0.5, "type": 1}, {"time": 0.92, "type": 2}],
      "beat_count": 45
    },
    "duration": 15.0,
    "creatorId": "user_123",
    "playCount": 0
  }
}
```

---

### POST /api/detect-beats

Upload audio → get beat map only. No AI, no storage.

```bash
curl -X POST http://localhost:8000/api/detect-beats \
  -F "file=@song.mp3" \
  -F "difficulty=medium"
```

---

### GET /api/song/{id}

Get song by ID (for shared links).

---

### GET /api/songs

List songs with optional filtering.

| Param | Default | Description |
|-------|---------|-------------|
| `limit` | 20 | Max songs (1-100) |
| `offset` | 0 | Pagination |
| `sort` | createdAt | `createdAt` or `playCount` |
| `creatorId` | null | Filter by creator |

```bash
# All songs
curl http://localhost:8000/api/songs

# My songs only
curl "http://localhost:8000/api/songs?creatorId=user_123"
```

---

## Testing

```bash
# Health check
curl http://localhost:8000/api/health

# List files in /data
curl http://localhost:8000/api/test/list-files

# Test beat detection (easiest - no upload needed)
curl "http://localhost:8000/api/test/detect-beats?filename=sample.mp3&difficulty=medium"

# Generate song
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "upbeat electronic", "duration": 15, "difficulty": "medium"}'
```

---

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app
│   ├── config.py            # Configuration
│   ├── routes/songs.py      # API endpoints
│   └── services/
│       ├── beat_detection.py
│       ├── music_generation.py
│       └── storage.py
├── data/                    # Test audio files
├── experiments/             # Standalone experiments
├── requirements.txt
├── run.py
├── .env.example
├── DESIGN.md                # Architecture & design
└── README.md                # This file
```

---

## Modes

| Mode | When | Music Source |
|------|------|--------------|
| Mock | No `REPLICATE_API_TOKEN` | Uses `data/sample.mp3` |
| Replicate | `REPLICATE_API_TOKEN` set | Calls MusicGen API |

---

## Tech Stack

| Component | Choice |
|-----------|--------|
| Framework | FastAPI |
| Beat Detection | Librosa |
| AI Music | Replicate (MusicGen) |
| Production | Firebase |

See [DESIGN.md](./DESIGN.md) for architecture details.
