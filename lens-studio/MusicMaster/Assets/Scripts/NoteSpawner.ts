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
    @input
    hitLineY: number = -10.0; // Y position of hit line (match this to your hit line objects)

    public pool: SceneObject[] = [];
    private poolSize: number = 30;

    private notesQueue: any[] = [];

    private nextSpawnBeat: number = 0;

    // Counter for unique note IDs
    private noteIdCounter: number = 0;

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

            // Assign unique note ID
            this.noteIdCounter++;
            const noteId = this.noteIdCounter;
            noteScript["noteId"] = noteId;

            // Set properties BEFORE enabling to avoid conductor reference warning
            noteScript["targetBeat"] = beat;
            noteScript["conductor"] = this.conductor;
            noteScript["hitLineY"] = this.hitLineY; // Pass hit line position for color zones

            // Reset note appearance (in case it was expired from previous use)
            const noteScriptAny = noteScript as any;
            if (noteScriptAny.resetAppearance) {
                noteScriptAny.resetAppearance();
            }

            // Lane positions: -1 = left (-15), 0 = center (0), 1 = right (15)
            const xPos = lane * 15.0; // Spread notes across wider screen area
            noteObj.getTransform().setLocalPosition(new vec3(xPos, 100, 0));

            // Enable note AFTER all properties are set
            noteObj.enabled = true;

            // Log spawn with ID
            const laneName = lane === -1 ? "Left" : (lane === 0 ? "Center" : "Right");
            print(`🎵 SPAWN Note #${noteId} → Lane ${laneName} (X=${xPos}), Beat ${beat.toFixed(2)}`);
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
        let songData: any = null;

        // Try to load from JSON asset first (if assigned in Inspector)
        if (this.songDataAsset) {
            songData = this.loadFromJsonAsset();
        }

        // Fall back to hardcoded TypeScript data
        if (!songData) {
            print("📂 Using fallback TypeScript data");
            songData = SongData;
        }

        // Load notes into queue
        if (songData && songData.notes) {
            this.notesQueue = [...songData.notes];

            if (this.conductor) {
                this.conductor.bpm = songData.bpm || 120;
                this.conductor.offset = songData.offset || 0;
            }

            print("✅ Chart loaded successfully! Note count: " + this.notesQueue.length);
            print(`   BPM: ${songData.bpm}, Offset: ${songData.offset}`);
        } else {
            print("❌ Error: No valid song data found!");
        }
    }

    private loadFromJsonAsset(): any {
        if (!this.songDataAsset) {
            return null;
        }

        const asset = this.songDataAsset as any;

        // Try different ways to access JSON data from the asset
        try {
            // Method 1: Direct JSON property (for JsonAsset types)
            if (asset.json !== undefined) {
                print("📂 Loaded song data from JSON asset (.json property)");
                return asset.json;
            }

            // Method 2: Text property that needs parsing (for TextAsset types)
            if (asset.text !== undefined) {
                const parsed = JSON.parse(asset.text);
                print("📂 Loaded song data from JSON asset (.text property)");
                return parsed;
            }

            // Method 3: Some assets expose data directly
            if (asset.notes !== undefined) {
                print("📂 Loaded song data from JSON asset (direct properties)");
                return asset;
            }

            print("⚠️ songDataAsset assigned but couldn't read data from it");
            return null;
        } catch (e) {
            print("❌ Error parsing JSON asset: " + e);
            return null;
        }
    }
}
