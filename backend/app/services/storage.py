"""
Storage Service
Handles storing and retrieving songs (audio + metadata).
Supports local file system (dev) and Firebase (production).
"""

import json
import uuid
from datetime import datetime
from pathlib import Path
from typing import Optional

from app.config import config


class LocalStorageService:
    """
    Local file system storage for development.
    Stores audio files and metadata as JSON.
    """

    def __init__(self):
        self.songs_dir = config.SONGS_DIR
        self.songs_dir.mkdir(parents=True, exist_ok=True)

    def save_song(
        self,
        audio_bytes: bytes,
        beat_map: dict,
        prompt: str,
        duration: float,
        song_id: Optional[str] = None,
        creator_id: Optional[str] = None,
    ) -> dict:
        """
        Save a song (audio + metadata).

        Returns:
            Complete song data with ID and URLs
        """
        # Generate ID if not provided
        if song_id is None:
            song_id = f"song_{uuid.uuid4().hex[:12]}"

        # Create song directory
        song_dir = self.songs_dir / song_id
        song_dir.mkdir(exist_ok=True)

        # Save audio file
        audio_path = song_dir / "audio.mp3"
        with open(audio_path, "wb") as f:
            f.write(audio_bytes)

        # Build metadata
        now = datetime.utcnow().isoformat() + "Z"
        metadata = {
            "id": song_id,
            "prompt": prompt,
            "audioUrl": f"/songs/{song_id}/audio.mp3",  # Local URL
            "beatMap": beat_map,
            "duration": duration,
            "creatorId": creator_id,
            "playCount": 0,
            "createdAt": now,
            "updatedAt": now,
        }

        # Save metadata
        metadata_path = song_dir / "metadata.json"
        with open(metadata_path, "w") as f:
            json.dump(metadata, f, indent=2)

        return metadata

    def get_song(self, song_id: str) -> Optional[dict]:
        """
        Get song metadata by ID.
        """
        metadata_path = self.songs_dir / song_id / "metadata.json"

        if not metadata_path.exists():
            return None

        with open(metadata_path, "r") as f:
            metadata = json.load(f)

        # Increment play count
        metadata["playCount"] += 1
        metadata["updatedAt"] = datetime.utcnow().isoformat() + "Z"

        with open(metadata_path, "w") as f:
            json.dump(metadata, f, indent=2)

        return metadata

    def get_audio_path(self, song_id: str) -> Optional[Path]:
        """
        Get path to audio file.
        """
        audio_path = self.songs_dir / song_id / "audio.mp3"
        return audio_path if audio_path.exists() else None

    def list_songs(
        self,
        limit: int = 20,
        offset: int = 0,
        sort_by: str = "createdAt",
        creator_id: Optional[str] = None,
    ) -> list:
        """
        List songs (for song library).

        Args:
            creator_id: If provided, filter to only this user's songs.
                        If None, returns all songs.
        """
        songs = []

        for song_dir in self.songs_dir.iterdir():
            if song_dir.is_dir():
                metadata_path = song_dir / "metadata.json"
                if metadata_path.exists():
                    with open(metadata_path, "r") as f:
                        song = json.load(f)
                        # Filter by creator if specified
                        if creator_id is None or song.get("creatorId") == creator_id:
                            songs.append(song)

        # Sort
        reverse = True  # Descending
        if sort_by == "playCount":
            songs.sort(key=lambda x: x.get("playCount", 0), reverse=reverse)
        else:  # createdAt
            songs.sort(key=lambda x: x.get("createdAt", ""), reverse=reverse)

        # Paginate
        return songs[offset:offset + limit]

    def delete_song(self, song_id: str) -> bool:
        """
        Delete a song.
        """
        song_dir = self.songs_dir / song_id
        if song_dir.exists():
            import shutil
            shutil.rmtree(song_dir)
            return True
        return False


# Default instance
storage_service = LocalStorageService()
