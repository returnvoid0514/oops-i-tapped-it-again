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
            print("❌ Error: Please check if NotePrefab and Conductor are assigned!");
            return;
        }

        this.initPool();

        if (this.infiniteMode) {
            print("🚀 Startup Mode: Infinite Random Generation");
            this.nextSpawnBeat = this.conductor.currentBeat + 2.0;
        } else {
            print("📂 Startup Mode: Loading Chart Data");
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
            const noteScript = noteObj.getComponent("Component.ScriptComponent");
            if (!noteScript) {
                print("⚠️ WARNING: Note has no script component! Cannot spawn.");
                return;
            }

            // Set properties BEFORE enabling to avoid conductor reference warning
            noteScript["targetBeat"] = beat;
            noteScript["conductor"] = this.conductor;

            // Lane positions: -1 = left (-15), 0 = center (0), 1 = right (15)
            const xPos = lane * 15.0; // Spread notes across wider screen area
            noteObj.getTransform().setLocalPosition(new vec3(xPos, 100, 0));

            // Enable note AFTER all properties are set
            noteObj.enabled = true;
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
        
        print("✅ Chart loaded successfully! Note count: " + this.notesQueue.length);
    }

    private inspectAsset(obj: any) {
    print("----- 🕵️‍♂️ Debug Inspector Started -----");

    if (!obj) {
        print("❌ Result: Object is null or undefined");
        return;
    }
    if (obj.constructor) {
        print("🏷️ Actual Type (Class Name): " + obj.constructor.name);
    }
    print("🔍 Property Detection:");
    print("   - has .text? " + (obj.text !== undefined));
    print("   - has .json? " + (obj.json !== undefined));

    if (obj.text) {
        print("📄 .text Content Preview: " + obj.text.toString().substring(0, 50) + "...");
    }

    if (obj.json) {
        print("📦 .json Object Preview: " + JSON.stringify(obj.json).substring(0, 50) + "...");
    }

    print("----------------------------");
}
}
