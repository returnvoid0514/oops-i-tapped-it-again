"""
Beat Detection Service
Analyzes audio and extracts beat map for rhythm game.
"""

import librosa
import numpy as np
from pathlib import Path
from typing import Union

from app.config import config


def detect_beats(
    audio_source: Union[str, Path, bytes],
    difficulty: str = "medium"
) -> dict:
    """
    Detect beats in an audio file.

    Args:
        audio_source: File path or audio bytes
        difficulty: easy/medium/hard/expert

    Returns:
        {
            "tempo": float,
            "difficulty": str,
            "min_gap_ms": int,
            "beats": [{"time": float, "type": int}, ...],
            "duration": float
        }
    """
    # Load audio
    if isinstance(audio_source, bytes):
        # Write to temp file for librosa
        import tempfile
        with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as f:
            f.write(audio_source)
            temp_path = f.name
        y, sr = librosa.load(temp_path)
        Path(temp_path).unlink()  # Clean up
    else:
        y, sr = librosa.load(str(audio_source))

    duration = librosa.get_duration(y=y, sr=sr)

    # Get main beats (the pulse)
    tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
    beat_times = set(librosa.frames_to_time(beat_frames, sr=sr))

    # Get all onsets (note attacks)
    onset_frames = librosa.onset.onset_detect(y=y, sr=sr)
    onset_times = librosa.frames_to_time(onset_frames, sr=sr)

    # Categorize: if onset is near a beat -> type 1, else -> type 2
    beats = []
    tolerance = 0.05  # 50ms tolerance

    for t in onset_times:
        is_main_beat = any(abs(t - bt) < tolerance for bt in beat_times)
        beat_type = 1 if is_main_beat else 2
        # Round to 3 decimal places (millisecond precision - sufficient for rhythm games)
        beats.append({"time": round(float(t), 3), "type": beat_type})

    # Sort by time
    beats.sort(key=lambda x: x["time"])

    # Apply difficulty filter
    min_gap = config.DIFFICULTY_GAPS.get(difficulty, 0.18)
    beats = _filter_by_min_gap(beats, min_gap)

    # Handle numpy types
    tempo_val = float(tempo) if not isinstance(tempo, np.ndarray) else float(tempo[0])

    return {
        "tempo": round(tempo_val, 1),
        "difficulty": difficulty,
        "min_gap_ms": int(min_gap * 1000),
        "beats": beats,
        "duration": round(float(duration), 2),
        "beat_count": len(beats),
    }


def _filter_by_min_gap(beats: list, min_gap: float) -> list:
    """
    Filter beats to ensure minimum time gap between them.
    When two beats are too close, keeps type 1 over type 2.
    """
    if not beats:
        return beats

    result = [beats[0]]
    for beat in beats[1:]:
        gap = beat["time"] - result[-1]["time"]

        if gap >= min_gap:
            result.append(beat)
        else:
            # Prefer type 1 over type 2
            if beat["type"] == 1 and result[-1]["type"] == 2:
                result[-1] = beat

    return result
