# Backend

> **Owner: Dev 1**

AI/backend services & cloud storage.

---

## Quick Start (Local Development)

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
# Download any MP3 and save as data/sample.mp3
curl -L "https://cdn.pixabay.com/audio/2024/11/29/audio_5e84fc5c43.mp3" -o data/sample.mp3

# 5. Run the server
python run.py
```

Server will start at: http://localhost:8000

- **Swagger UI (Interactive):** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/api/health

---

## API Reference

### All Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/generate` | Generate new song with AI + beat detection |
| `POST` | `/api/detect-beats` | Upload audio → get beat map only |
| `GET` | `/api/song/{id}` | Get song by ID (for shared links) |
| `GET` | `/api/song/{id}/audio` | Download audio file |
| `GET` | `/api/songs` | List songs (with optional filters) |

### Test Endpoints (Local Development)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/test/detect-beats` | Detect beats from file in `/data` folder |
| `GET` | `/api/test/list-files` | List audio files in `/data` folder |

---

### POST /api/generate

Generate a new AI song with beat map.

**Request Body:**
```json
{
  "prompt": "upbeat electronic dance music",
  "duration": 15,
  "difficulty": "medium",
  "creatorId": "user_123"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `prompt` | string | Yes | Music description |
| `duration` | int | No | Length in seconds (5-30, default: 15) |
| `difficulty` | string | No | easy/medium/hard/expert (default: medium) |
| `creatorId` | string | No | User ID from Snapchat |

**Response:**
```json
{
  "success": true,
  "song": {
    "id": "song_abc123",
    "audioUrl": "/songs/song_abc123/audio.mp3",
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
    "creatorId": "user_123",
    "playCount": 0
  }
}
```

---

### POST /api/detect-beats

Upload an audio file and get beat map. No AI generation, no storage.

**Use cases:**
- Generate beat maps for preset/bundled songs
- Test beat detection separately
- Re-process with different difficulty

**Request:** `multipart/form-data`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | file | Yes | Audio file (MP3, WAV, OGG, FLAC) |
| `difficulty` | string | No | easy/medium/hard/expert (default: medium) |

**cURL Example:**
```bash
curl -X POST http://localhost:8000/api/detect-beats \
  -F "file=@song.mp3" \
  -F "difficulty=medium"
```

**Postman:**
1. Method: POST
2. URL: `http://localhost:8000/api/detect-beats`
3. Body tab → select `form-data`
4. Add key `file` (type: File) → select your MP3
5. Add key `difficulty` (type: Text) → value: `medium`

**Response:**
```json
{
  "success": true,
  "beatMap": {
    "tempo": 128.0,
    "difficulty": "medium",
    "min_gap_ms": 180,
    "beats": [
      {"time": 0.5, "type": 1},
      {"time": 0.92, "type": 2}
    ],
    "duration": 15.0,
    "beat_count": 45
  }
}
```

---

### GET /api/song/{id}

Get a song by ID. Used when friend opens a shared link.

**Response:**
```json
{
  "success": true,
  "song": { ... }
}
```

---

### GET /api/songs

List songs with optional filtering.

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | int | 20 | Max songs to return (1-100) |
| `offset` | int | 0 | Pagination offset |
| `sort` | string | createdAt | Sort by: `createdAt` or `playCount` |
| `creatorId` | string | null | Filter by creator (omit for all songs) |

**Examples:**
```
GET /api/songs                           # All songs
GET /api/songs?creatorId=user_123        # Only user_123's songs
GET /api/songs?sort=playCount&limit=10   # Top 10 popular songs
```

**Response:**
```json
{
  "success": true,
  "songs": [...],
  "total": 42
}
```

---

## Testing with cURL

```bash
# Health check
curl http://localhost:8000/api/health

# List files in /data folder
curl http://localhost:8000/api/test/list-files

# Test beat detection (reads from /data folder - easiest!)
curl "http://localhost:8000/api/test/detect-beats?filename=sample.mp3&difficulty=medium"

# Detect beats via file upload
curl -X POST http://localhost:8000/api/detect-beats \
  -F "file=@data/sample.mp3" \
  -F "difficulty=medium"

# Generate a song (AI + beat detection + storage)
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "upbeat electronic", "duration": 15, "difficulty": "medium", "creatorId": "user_123"}'

# Get a song by ID (replace with actual ID from generate response)
curl http://localhost:8000/api/song/song_abc123

# List all songs
curl http://localhost:8000/api/songs

# List only my songs
curl "http://localhost:8000/api/songs?creatorId=user_123"

# Download audio file
curl http://localhost:8000/api/song/song_abc123/audio -o song.mp3
```

---

## Testing with Postman

1. Import the Swagger spec: http://localhost:8000/openapi.json
2. Or manually create requests using the API reference above
3. For `POST /api/generate`, set:
   - Body type: `raw` → `JSON`
   - Header: `Content-Type: application/json`

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
├── data/
│   ├── sample.mp3           # For mock mode testing
│   └── songs/               # Generated songs stored here
├── experiments/             # Beat detection experiments
├── requirements.txt
├── run.py                   # Dev server runner
├── .env.example
├── DESIGN.md                # Full design doc
└── README.md
```

## Modes

| Mode | When | Music Source |
|------|------|--------------|
| Mock | No REPLICATE_API_TOKEN set | Uses data/sample.mp3 |
| Replicate | REPLICATE_API_TOKEN set | Calls MusicGen API |

---

## Responsibilities
- AI music generation API integration
- Beat detection service
- Cloud storage for generated tracks
- API endpoints for the Lens

## Tech Stack
- Python + FastAPI
- Librosa (beat detection)
- Replicate (MusicGen)
- Firebase (production)

---

# AI Music Generation

## Recommended: Meta's MusicGen

Open source, free, commercial use allowed.

| Model | Size | Quality | Hardware |
|-------|------|---------|----------|
| `musicgen-small` | 300M | Good | ~4GB VRAM |
| `musicgen-medium` | 1.5B | Better | ~16GB VRAM |
| `musicgen-large` | 3.3B | Best | ~32GB VRAM |

### Quick Test
- [Hugging Face Demo](https://huggingface.co/spaces/facebook/MusicGen) - no setup needed

### Self-Host
```bash
pip install audiocraft
```

```python
from audiocraft.models import MusicGen

model = MusicGen.get_pretrained('facebook/musicgen-small')
model.set_generation_params(duration=15)  # seconds
wav = model.generate(['upbeat electronic dance music'])
```

### Cloud API (No GPU Required)
- [Replicate](https://replicate.com/meta/musicgen) - ~$0.0032/sec of audio

### Links
- [GitHub](https://github.com/facebookresearch/audiocraft)
- [Docs](https://facebookresearch.github.io/audiocraft/docs/MUSICGEN.html)

### Alternatives

| Tool | Pros | Cons |
|------|------|------|
| [ACE-Step](https://github.com/ace-step/ACE-Step) | Fast (4 min in 20 sec) | Newer, less tested |
| [Suno API](https://suno.com) | High quality, vocals | Paid |
| [Mubert](https://mubert.com/render/api) | Fast, streaming | Paid |

---

# Beat Detection

## Recommended: Librosa

Simple, reliable, no GPU needed.

### Install
```bash
pip install librosa
```

### Usage
```python
import librosa

y, sr = librosa.load('song.mp3')
tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
beat_times = librosa.frames_to_time(beat_frames, sr=sr)

# Output: [0.5, 1.0, 1.5, 2.0, ...] seconds
```

### Output Format (for game)
```json
{
  "tempo": 120,
  "beats": [0.5, 1.0, 1.5, 2.0, 2.5]
}
```

### Links
- [Librosa Docs](https://librosa.org/doc/latest/generated/librosa.beat.beat_track.html)

### Alternatives

| Tool | Pros | Cons |
|------|------|------|
| [Madmom](https://github.com/CPJKU/madmom) | More accurate | Heavier setup |
| [BeatNet](https://github.com/mjhydri/BeatNet) | Real-time, SOTA | Overkill for offline |

---

# Summary

| Component | Choice | Cost |
|-----------|--------|------|
| AI Music | MusicGen via Replicate | ~$0.05/song |
| Beat Detection | Librosa | Free |

## Backend Flow
```
User Input (genre/mood)
    ↓
Replicate API (MusicGen)
    ↓
MP3 Audio File
    ↓
Librosa Beat Detection
    ↓
{ songId, audioUrl, beatMap }
```
