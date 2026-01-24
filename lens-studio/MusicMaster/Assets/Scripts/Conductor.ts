@component
export class Conductor extends BaseScriptComponent {
    @input
    audioTrack: AudioComponent;

    @input
    bpm: number = 120;

    @input
    offset: number = 0;

    // Optional: Text to show "TAP TO START" - assign in Inspector
    @input
    startText: Text;

    public currentSongPosition: number = 0;
    public currentBeat: number = 0;
    private lastSampleTime: number = 0;

    // Game starts when user taps
    public isGameStarted: boolean = false;

    onAwake() {
        if (!this.audioTrack) {
            print("Error: Please assign AudioComponent in Inspector");
            return;
        }

        this.createEvent("UpdateEvent").bind(this.onUpdate.bind(this));

        // Show start text if assigned
        if (this.startText) {
            this.startText.text = "TAP TO START";
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

        // Hide start text
        if (this.startText) {
            const textObj = this.startText.getSceneObject();
            if (textObj) {
                textObj.enabled = false;
            }
        }

        // Start the music
        this.audioTrack.play(1);
        print("🎵 Game started!");
    }

    onUpdate() {
        if (!this.audioTrack.isPlaying()) return;

        this.currentSongPosition = this.audioTrack.position - this.offset;

        this.currentBeat = (this.currentSongPosition * this.bpm) / 60;

    }

    public getBeatError(targetBeat: number): number {
        return Math.abs(this.currentBeat - targetBeat);
    }
}