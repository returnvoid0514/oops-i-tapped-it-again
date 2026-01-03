import { Conductor } from "./Conductor";
import { SongData } from "./TestSongData";
import { Note } from "./Note";

@component
export class NoteSpawner extends BaseScriptComponent {
    @input
    conductor: Conductor;

    @input
    notePrefab: Asset;
    @input
    infiniteMode: boolean = false;
    @input
    songDataAsset: Asset;
    @input
    spawnInterval: number = 1.0;
    public pool: SceneObject[] = [];
    private poolSize: number = 30;
    
    private notesQueue: any[] = [];
    
    private nextSpawnBeat: number = 0;

    onAwake() {
        if (!this.notePrefab || !this.conductor) {
            print("❌ Error: 请检查 NotePrefab 和 Conductor 是否分配！");
            return;
        }

        this.initPool();

        if (this.infiniteMode) {
            print("🚀 启动模式: 无限随机生成 (Infinite Mode)");
            this.nextSpawnBeat = this.conductor.currentBeat + 2.0;
        } else {
            print("📂 启动模式: 读取 谱面");
            this.loadStaticData();
        }

        this.createEvent("UpdateEvent").bind(this.onUpdate.bind(this));
    }

    private onUpdate() {
        if (!this.conductor) return;

        const currentBeat = this.conductor.currentBeat;
        const spawnWindow = 8.0;
        if (this.infiniteMode) {
            if (currentBeat + spawnWindow > this.nextSpawnBeat) {
                const randomLane = Math.floor(Math.random() * 3) - 1;
                this.spawnNote(this.nextSpawnBeat, randomLane);

                this.nextSpawnBeat += this.spawnInterval;
            }
        } else {
            if (this.notesQueue.length > 0) {
                if (this.notesQueue[0].beat < currentBeat + spawnWindow) {
                    const noteData = this.notesQueue.shift();
                    
                    const laneIndex = (noteData.lane !== undefined) ? (noteData.lane - 1) : 0;
                    
                    this.spawnNote(noteData.beat, laneIndex);
                }
            }
        }
    }

    private spawnNote(beat: number, lane: number) {
        const noteObj = this.pool.find(obj => !obj.enabled);

        if (noteObj) {
            noteObj.enabled = true;

            const noteScript = noteObj.getComponent("Component.ScriptComponent");
            if (noteScript) {
                noteScript["targetBeat"] = beat;
                noteScript["conductor"] = this.conductor;

                const xPos = lane * 8.0;
                noteObj.getTransform().setLocalPosition(new vec3(xPos, 100, 0));
            }
        }
    }

    private initPool() {
        const prefab = this.notePrefab as any;
        for (let i = 0; i < this.poolSize; i++) {
            const instance = prefab.instantiate(this.getSceneObject());
            instance.enabled = false;
            this.pool.push(instance);
        }
    }


    private loadStaticData() {
        this.notesQueue = [...SongData.notes];
        
        if (this.conductor) {
            this.conductor.bpm = SongData.bpm;
            this.conductor.offset = SongData.offset;
        }
        
        print("✅ 谱面加载成功！音符数: " + this.notesQueue.length);
    }

    private inspectAsset(obj: any) {
    print("----- 🕵️‍♂️ 侦探模式启动 -----");
    
    if (!obj) {
        print("❌ 结果: 对象是 null 或 undefined");
        return;
    }
    if (obj.constructor) {
        print("🏷️ 真实类型 (Class Name): " + obj.constructor.name);
    }
    print("🔍 属性探测:");
    print("   - has .text? " + (obj.text !== undefined));
    print("   - has .json? " + (obj.json !== undefined));
    
    if (obj.text) {
        print("📄 .text 内容预览: " + obj.text.toString().substring(0, 50) + "...");
    }
    
    if (obj.json) {
        print("📦 .json 对象预览: " + JSON.stringify(obj.json).substring(0, 50) + "...");
    }
    
    print("----------------------------");
}
}
