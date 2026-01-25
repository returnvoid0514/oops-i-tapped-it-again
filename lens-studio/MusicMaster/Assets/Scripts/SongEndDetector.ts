import { HitZoneManager } from "./HitZoneManager";
import { Conductor } from "./Conductor";

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

    private hasEnded: boolean = false;
    private gameStartTime: number = 0;
    private wasGameStarted: boolean = false;

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

        // Check if audio has stopped playing (only after game started)
        if (this.audioComponent && !this.audioComponent.isPlaying()) {
            this.endSong();
            return;
        }

        // Or check if duration has been reached (if specified)
        if (this.songDuration > 0) {
            const elapsed = getTime() - this.gameStartTime;
            if (elapsed >= this.songDuration) {
                this.endSong();
                return;
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
