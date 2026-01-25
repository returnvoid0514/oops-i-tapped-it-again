// Song chart data definitions
// Each song has: name, bpm, offset, and notes array
//
// TODO: Implement random song selection feature
// - Set up SongManager.ts to randomly pick from AllSongs array
// - Configure audio tracks in Lens Studio Inspector to match song order
// - See SongManager.ts for implementation details

export interface SongChartData {
    songName: string;
    bpm: number;
    offset: number;
    // Lane values: 0 = Left, 1 = Center, 2 = Right
    notes: Array<{ beat: number; lane: number }>;
}

// Song 1: Test and Rehearsal
// Lane values: 0 = Left, 1 = Center, 2 = Right
export const Song_TestAndRehearsal: SongChartData = {
    songName: "Test and Rehearsal",
    bpm: 120,
    offset: 0.0,
    notes: [
        { beat: 4.0, lane: 1 },
        { beat: 6.0, lane: 0 },
        { beat: 8.0, lane: 2 },
        { beat: 10.0, lane: 1 },
        { beat: 12.0, lane: 0 },
        { beat: 14.0, lane: 2 },
        { beat: 16.0, lane: 1 },
        { beat: 18.0, lane: 0 },
        { beat: 20.0, lane: 1 },
        { beat: 22.0, lane: 2 },
        { beat: 24.0, lane: 0 },
        { beat: 26.0, lane: 1 },
        { beat: 28.0, lane: 0 },
        { beat: 30.0, lane: 2 },
        { beat: 32.0, lane: 1 },
        { beat: 34.0, lane: 0 },
        { beat: 36.0, lane: 2 },
        { beat: 38.0, lane: 1 },
        { beat: 40.0, lane: 0 },
        { beat: 42.0, lane: 1 },
        { beat: 44.0, lane: 2 },
        { beat: 46.0, lane: 0 },
        { beat: 48.0, lane: 1 },
        { beat: 50.0, lane: 2 },
        { beat: 52.0, lane: 1 },
        { beat: 54.0, lane: 0 },
        { beat: 56.0, lane: 2 },
        { beat: 58.0, lane: 1 },
        { beat: 60.0, lane: 0 },
        { beat: 62.0, lane: 1 },
        { beat: 64.0, lane: 2 }
    ]
};

// Add more songs here following the same pattern:
// export const Song_YourSongName: SongChartData = { ... };

// Master list of all available songs (for random selection)
export const AllSongs: SongChartData[] = [
    Song_TestAndRehearsal
    // Add more songs to this array
];
