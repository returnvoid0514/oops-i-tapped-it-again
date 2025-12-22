"""
Configuration for the backend.
Supports local development and production (Firebase).
"""

import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()


class Config:
    # Environment: "local" or "production"
    ENV = os.getenv("ENV", "local")

    # Replicate API (for MusicGen)
    REPLICATE_API_TOKEN = os.getenv("REPLICATE_API_TOKEN", "")

    # Local storage path
    BASE_DIR = Path(__file__).parent.parent
    DATA_DIR = BASE_DIR / "data"
    SONGS_DIR = DATA_DIR / "songs"

    # Audio settings
    DEFAULT_DURATION = 15  # seconds
    AUDIO_FORMAT = "mp3"

    # Beat detection defaults
    DEFAULT_DIFFICULTY = "medium"
    DIFFICULTY_GAPS = {
        "easy": 0.25,
        "medium": 0.18,
        "hard": 0.12,
        "expert": 0.08,
    }

    # Server
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", 8000))

    # Firebase (for production)
    FIREBASE_CREDENTIALS = os.getenv("FIREBASE_CREDENTIALS", "")
    FIREBASE_STORAGE_BUCKET = os.getenv("FIREBASE_STORAGE_BUCKET", "")


config = Config()

# Ensure directories exist
config.SONGS_DIR.mkdir(parents=True, exist_ok=True)
