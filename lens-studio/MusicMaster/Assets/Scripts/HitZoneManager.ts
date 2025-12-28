import { Conductor } from "./Conductor";

@component
export class HitZoneManager extends BaseScriptComponent {
    @input
    conductor: Conductor;

    @input
    noteSpawnerObject: SceneObject; // Reference to the NoteSpawner's scene object

    // Hit line references (assign in Lens Studio Inspector)
    @input
    hitLineLeft: SceneObject;
    @input
    hitLineCenter: SceneObject;
    @input
    hitLineRight: SceneObject;

    @input
    hitWindow: number = 0.25; // Beat tolerance for "perfect" hit

    @input
    camera: Camera; // Reference to the camera

    private lanePositions = [-8.0, 0.0, 8.0]; // Matching NoteSpawner lane positions

    onAwake() {
        // Listen for touch events
        this.createEvent("TouchStartEvent").bind(this.onTouch.bind(this));

        print("✅ HitZoneManager initialized");
    }

    private onTouch(eventData: TapEvent) {
        if (!this.camera) {
            print("❌ Camera not assigned!");
            return;
        }

        // Get touch position in screen space
        const touchPos = eventData.getTouchPosition();

        // Determine which lane was touched
        const lane = this.getLaneFromTouch(touchPos);

        if (lane !== -1) {
            this.checkNoteHit(lane);
        }
    }

    private getLaneFromTouch(touchPos: vec2): number {
        // Convert screen touch to world position
        // For a simple 3-lane system, divide screen into thirds
        const screenWidth = 1.0; // Normalized screen width
        const x = touchPos.x;

        if (x < 0.33) {
            return 0; // Left lane
        } else if (x < 0.66) {
            return 1; // Center lane
        } else {
            return 2; // Right lane
        }
    }

    private checkNoteHit(lane: number) {
        const laneIndex = lane - 1; // Convert to -1, 0, 1 for positioning
        const laneXPos = this.lanePositions[lane];

        print(`🎯 Lane ${lane} tapped (x: ${laneXPos})`);

        // Find all active notes in this lane
        const activeNotes = this.getActiveNotesInLane(laneXPos);

        if (activeNotes.length === 0) {
            print("❌ Miss - no note in lane");
            return;
        }

        // Find the closest note to the hit line
        let closestNote = null;
        let closestError = Infinity;

        for (let noteObj of activeNotes) {
            const noteScript = noteObj.getComponent("Component.ScriptComponent") as any;
            if (noteScript && noteScript.targetBeat !== undefined) {
                const error = this.conductor.getBeatError(noteScript.targetBeat);

                if (error < closestError && error < this.hitWindow) {
                    closestError = error;
                    closestNote = noteObj;
                }
            }
        }

        if (closestNote) {
            this.hitNote(closestNote, closestError);
        } else {
            print("❌ Miss - timing off");
        }
    }

    private getActiveNotesInLane(laneXPos: number): SceneObject[] {
        const activeNotes: SceneObject[] = [];

        if (!this.noteSpawnerObject) {
            print("❌ NoteSpawner object not assigned");
            return activeNotes;
        }

        // Get the NoteSpawner component
        const spawnerScript = this.noteSpawnerObject.getComponent("Component.ScriptComponent") as any;

        if (!spawnerScript || !spawnerScript.pool) {
            return activeNotes;
        }

        // Check all pooled notes
        for (let noteObj of spawnerScript.pool) {
            if (noteObj.enabled) {
                const transform = noteObj.getTransform();
                const pos = transform.getLocalPosition();

                // Check if note is in the correct lane (with small tolerance)
                if (Math.abs(pos.x - laneXPos) < 1.0) {
                    // Check if note is near the hit line (Y close to 0)
                    if (Math.abs(pos.y) < 30.0) {
                        activeNotes.push(noteObj);
                    }
                }
            }
        }

        return activeNotes;
    }

    private hitNote(noteObj: SceneObject, error: number) {
        // Determine hit quality
        let quality = "Miss";
        if (error < 0.05) {
            quality = "Perfect!";
        } else if (error < 0.1) {
            quality = "Great!";
        } else if (error < 0.15) {
            quality = "Good";
        } else if (error < this.hitWindow) {
            quality = "OK";
        }

        print(`✨ ${quality} - Error: ${error.toFixed(3)} beats`);

        // Disable the note
        noteObj.enabled = false;

        // TODO: Add visual feedback (particle effect, hit line flash, etc.)
        // TODO: Add score tracking
    }
}
