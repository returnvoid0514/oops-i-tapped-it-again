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
            print("Error: 请在 Inspector 中分配 AudioComponent");
            return;
        }
        
        this.createEvent("UpdateEvent").bind(this.onUpdate.bind(this));
        this.audioTrack.play(1);
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