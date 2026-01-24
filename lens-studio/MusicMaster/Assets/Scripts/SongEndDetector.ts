import { HitZoneManager } from "./HitZoneManager";
import { GameStateManager } from "./GameStateManager";

// This script detects when the song ends and triggers the game end state
// Attach this to a scene object and assign the required components in Inspector

@component
export class SongEndDetector extends BaseScriptComponent {
    @input
    hitZoneManager: HitZoneManager;

    @input
    audioComponent: AudioComponent;

    @input
    gameStateManager: GameStateManager;

    @input
    songDuration: number = 60.0; // Duration in seconds, or set to 0 to auto-detect

    private hasEnded: boolean = false;
    private startTime: number = 0;
    private isActive: boolean = false;

    onAwake() {
        if (!this.hitZoneManager) {
            print("SongEndDetector: Please assign HitZoneManager in Inspector!");
            return;
        }

        if (!this.audioComponent) {
            print("SongEndDetector: Please assign AudioComponent in Inspector!");
            return;
        }

        this.createEvent("UpdateEvent").bind(this.onUpdate.bind(this));

        print("SongEndDetector initialized");
    }

    onUpdate() {
        // Only check for song end when game is active
        if (!this.isActive || this.hasEnded) return;

        // Check if audio has stopped playing
        if (this.audioComponent && !this.audioComponent.isPlaying()) {
            this.endSong();
            return;
        }

        // Or check if duration has been reached (if specified)
        if (this.songDuration > 0) {
            const elapsed = getTime() - this.startTime;
            if (elapsed >= this.songDuration) {
                this.endSong();
                return;
            }
        }
    }

    private endSong() {
        if (this.hasEnded) return;

        this.hasEnded = true;
        print("\nSong ended! Triggering game end state...\n");

        // Notify GameStateManager to handle the end state
        if (this.gameStateManager) {
            this.gameStateManager.onSongEnd();
        } else {
            // Fallback: directly show final score if no GameStateManager
            this.hitZoneManager.showFinalScore();
        }
    }

    // Reset detector state - called by GameStateManager
    public reset(): void {
        this.hasEnded = false;
        this.startTime = getTime();
        this.isActive = true;
        print("SongEndDetector: Reset and activated");
    }

    // Public method to manually trigger score display (e.g., for testing)
    public showScore() {
        if (this.hitZoneManager) {
            this.hitZoneManager.showFinalScore();
        }
    }
}
