@component
export class Conductor extends BaseScriptComponent {
    @input
    audioTrack: AudioComponent;

    @input
    bpm: number = 120;

    @input
    offset: number = 0;

    // Optional: Image to show start button - assign in Inspector
    @input
    startButton: Image;

    public currentSongPosition: number = 0;
    public currentBeat: number = 0;
    private lastSampleTime: number = 0;

    // Game starts when user taps
    public isGameStarted: boolean = false;

    // Track when audio ends to continue beat counting
    private audioEnded: boolean = false;
    private audioEndTime: number = 0;
    private lastAudioPosition: number = 0;

    onAwake() {
        if (!this.audioTrack) {
            print("Error: Please assign AudioComponent in Inspector");
            return;
        }

        this.createEvent("UpdateEvent").bind(this.onUpdate.bind(this));

        // Show start button if assigned
        if (this.startButton) {
            this.startButton.getSceneObject().enabled = true;
        }

        // Listen for tap to start game
        this.createEvent("TouchStartEvent").bind(this.onTouchStart.bind(this));
    }

    private onTouchStart(eventData: TouchStartEvent) {
        if (!this.isGameStarted) {
            this.startGame();
        }
    }

    private startGame() {
        this.isGameStarted = true;

        // Hide start button
        if (this.startButton) {
            this.startButton.getSceneObject().enabled = false;
        }

        // Start the music
        this.audioTrack.play(1);
        print("🎵 Game started!");
    }

    onUpdate() {
        if (!this.isGameStarted) return;

        if (this.audioTrack.isPlaying()) {
            // Audio is playing - use audio position
            this.currentSongPosition = this.audioTrack.position - this.offset;
            this.lastAudioPosition = this.currentSongPosition;
        } else if (!this.audioEnded && this.lastAudioPosition > 0) {
            // Audio just ended - mark the time
            this.audioEnded = true;
            this.audioEndTime = getTime();
        } else if (this.audioEnded) {
            // Audio ended - continue counting based on elapsed time
            const elapsedSinceEnd = getTime() - this.audioEndTime;
            this.currentSongPosition = this.lastAudioPosition + elapsedSinceEnd;
        } else {
            return; // Game started but audio hasn't played yet
        }

        this.currentBeat = (this.currentSongPosition * this.bpm) / 60;
    }

    public getBeatError(targetBeat: number): number {
        return Math.abs(this.currentBeat - targetBeat);
    }
}