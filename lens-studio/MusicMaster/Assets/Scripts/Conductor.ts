@component
export class Conductor extends BaseScriptComponent {
    // 在 Inspector 面板中配置参数
    @input
    audioTrack: AudioComponent;

    @input
    bpm: number = 120;

    @input
    offset: number = 0; // 用于手动校准音频延迟

    public currentSongPosition: number = 0;
    public currentBeat: number = 0;
    private lastSampleTime: number = 0;

    onAwake() {
        if (!this.audioTrack) {
            print("Error: 请在 Inspector 中分配 AudioComponent");
            return;
        }
        
        // 游戏开始
        this.createEvent("UpdateEvent").bind(this.onUpdate.bind(this));
        this.audioTrack.play(1);
    }

    onUpdate() {
        if (!this.audioTrack.isPlaying()) return;

        // 1. 获取当前音频播放的精确秒数
        // Lens Studio 的 position 属性提供高精度音频同步
        this.currentSongPosition = this.audioTrack.position - this.offset;

        // 2. 将秒数转换为节拍数 (Beat)
        // 每一拍的长度 = 60 / BPM
        this.currentBeat = (this.currentSongPosition * this.bpm) / 60;

        // 3. 广播给其他系统（例如音符生成器或UI动画）
        // 这里的 logic 可以根据 currentBeat 来触发特定动作
    }

    // 提供给音符脚本调用的工具函数：计算音符与当前拍子的差距
    public getBeatError(targetBeat: number): number {
        return Math.abs(this.currentBeat - targetBeat);
    }
}
