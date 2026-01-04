import { HitZoneManager } from "./HitZoneManager";

// This script detects when the song ends and displays the final score
// Attach this to a scene object and assign the HitZoneManager and AudioComponent in Inspector

@component
export class SongEndDetector extends BaseScriptComponent {
    @input
    hitZoneManager: HitZoneManager;

    @input
    audioComponent: AudioComponent;

    @input
    songDuration: number = 60.0; // Duration in seconds, or set to 0 to auto-detect

    private hasEnded: boolean = false;
    private startTime: number = 0;

    onAwake() {
        if (!this.hitZoneManager) {
            print("❌ SongEndDetector: Please assign HitZoneManager in Inspector!");
            return;
        }

        if (!this.audioComponent) {
            print("❌ SongEndDetector: Please assign AudioComponent in Inspector!");
            return;
        }

        this.createEvent("UpdateEvent").bind(this.onUpdate.bind(this));
        this.startTime = getTime();

        print("🎵 SongEndDetector initialized");
    }

    onUpdate() {
        if (this.hasEnded) return;

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
        print("\n🎵 Song ended! Displaying final score...\n");

        // Display final score
        this.hitZoneManager.showFinalScore();
    }

    // Public method to manually trigger score display (e.g., for testing)
    public showScore() {
        if (this.hitZoneManager) {
            this.hitZoneManager.showFinalScore();
        }
    }
}
