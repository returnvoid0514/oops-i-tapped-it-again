#!/usr/bin/env python3
"""
Beat Map Generator for Rhythm Game
Analyzes an MP3 file and generates a beat map in the game's JSON format.

Usage:
    python generate_beatmap.py <input.mp3> [output.json] [--difficulty LEVEL]
    python generate_beatmap.py <input.mp3> --typescript  # Output directly to SongLibrary.ts

Example:
    python generate_beatmap.py song.mp3 beatmap.json --difficulty medium
    python generate_beatmap.py song.mp3 --typescript --difficulty hard
"""

import argparse
import json
import sys
from pathlib import Path

import librosa
import numpy as np


def detect_beats_and_onsets(audio_path: str) -> dict:
    """
    Analyze audio file and extract beat/onset information.

    Returns dict with:
        - y: audio time series
        - sr: sample rate
        - tempo: detected BPM
        - beat_times: array of beat times in seconds
        - onset_times: array of onset times in seconds
        - onset_strengths: strength of each onset
    """
    print(f"Loading audio: {audio_path}")
    y, sr = librosa.load(audio_path)
    duration = librosa.get_duration(y=y, sr=sr)
    print(f"Duration: {duration:.2f}s, Sample rate: {sr}Hz")

    # Detect tempo and beats
    tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
    beat_times = librosa.frames_to_time(beat_frames, sr=sr)

    # Handle numpy array tempo (newer librosa versions)
    if isinstance(tempo, np.ndarray):
        tempo = float(tempo[0])
    else:
        tempo = float(tempo)

    print(f"Detected tempo: {tempo:.1f} BPM")
    print(f"Detected {len(beat_times)} main beats")

    # Detect onsets (note attacks) - more granular than beats
    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    onset_frames = librosa.onset.onset_detect(
        y=y, sr=sr, onset_envelope=onset_env, backtrack=True
    )
    onset_times = librosa.frames_to_time(onset_frames, sr=sr)
    onset_strengths = onset_env[onset_frames] if len(onset_frames) > 0 else np.array([])

    print(f"Detected {len(onset_times)} onsets")

    return {
        "y": y,
        "sr": sr,
        "tempo": tempo,
        "duration": duration,
        "beat_times": beat_times,
        "onset_times": onset_times,
        "onset_strengths": onset_strengths,
    }


def assign_lanes_by_frequency(y, sr, onset_times, onset_frames=None) -> list:
    """
    Assign lanes (0, 1, 2) based on spectral centroid at each onset.
    Uses the "brightness" of the sound to determine lane:
    - Lane 0: Low/dark sounds (bass, kick)
    - Lane 1: Mid-range sounds (vocals, guitar)
    - Lane 2: High/bright sounds (hi-hats, cymbals)
    """
    if len(onset_times) == 0:
        return []

    # Compute spectral centroid (center of mass of spectrum)
    # Higher values = brighter/higher pitched sounds
    centroid = librosa.feature.spectral_centroid(y=y, sr=sr)[0]

    # Get centroid values at each onset time
    onset_centroids = []
    for t in onset_times:
        frame = librosa.time_to_frames(t, sr=sr)
        if frame >= len(centroid):
            frame = len(centroid) - 1
        onset_centroids.append(centroid[frame])

    onset_centroids = np.array(onset_centroids)

    # Use percentiles to divide into 3 lanes (adaptive to the song)
    if len(onset_centroids) > 0:
        p33 = np.percentile(onset_centroids, 33)
        p66 = np.percentile(onset_centroids, 66)
    else:
        return []

    lanes = []
    for c in onset_centroids:
        if c < p33:
            lanes.append(0)  # Low
        elif c < p66:
            lanes.append(1)  # Mid
        else:
            lanes.append(2)  # High

    return lanes


def assign_lanes_hybrid(y, sr, onset_times, beat_times) -> list:
    """
    Hybrid approach: combines frequency analysis with musical structure.
    - Main beats (downbeats) go to lane 1 (center) for emphasis
    - Off-beats are assigned by frequency (spectral centroid)
    - Ensures good distribution across all lanes
    """
    if len(onset_times) == 0:
        return []

    # Get frequency-based lanes first
    freq_lanes = assign_lanes_by_frequency(y, sr, onset_times)

    # Identify main beats
    beat_set = set(np.round(beat_times, 2))

    lanes = []
    lane_counts = [0, 0, 0]  # Track distribution

    for i, t in enumerate(onset_times):
        t_rounded = round(t, 2)
        is_main_beat = any(abs(t_rounded - bt) < 0.05 for bt in beat_set)

        if is_main_beat:
            # Main beats go to center lane for emphasis
            lane = 1
        else:
            # Use frequency-based assignment
            lane = freq_lanes[i] if i < len(freq_lanes) else 1

            # Rebalance if one lane is getting too many notes
            total = sum(lane_counts) + 1
            if total > 3:
                expected = total / 3
                # If this lane has too many, try to shift
                if lane_counts[lane] > expected * 1.5:
                    # Find the least used lane
                    min_lane = lane_counts.index(min(lane_counts))
                    lane = min_lane

        lanes.append(lane)
        lane_counts[lane] += 1

    return lanes


def assign_lanes_rhythmic(onset_times, beat_times, tempo) -> list:
    """
    Assign lanes based on rhythmic position within the measure.
    Creates natural patterns that feel musical:
    - Beat 1 (downbeat): Lane 1 (center)
    - Beat 2: Lane 0 (left)
    - Beat 3: Lane 1 (center)
    - Beat 4: Lane 2 (right)
    - Off-beats: Alternate based on position
    """
    if len(onset_times) == 0:
        return []

    beats_per_second = tempo / 60.0
    lanes = []

    for t in onset_times:
        # Convert to beat number
        beat_num = t * beats_per_second

        # Get position within a 4-beat measure (0-3.99...)
        measure_pos = beat_num % 4

        # Determine if it's on a beat or off-beat
        beat_fraction = measure_pos % 1
        is_on_beat = beat_fraction < 0.1 or beat_fraction > 0.9

        if is_on_beat:
            # On main beats: use measure position
            beat_in_measure = int(round(measure_pos)) % 4
            if beat_in_measure == 0:  # Beat 1 (downbeat)
                lane = 1
            elif beat_in_measure == 1:  # Beat 2
                lane = 0
            elif beat_in_measure == 2:  # Beat 3
                lane = 1
            else:  # Beat 4
                lane = 2
        else:
            # Off-beats: alternate pattern
            eighth_note = int(measure_pos * 2) % 4
            lane = [0, 2, 0, 2][eighth_note]

        lanes.append(lane)

    return lanes


def assign_lanes_distributed(onset_times, beat_times) -> list:
    """
    Assign lanes in a distributed pattern for variety.
    Main beats get lane 1 (center), others alternate 0 and 2.
    """
    lanes = []
    beat_set = set(np.round(beat_times, 2))
    alt = 0

    for t in onset_times:
        t_rounded = round(t, 2)
        # Check if this onset is on a main beat
        is_main_beat = any(abs(t_rounded - bt) < 0.05 for bt in beat_set)

        if is_main_beat:
            lanes.append(1)  # Center lane for main beats
        else:
            lanes.append(0 if alt == 0 else 2)  # Alternate sides
            alt = 1 - alt

    return lanes


def time_to_beat_number(time_seconds: float, tempo: float, offset: float = 0) -> float:
    """Convert time in seconds to beat number."""
    beats_per_second = tempo / 60.0
    beat = (time_seconds - offset) * beats_per_second
    return round(beat, 2)


def to_camel_case(name: str) -> str:
    """Convert song name to CamelCase for variable name."""
    words = ''.join(c if c.isalnum() or c == ' ' else ' ' for c in name).split()
    return ''.join(word.capitalize() for word in words)


def generate_typescript(beatmap: dict) -> str:
    """Generate SongLibrary.ts content from beatmap data."""
    song_name = beatmap.get("songName", "Unknown")
    bpm = beatmap.get("bpm", 120)
    offset = beatmap.get("offset", 0.0)
    notes = beatmap.get("notes", [])

    var_name = f"Song_{to_camel_case(song_name)}"

    # Generate notes array
    notes_lines = []
    for note in notes:
        beat = note.get("beat", 0)
        lane = note.get("lane", 1)
        notes_lines.append(f"        {{ beat: {beat}, lane: {lane} }}")

    notes_str = ",\n".join(notes_lines)

    return f'''// Song chart data definitions
// Generated with: python tools/generate_beatmap.py

export interface SongChartData {{
    songName: string;
    bpm: number;
    offset: number;
    // Lane values: 0 = Left, 1 = Center, 2 = Right
    notes: Array<{{ beat: number; lane: number }}>;
}}

// Current Song: {song_name}
// BPM: {bpm}, Notes: {len(notes)}
export const {var_name}: SongChartData = {{
    songName: "{song_name}",
    bpm: {bpm},
    offset: {offset},
    notes: [
{notes_str}
    ]
}};

// Master list of all available songs
export const AllSongs: SongChartData[] = [
    {var_name}
];
'''


def filter_notes_by_spacing(notes: list, min_gap: float = 1.0) -> list:
    """
    Filter notes to ensure minimum spacing between consecutive notes.

    Args:
        notes: List of note dicts with 'beat' key
        min_gap: Minimum gap in beats between notes (default: 1.0)

    Returns:
        Filtered list of notes with at least min_gap beats between each
    """
    if not notes:
        return notes

    # Sort by beat
    notes = sorted(notes, key=lambda x: x["beat"])

    filtered = [notes[0]]
    for note in notes[1:]:
        gap = note["beat"] - filtered[-1]["beat"]
        if gap >= min_gap:
            filtered.append(note)

    return filtered


def filter_notes_by_difficulty(notes: list, difficulty: str, tempo: float) -> list:
    """
    Filter notes based on difficulty level.
    Higher difficulty = more notes, smaller gaps allowed.
    """
    # Minimum gap in beats between notes
    min_gaps = {
        "easy": 2.0,      # One note per 2 beats
        "medium": 1.0,    # One note per beat max
        "hard": 0.5,      # Two notes per beat max
        "expert": 0.25,   # Four notes per beat max
    }

    min_gap = min_gaps.get(difficulty, 1.0)
    return filter_notes_by_spacing(notes, min_gap)


def detect_long_notes(onset_times, onset_strengths, tempo, min_duration_beats=0.5) -> list:
    """
    Detect potential long/held notes based on sustained energy.
    Returns list of (start_beat, end_beat) tuples for long notes.
    """
    # Simple heuristic: if gap between onsets is large and strength is high,
    # it might be a sustained note
    long_notes = []

    if len(onset_times) < 2:
        return long_notes

    beats_per_second = tempo / 60.0

    for i in range(len(onset_times) - 1):
        gap_seconds = onset_times[i + 1] - onset_times[i]
        gap_beats = gap_seconds * beats_per_second

        # If gap is significant and onset is strong, mark as potential long note
        if gap_beats >= min_duration_beats * 2:
            if i < len(onset_strengths) and onset_strengths[i] > np.median(onset_strengths):
                start_beat = onset_times[i] * beats_per_second
                end_beat = start_beat + min_duration_beats
                long_notes.append((round(start_beat, 2), round(end_beat, 2)))

    return long_notes


def generate_beatmap(
    audio_path: str,
    song_name: str = None,
    difficulty: str = None,
    lane_mode: str = "hybrid",  # "hybrid", "frequency", "rhythmic", or "distributed"
    include_long_notes: bool = True,
    offset: float = 0.0,
    min_spacing: float = None,  # Minimum beats between notes (overrides difficulty)
    end_buffer_beats: float = 3.0,  # Buffer beats before song end (notes need time to scroll off)
) -> dict:
    """
    Generate a complete beat map from an audio file.

    Args:
        audio_path: Path to MP3 file
        song_name: Name for the song (defaults to filename)
        difficulty: easy/medium/hard/expert (ignored if min_spacing is set)
        lane_mode: Lane assignment strategy
            - "hybrid": Combines frequency analysis with musical structure (recommended)
            - "frequency": Based on spectral centroid (sound brightness)
            - "rhythmic": Based on position in musical measure
            - "distributed": Simple alternating pattern
        include_long_notes: Whether to detect and include long notes
        offset: Time offset in seconds before first beat
        min_spacing: Minimum beats between notes (overrides difficulty if set)

    Returns:
        Beat map dict in game format
    """
    audio_path = Path(audio_path)
    if song_name is None:
        song_name = audio_path.stem

    # Analyze audio
    analysis = detect_beats_and_onsets(str(audio_path))
    tempo = analysis["tempo"]
    onset_times = analysis["onset_times"]
    beat_times = analysis["beat_times"]

    # Assign lanes based on selected mode
    if lane_mode == "hybrid":
        lanes = assign_lanes_hybrid(
            analysis["y"], analysis["sr"], onset_times, beat_times
        )
    elif lane_mode == "frequency":
        lanes = assign_lanes_by_frequency(
            analysis["y"], analysis["sr"], onset_times
        )
    elif lane_mode == "rhythmic":
        lanes = assign_lanes_rhythmic(onset_times, beat_times, tempo)
    else:  # distributed
        lanes = assign_lanes_distributed(onset_times, beat_times)

    # Detect long notes
    long_note_ranges = []
    if include_long_notes:
        long_note_ranges = detect_long_notes(
            onset_times, analysis["onset_strengths"], tempo
        )

    # Convert to game format
    notes = []
    long_note_starts = {r[0] for r in long_note_ranges}
    long_note_map = {r[0]: r[1] for r in long_note_ranges}

    for i, (t, lane) in enumerate(zip(onset_times, lanes)):
        beat_num = time_to_beat_number(t, tempo, offset)

        if beat_num < 0:
            continue  # Skip notes before offset

        note = {
            "beat": beat_num,
            "lane": lane,
        }

        # Check if this is a long note
        if beat_num in long_note_starts:
            note["isLongNote"] = True
            note["endBeat"] = long_note_map[beat_num]

        notes.append(note)

    # Filter by spacing (explicit min_spacing takes priority over difficulty)
    if min_spacing is not None:
        notes = filter_notes_by_spacing(notes, min_spacing)
    elif difficulty:
        notes = filter_notes_by_difficulty(notes, difficulty, tempo)
    else:
        # Default: 1.5 beat spacing
        notes = filter_notes_by_spacing(notes, 1.5)

    # Filter out notes too close to song end (they won't have time to scroll off screen)
    max_beat = (analysis["duration"] * tempo) / 60.0
    cutoff_beat = max_beat - end_buffer_beats
    notes = [n for n in notes if n["beat"] <= cutoff_beat]

    # Build final beat map
    beatmap = {
        "songName": song_name,
        "bpm": round(tempo, 1),
        "offset": offset,
        "notes": notes,
    }

    # Count lane distribution
    lane_counts = [0, 0, 0]
    for note in notes:
        lane_counts[note["lane"]] += 1

    # Determine what spacing was used for display
    if min_spacing is not None:
        spacing_info = f"{min_spacing} beats (custom)"
    elif difficulty:
        spacing_map = {"easy": 2.0, "medium": 1.0, "hard": 0.5, "expert": 0.25}
        spacing_info = f"{spacing_map.get(difficulty, 1.0)} beats ({difficulty})"
    else:
        spacing_info = "1.5 beats (default)"

    print(f"\nGenerated beat map:")
    print(f"  Song: {song_name}")
    print(f"  BPM: {tempo:.1f}")
    print(f"  Min spacing: {spacing_info}")
    print(f"  Lane mode: {lane_mode}")
    print(f"  Total notes: {len(notes)}")
    print(f"  Long notes: {sum(1 for n in notes if n.get('isLongNote'))}")
    print(f"  Lane distribution: L0={lane_counts[0]}, L1={lane_counts[1]}, L2={lane_counts[2]}")

    return beatmap


def main():
    parser = argparse.ArgumentParser(
        description="Generate beat map from MP3 for rhythm game"
    )
    parser.add_argument("input", help="Input MP3 file path")
    parser.add_argument("output", nargs="?", help="Output JSON file path (optional)")
    parser.add_argument(
        "--difficulty", "-d",
        choices=["easy", "medium", "hard", "expert"],
        default="medium",
        help="Difficulty level (default: medium)"
    )
    parser.add_argument(
        "--name", "-n",
        help="Song name (default: filename)"
    )
    parser.add_argument(
        "--lane-mode", "-l",
        choices=["hybrid", "frequency", "rhythmic", "distributed"],
        default="hybrid",
        help="Lane assignment mode: hybrid (recommended), frequency, rhythmic, distributed (default: hybrid)"
    )
    parser.add_argument(
        "--offset", "-o",
        type=float,
        default=0.0,
        help="Time offset in seconds (default: 0)"
    )
    parser.add_argument(
        "--no-long-notes",
        action="store_true",
        help="Disable long note detection"
    )
    parser.add_argument(
        "--spacing", "-s",
        type=float,
        default=None,
        help="Minimum spacing between notes in beats (overrides difficulty). Example: 1.5 means at least 1.5 beats between notes"
    )
    parser.add_argument(
        "--typescript", "-ts",
        action="store_true",
        help="Output directly to SongLibrary.ts instead of JSON"
    )
    parser.add_argument(
        "--end-buffer",
        type=float,
        default=3.0,
        help="Buffer beats before song end - notes within this range are excluded (default: 3.0)"
    )

    args = parser.parse_args()

    # Validate input
    input_path = Path(args.input)
    if not input_path.exists():
        print(f"Error: Input file not found: {args.input}")
        sys.exit(1)

    # Generate beat map
    beatmap = generate_beatmap(
        audio_path=args.input,
        song_name=args.name,
        difficulty=args.difficulty,
        lane_mode=args.lane_mode,
        include_long_notes=not args.no_long_notes,
        offset=args.offset,
        min_spacing=args.spacing,
        end_buffer_beats=args.end_buffer,
    )

    # Output
    tools_dir = Path(__file__).parent
    repo_root = tools_dir.parent

    # Always save JSON to output.json (or specified path)
    json_path = Path(args.output) if args.output else tools_dir / "output.json"
    with open(json_path, "w") as f:
        json.dump(beatmap, f, indent=2)
    print(f"\nSaved JSON to: {json_path}")

    # If --typescript, also output to SongLibrary.ts
    if args.typescript:
        ts_path = repo_root / "lens-studio" / "OopsITappedItAgain" / "Assets" / "Scripts" / "SongLibrary.ts"
        ts_content = generate_typescript(beatmap)
        with open(ts_path, "w") as f:
            f.write(ts_content)
        print(f"Saved TypeScript to: {ts_path}")


if __name__ == "__main__":
    main()
