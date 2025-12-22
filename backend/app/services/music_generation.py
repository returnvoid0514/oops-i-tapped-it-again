"""
Music Generation Service
Generates AI music using MusicGen via Replicate API.
Includes mock mode for local testing.
"""

import os
import httpx
from pathlib import Path
from typing import Optional

from app.config import config


class MusicGenerationService:
    """
    Generates music using MusicGen.

    Modes:
    - mock: Returns a sample audio file (for local testing)
    - replicate: Calls Replicate API (for production)
    """

    def __init__(self, mode: str = "auto"):
        """
        Args:
            mode: "mock", "replicate", or "auto"
                  "auto" uses replicate if API token is set, else mock
        """
        if mode == "auto":
            self.mode = "replicate" if config.REPLICATE_API_TOKEN else "mock"
        else:
            self.mode = mode

        self.sample_audio_path = config.DATA_DIR / "sample.mp3"

    def generate(
        self,
        prompt: str,
        duration: int = 15,
    ) -> bytes:
        """
        Generate music from a text prompt.

        Args:
            prompt: Text description of the music
            duration: Duration in seconds (max 30)

        Returns:
            Audio bytes (MP3 format)
        """
        if self.mode == "mock":
            return self._generate_mock(prompt, duration)
        else:
            return self._generate_replicate(prompt, duration)

    def _generate_mock(self, prompt: str, duration: int) -> bytes:
        """
        Mock generation - returns sample audio file.
        For local testing without API calls.
        """
        if not self.sample_audio_path.exists():
            raise FileNotFoundError(
                f"Sample audio not found at {self.sample_audio_path}\n"
                f"Please add a sample.mp3 file to {config.DATA_DIR} for local testing.\n"
                f"Or set REPLICATE_API_TOKEN to use real AI generation."
            )

        with open(self.sample_audio_path, "rb") as f:
            return f.read()

    def _generate_replicate(self, prompt: str, duration: int) -> bytes:
        """
        Real generation using Replicate API (MusicGen).
        """
        import replicate

        # MusicGen model on Replicate
        model = "meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043ac92924f3db7e40b4d90b0f94"

        output = replicate.run(
            model,
            input={
                "prompt": prompt,
                "duration": min(duration, 30),  # Max 30 seconds
                "model_version": "stereo-melody-large",
                "output_format": "mp3",
                "normalization_strategy": "peak",
            }
        )

        # Output is a URL to the generated audio
        audio_url = output

        # Download the audio
        response = httpx.get(audio_url)
        response.raise_for_status()

        return response.content


# Default instance
music_service = MusicGenerationService()
