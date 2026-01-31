import { HitZoneManager } from "./HitZoneManager";
import { Conductor } from "./Conductor";
import { NoteSpawner } from "./NoteSpawner";

// This script detects when the song ends and displays the final score
// Attach this to a scene object and assign the HitZoneManager and AudioComponent in Inspector

@component
export class SongEndDetector extends BaseScriptComponent {
    @input
    hitZoneManager: HitZoneManager;

    @input
    audioComponent: AudioComponent;

    @input
    conductor: Conductor; // Reference to Conductor to check game state

    @input
    songDuration: number = 60.0; // Duration in seconds, or set to 0 to auto-detect

    @input
    leaderboard: ScriptComponent; // Reference to Leaderboard Component

    @input
    @allowUndefined
    noteSpawner: NoteSpawner; // Reference to NoteSpawner to check if all notes are done

    private hasEnded: boolean = false;
    private songFinished: boolean = false; // Audio has stopped
    private gameStartTime: number = 0;
    private wasGameStarted: boolean = false;

    // Minimum time (seconds) before checking if song ended - prevents false trigger on startup
    private readonly MIN_PLAY_TIME: number = 3.0;

    onAwake() {
        if (!this.hitZoneManager) {
            return;
        }

        if (!this.audioComponent) {
            return;
        }

        this.createEvent("UpdateEvent").bind(this.onUpdate.bind(this));
    }

    onUpdate() {
        if (this.hasEnded) return;

        // Don't check for song end until game has started
        if (this.conductor && !this.conductor.isGameStarted) {
            return;
        }

        // Track when game started for duration check
        if (!this.wasGameStarted) {
            this.wasGameStarted = true;
            this.gameStartTime = getTime();
        }

        const elapsed = getTime() - this.gameStartTime;

        // Check if audio has stopped playing (only after minimum play time to avoid race condition)
        if (elapsed >= this.MIN_PLAY_TIME && this.audioComponent && !this.audioComponent.isPlaying()) {
            this.songFinished = true;
        }

        // Or check if duration has been reached (if specified)
        if (this.songDuration > 0 && elapsed >= this.songDuration) {
            this.songFinished = true;
        }

        // Only end song when audio is done AND all notes have been processed
        if (this.songFinished) {
            // If we have a NoteSpawner reference, wait for all notes to be done
            if (this.noteSpawner) {
                if (this.noteSpawner.areAllNotesDone()) {
                    this.endSong();
                }
            } else {
                // No NoteSpawner reference, just end immediately
                this.endSong();
            }
        }
    }

    private endSong() {
        if (this.hasEnded) return;

        this.hasEnded = true;
        print("Song ended! Displaying final score...");

        // Submit score to leaderboard
        this.hitZoneManager.showFinalScore();

        // Show leaderboard after 2 second delay
        var delayEvent = this.createEvent("DelayedCallbackEvent");
        delayEvent.bind(() => {
            if (this.leaderboard) {
                (this.leaderboard as any).show();
                print("Showing leaderboard");
            }
        });
        delayEvent.reset(2.0);
    }

    // Public method to manually trigger score display (e.g., for testing)
    public showScore() {
        if (this.hitZoneManager) {
            this.hitZoneManager.showFinalScore();
        }
    }
}
