import { Conductor } from "./Conductor";
import { Note } from "./Note";
import { AllSongs } from "./SongLibrary";

@component
export class NoteSpawner extends BaseScriptComponent {
    @input
    conductor: Conductor;

    @input
    notePrefab: Asset;
    @input
    infiniteMode: boolean = false;
    @input
    spawnInterval: number = 1.0;
    public pool: SceneObject[] = [];
    private poolSize: number = 30;

    private notesQueue: any[] = [];

    private nextSpawnBeat: number = 0;

    // Debug tracking
    private lastDebugBeat: number = -1;

    onAwake() {
        print(`NoteSpawner: Starting on object "${this.getSceneObject().name}"...`);

        if (!this.notePrefab || !this.conductor) {
            print("❌ Error: Please check if NotePrefab and Conductor are assigned!");
            return;
        }

        this.initPool();
        print(`NoteSpawner: Pool initialized with ${this.pool.length} notes`);

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

        // Wait for game to start
        if (!this.conductor.isGameStarted) return;

        const currentBeat = this.conductor.currentBeat;
        const spawnWindow = 8.0;
        if (this.infiniteMode) {
            if (currentBeat + spawnWindow > this.nextSpawnBeat) {
                const randomLane = Math.floor(Math.random() * 3) - 1;
                this.spawnNote(this.nextSpawnBeat, randomLane);

                this.nextSpawnBeat += this.spawnInterval;
            }
        } else {
            // Debug: Log queue status periodically
            if (Math.floor(currentBeat) % 4 === 0 && Math.floor(currentBeat) !== this.lastDebugBeat) {
                this.lastDebugBeat = Math.floor(currentBeat);
                print(`NoteSpawner: Beat ${currentBeat.toFixed(1)}, Queue: ${this.notesQueue.length} notes`);
            }

            if (this.notesQueue.length > 0) {
                if (this.notesQueue[0].beat < currentBeat + spawnWindow) {
                    const noteData = this.notesQueue.shift();

                    const laneIndex = (noteData.lane !== undefined) ? (noteData.lane - 1) : 0;

                    print(`NoteSpawner: Spawning note at beat ${noteData.beat}, lane ${noteData.lane} (index ${laneIndex})`);
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
        // TODO: Implement SongManager for random song selection from multiple songs
        // For now, load first song from SongLibrary directly

        if (AllSongs.length > 0) {
            const song = AllSongs[0];
            this.notesQueue = [...song.notes];

            // Set BPM/offset on conductor
            if (this.conductor) {
                this.conductor.bpm = song.bpm;
                this.conductor.offset = song.offset;
            }

            print(`NoteSpawner: Loaded "${song.songName}" from SongLibrary`);
            print(`  BPM: ${song.bpm}, Notes: ${this.notesQueue.length}`);
        } else {
            this.notesQueue = [];
            print("NoteSpawner: No songs in SongLibrary!");
        }
    }

    // TODO: Add setChartData() method when implementing SongManager for dynamic song loading

    // Reset spawner state (for replay)
    public resetSpawner(): void {
        // Disable all pooled notes
        for (let noteObj of this.pool) {
            noteObj.enabled = false;
        }

        // Reload chart data from SongLibrary
        this.loadStaticData();

        // Reset spawn beat for infinite mode
        if (this.conductor) {
            this.nextSpawnBeat = this.conductor.currentBeat + 2.0;
        }

        print("NoteSpawner: Reset complete");
    }
}
