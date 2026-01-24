@component
export class Conductor extends BaseScriptComponent {
    @input
    audioTrack: AudioComponent;

    @input
    bpm: number = 120;

    @input
    offset: number = 0;
    public currentSongPosition: number = 0;
    public currentBeat: number = 0;
    private lastSampleTime: number = 0;

    onAwake() {
        if (!this.audioTrack) {
            print("Error: Please assign AudioComponent in Inspector");
            return;
        }

        this.createEvent("UpdateEvent").bind(this.onUpdate.bind(this));
        // Removed auto-play - game now starts via GameStateManager
    }

    onUpdate() {
        if (!this.audioTrack.isPlaying()) return;

        this.currentSongPosition = this.audioTrack.position - this.offset;

        this.currentBeat = (this.currentSongPosition * this.bpm) / 60;
    }

    public getBeatError(targetBeat: number): number {
        return Math.abs(this.currentBeat - targetBeat);
    }

    // Start audio playback
    public play(): void {
        if (this.audioTrack) {
            this.audioTrack.play(1);
            print("Conductor: Audio playback started");
        }
    }

    // Stop audio playback
    public stop(): void {
        if (this.audioTrack) {
            this.audioTrack.stop(true);
            print("Conductor: Audio playback stopped");
        }
    }

    // Reset to beginning
    public reset(): void {
        if (this.audioTrack) {
            this.audioTrack.stop(true);
        }
        this.currentSongPosition = 0;
        this.currentBeat = 0;
        this.lastSampleTime = 0;
        print("Conductor: Reset to beginning");
    }

    // Check if audio is currently playing
    public isPlaying(): boolean {
        return this.audioTrack ? this.audioTrack.isPlaying() : false;
    }
}