@component
export class Note extends BaseScriptComponent {
    // 这些属性由 NoteSpawner 在生成时赋值，所以不需要 @input
    public targetBeat: number = 0; 
    public conductor: any; 

    // 这个可以在 Inspector 里调整下落速度
    // 2D 模式下建议设为 10 到 15 之间
    @input
    speed: number = 15.0; 

    onAwake() {
        // 🚨 关键：必须绑定 UpdateEvent，否则 onUpdate 永远不会执行！
        this.createEvent("UpdateEvent").bind(this.onUpdate.bind(this));
    }

    onUpdate() {
        // 安全检查：如果没有指挥家，我就不知道时间，就不动
        if (!this.conductor) return;

        // 1. 获取时间差
        // currentBeat 随音乐增加，所以 beatDiff 会越来越小，直到变成 0 (击中)，然后变成负数 (错过)
        const currentBeat = this.conductor.currentBeat;
        const beatDiff = this.targetBeat - currentBeat;

        // 2. 计算 Y 轴高度 (Height)
        // 还没到时间时，beatDiff 是正数，Y 是正数 (在上方)
        const yPos = beatDiff * this.speed;

        // 3. 获取当前的 X 轴位置 (保持轨道不变)
        const transform = this.getTransform();
        const currentX = transform.getLocalPosition().x;

        // 4. 应用新位置 (注意：这是 2D 模式，改 Y 轴)
        transform.setLocalPosition(new vec3(currentX, yPos, 0));

        // 5. 自动销毁 (垃圾回收)
        // 当音符掉到屏幕下方太远的地方 (比如 y = -20)，就隐藏它，节省性能
        if (yPos < -20.0) {
            this.getSceneObject().enabled = false;
        }
    }
}