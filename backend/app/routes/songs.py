"""
Song API Routes
"""

from fastapi import APIRouter, HTTPException, Query, UploadFile, File, Form
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional

from app.services.music_generation import music_service
from app.services.beat_detection import detect_beats
from app.services.storage import storage_service
from app.config import config


router = APIRouter(prefix="/api", tags=["songs"])


# Request/Response Models

class GenerateRequest(BaseModel):
    prompt: str
    duration: int = 15
    difficulty: str = "medium"
    creatorId: Optional[str] = None


class GenerateResponse(BaseModel):
    success: bool
    song: dict


class SongResponse(BaseModel):
    success: bool
    song: dict


class SongsListResponse(BaseModel):
    success: bool
    songs: list
    total: int


class BeatMapResponse(BaseModel):
    success: bool
    beatMap: dict


# Routes

@router.post("/generate", response_model=GenerateResponse)
async def generate_song(request: GenerateRequest):
    """
    Generate a new AI song with beat map.

    This endpoint:
    1. Calls MusicGen to generate audio
    2. Analyzes audio to extract beats
    3. Stores the song
    4. Returns song data with beat map
    """
    try:
        # Validate difficulty
        if request.difficulty not in config.DIFFICULTY_GAPS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid difficulty. Must be one of: {list(config.DIFFICULTY_GAPS.keys())}"
            )

        # Validate duration
        if request.duration < 5 or request.duration > 30:
            raise HTTPException(
                status_code=400,
                detail="Duration must be between 5 and 30 seconds"
            )

        # Generate music
        print(f"Generating music: '{request.prompt}' ({request.duration}s)")
        audio_bytes = music_service.generate(
            prompt=request.prompt,
            duration=request.duration,
        )
        print(f"Generated {len(audio_bytes)} bytes of audio")

        # Detect beats
        print(f"Detecting beats (difficulty: {request.difficulty})")
        beat_map = detect_beats(audio_bytes, request.difficulty)
        print(f"Found {beat_map['beat_count']} beats")

        # Save song
        song = storage_service.save_song(
            audio_bytes=audio_bytes,
            beat_map=beat_map,
            prompt=request.prompt,
            duration=beat_map["duration"],
            creator_id=request.creatorId,
        )

        return GenerateResponse(success=True, song=song)

    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        print(f"Error generating song: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/detect-beats", response_model=BeatMapResponse)
async def detect_beats_endpoint(
    file: UploadFile = File(..., description="Audio file (MP3, WAV)"),
    difficulty: str = Form("medium", description="Difficulty: easy/medium/hard/expert"),
):
    """
    Detect beats in an uploaded audio file.

    Use cases:
    - Generate beat maps for preset/bundled songs
    - Test beat detection without AI music generation
    - Re-process a song with different difficulty

    Returns beat map only (no storage).
    """
    try:
        # Validate difficulty
        if difficulty not in config.DIFFICULTY_GAPS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid difficulty. Must be one of: {list(config.DIFFICULTY_GAPS.keys())}"
            )

        # Validate file type
        if not file.filename.lower().endswith(('.mp3', '.wav', '.ogg', '.flac')):
            raise HTTPException(
                status_code=400,
                detail="Invalid file type. Supported: MP3, WAV, OGG, FLAC"
            )

        # Read audio bytes
        print(f"Processing audio: {file.filename}")
        audio_bytes = await file.read()
        print(f"Read {len(audio_bytes)} bytes")

        # Detect beats
        print(f"Detecting beats (difficulty: {difficulty})")
        beat_map = detect_beats(audio_bytes, difficulty)
        print(f"Found {beat_map['beat_count']} beats")

        return BeatMapResponse(success=True, beatMap=beat_map)

    except Exception as e:
        print(f"Error detecting beats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/song/{song_id}", response_model=SongResponse)
async def get_song(song_id: str):
    """
    Get a song by ID.
    Used when a friend opens a shared link.
    """
    song = storage_service.get_song(song_id)

    if song is None:
        raise HTTPException(status_code=404, detail="Song not found")

    return SongResponse(success=True, song=song)


@router.get("/song/{song_id}/audio")
async def get_song_audio(song_id: str):
    """
    Get the audio file for a song.
    """
    audio_path = storage_service.get_audio_path(song_id)

    if audio_path is None:
        raise HTTPException(status_code=404, detail="Audio not found")

    return FileResponse(
        audio_path,
        media_type="audio/mpeg",
        filename=f"{song_id}.mp3"
    )


@router.get("/songs", response_model=SongsListResponse)
async def list_songs(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    sort: str = Query("createdAt", regex="^(createdAt|playCount)$"),
    creatorId: Optional[str] = Query(None, description="Filter by creator ID"),
):
    """
    List songs (for song library).

    - If creatorId is provided: returns only that user's songs
    - If creatorId is omitted: returns all songs (for discovery)
    """
    songs = storage_service.list_songs(
        limit=limit,
        offset=offset,
        sort_by=sort,
        creator_id=creatorId,
    )

    # Get total count for this filter
    all_songs = storage_service.list_songs(limit=10000, offset=0, creator_id=creatorId)
    total = len(all_songs)

    return SongsListResponse(
        success=True,
        songs=songs,
        total=total,
    )


@router.get("/health")
async def health_check():
    """
    Health check endpoint.
    """
    return {
        "status": "ok",
        "mode": music_service.mode,
        "env": config.ENV,
    }


# =============================================================================
# Test Endpoints (for local development only)
# =============================================================================

@router.get("/test/detect-beats", response_model=BeatMapResponse)
async def test_detect_beats(
    filename: str = Query(..., description="Filename in /backend/data (e.g., sample.mp3)"),
    difficulty: str = Query("medium", description="Difficulty: easy/medium/hard/expert"),
):
    """
    [LOCAL TEST ONLY] Detect beats from a file in /backend/data directory.

    Example: /api/test/detect-beats?filename=sample.mp3&difficulty=medium
    """
    try:
        # Validate difficulty
        if difficulty not in config.DIFFICULTY_GAPS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid difficulty. Must be one of: {list(config.DIFFICULTY_GAPS.keys())}"
            )

        # Build file path
        file_path = config.DATA_DIR / filename

        # Check file exists
        if not file_path.exists():
            # List available files
            available = [f.name for f in config.DATA_DIR.iterdir() if f.is_file()]
            raise HTTPException(
                status_code=404,
                detail=f"File not found: {filename}. Available files: {available}"
            )

        # Validate file type
        if not filename.lower().endswith(('.mp3', '.wav', '.ogg', '.flac')):
            raise HTTPException(
                status_code=400,
                detail="Invalid file type. Supported: MP3, WAV, OGG, FLAC"
            )

        # Detect beats
        print(f"Processing: {file_path}")
        print(f"Difficulty: {difficulty}")
        beat_map = detect_beats(str(file_path), difficulty)
        print(f"Found {beat_map['beat_count']} beats")

        return BeatMapResponse(success=True, beatMap=beat_map)

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error detecting beats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/test/list-files")
async def test_list_files():
    """
    [LOCAL TEST ONLY] List available audio files in /backend/data directory.
    """
    files = []
    for f in config.DATA_DIR.iterdir():
        if f.is_file() and f.suffix.lower() in ('.mp3', '.wav', '.ogg', '.flac'):
            files.append({
                "name": f.name,
                "size_kb": round(f.stat().st_size / 1024, 1),
            })

    return {
        "directory": str(config.DATA_DIR),
        "files": files,
    }
