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

    private onTouch(eventData: TouchStartEvent) {
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
        // For a simple 3-lane system, divide screen into thirds
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
        const laneXPos = this.lanePositions[lane];

        // Find all active notes in this lane
        const activeNotes = this.getActiveNotesInLane(laneXPos);

        if (activeNotes.length === 0) {
            print("❌ Miss");
            return;
        }

        // Find the closest note to the hit line
        let closestNote = null;
        let closestError = Infinity;

        for (let noteObj of activeNotes) {
            const noteScript = noteObj.getComponent("Component.ScriptComponent") as any;
            if (noteScript && noteScript.targetBeat !== undefined) {
                const error = this.conductor.getBeatError(noteScript.targetBeat);

                if (error < closestError) {
                    closestError = error;
                    closestNote = noteObj;
                }
            }
        }

        if (closestNote && closestError < this.hitWindow) {
            this.hitNote(closestNote, closestError, lane);
        } else {
            print("❌ Miss");
        }
    }

    private getActiveNotesInLane(laneXPos: number): SceneObject[] {
        const activeNotes: SceneObject[] = [];

        if (!this.noteSpawnerObject) {
            return activeNotes;
        }

        // Get all script components and find the one with pool
        const allComponents = this.noteSpawnerObject.getComponents("Component.ScriptComponent");
        let spawnerScript: any = null;

        for (let i = 0; i < allComponents.length; i++) {
            const script = allComponents[i] as any;
            if (script.pool !== undefined) {
                spawnerScript = script;
                break;
            }
        }

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
                    // Check timing instead of visual position!
                    const noteScript = noteObj.getComponent("Component.ScriptComponent") as any;
                    if (noteScript && noteScript.targetBeat !== undefined) {
                        const beatError = Math.abs(this.conductor.currentBeat - noteScript.targetBeat);

                        // Only consider notes within a reasonable time window (e.g., 2 beats)
                        if (beatError < 2.0) {
                            activeNotes.push(noteObj);
                        }
                    }
                }
            }
        }

        return activeNotes;
    }

    private hitNote(noteObj: SceneObject, error: number, lane: number) {
        // Determine hit quality (more forgiving standards)
        let quality = "Miss";
        if (error < 0.15) {
            quality = "Perfect!";
        } else if (error < 0.3) {
            quality = "Great!";
        } else if (error < 0.5) {
            quality = "Good";
        } else if (error < this.hitWindow) {
            quality = "OK";
        }

        print(`Score => ${quality}`);

        // Disable the note
        noteObj.enabled = false;

        // Flash the corresponding hit line
        let targetHitLine: SceneObject | null = null;
        if (lane === 0) {
            targetHitLine = this.hitLineLeft;
        } else if (lane === 1) {
            targetHitLine = this.hitLineCenter;
        } else if (lane === 2) {
            targetHitLine = this.hitLineRight;
        }

        if (targetHitLine) {
            const feedbackScript = targetHitLine.getComponent("Component.ScriptComponent") as any;
            if (feedbackScript && feedbackScript.flash) {
                feedbackScript.flash();
            }
        }
    }
}
