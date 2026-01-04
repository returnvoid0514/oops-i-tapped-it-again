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

    // Lane positions should match visual hit line positions in the scene
    // With camera size 20, visible range is ~-20 to +20
    // To make lanes span most of the screen, use wider spacing
    private lanePositions = [-15.0, 0.0, 15.0]; // Spread lanes across screen width

    // Score tracking
    private scoreStats = {
        perfect: 0,
        great: 0,
        good: 0,
        miss: 0,
        totalScore: 0,
        currentCombo: 0,
        maxCombo: 0
    };

    private readonly SCORE_VALUES = {
        perfect: 100,
        great: 70,
        good: 40,
        miss: 0
    };

    @input
    comboText: Text; // Reference to UI Text component to display combo

    // Track which notes have been judged to avoid duplicate miss judgments
    private judgedNotes = new Set<SceneObject>();

    onAwake() {
        // Listen for touch events
        this.createEvent("TouchStartEvent").bind(this.onTouch.bind(this));

        // Listen for update events to check for missed notes
        this.createEvent("UpdateEvent").bind(this.onUpdate.bind(this));

        // Initialize combo display
        this.updateComboDisplay();

        print("✅ HitZoneManager initialized");
        print("🎮 Score system ready - Perfect: 100pts, Great: 70pts, Good: 40pts, Miss: 0pts");

        // Check if combo text is assigned
        if (this.comboText) {
            print("🔥 Combo system active! Text component found.");
            print(`📱 ComboText initial text: "${this.comboText.text}"`);
        } else {
            print("⚠️ WARNING: comboText not assigned! Please assign Text component in Inspector.");
        }
    }

    private onUpdate() {
        // Check for notes that have passed the hit zone without being hit
        this.checkMissedNotes();
    }

    private updateComboDisplay(): void {
        if (!this.comboText) {
            print("⚠️ updateComboDisplay: comboText is null!");
            return;
        }

        const combo = this.scoreStats.currentCombo;

        let newText = "";
        if (combo === 0) {
            newText = "";
        } else if (combo < 10) {
            newText = `${combo} COMBO`;
        } else if (combo < 50) {
            newText = `${combo} COMBO!`;
        } else if (combo < 100) {
            newText = `🔥 ${combo} COMBO! 🔥`;
        } else {
            newText = `⭐ ${combo} COMBO!! ⭐`;
        }

        this.comboText.text = newText;
        print(`📺 Combo display updated: "${newText}" (combo=${combo})`);
    }

    private incrementCombo(): void {
        this.scoreStats.currentCombo++;

        // Update max combo if current is higher
        if (this.scoreStats.currentCombo > this.scoreStats.maxCombo) {
            this.scoreStats.maxCombo = this.scoreStats.currentCombo;
        }

        // Update UI
        this.updateComboDisplay();

        // Log milestone combos
        if (this.scoreStats.currentCombo === 10) {
            print("🔥 10 COMBO!");
        } else if (this.scoreStats.currentCombo === 50) {
            print("🔥🔥 50 COMBO!!");
        } else if (this.scoreStats.currentCombo === 100) {
            print("⭐⭐ 100 COMBO!!!");
        }
    }

    private resetCombo(): void {
        if (this.scoreStats.currentCombo > 0) {
            print(`💔 Combo broken! (was ${this.scoreStats.currentCombo}x)`);
        }

        this.scoreStats.currentCombo = 0;
        this.updateComboDisplay();
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

        // Check which lane was hit: 0 = Left, 1 = Center, 2 = Right
        print(`🎯 Checking lane ${lane} (${lane === 0 ? 'Left' : lane === 1 ? 'Center' : 'Right'})`);

        // Find all active notes in this lane (already filtered by Y position in getActiveNotesInLane)
        const activeNotes = this.getActiveNotesInLane(laneXPos);

        if (activeNotes.length === 0) {
            print("❌ Miss - No notes in hit zone");
            return;
        }

        // Find the closest note to the hit line by Y distance
        const hitLineY = this.getHitLineYPosition(laneXPos);
        let closestNote = null;
        let closestDistance = Infinity;

        for (let noteObj of activeNotes) {
            const transform = noteObj.getTransform();
            const pos = transform.getLocalPosition();
            const yDistance = Math.abs(pos.y - hitLineY);

            if (yDistance < closestDistance) {
                closestDistance = yDistance;
                closestNote = noteObj;
            }
        }

        if (closestNote) {
            // Get beat error for scoring
            const noteScript = closestNote.getComponent("Component.ScriptComponent") as any;
            const targetBeat = noteScript ? noteScript.targetBeat : undefined;
            const currentBeat = this.conductor.currentBeat;
            const beatError = targetBeat !== undefined
                ? this.conductor.getBeatError(targetBeat)
                : 0;

            // print(`✅ HIT! Y distance: ${closestDistance.toFixed(2)}, Beat error: ${beatError.toFixed(3)}`);
            this.hitNote(closestNote, beatError, closestDistance, lane);
        } else {
            print("❌ Miss - No valid note found");
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

        // Get the Y position of the hit line to determine hit zone
        const hitLineY = this.getHitLineYPosition(laneXPos);
        const hitZoneHeight = 3.0; // Tolerance for Y position (adjustable)

        // Check all pooled notes
        for (let noteObj of spawnerScript.pool) {
            if (noteObj.enabled) {
                const transform = noteObj.getTransform();
                const pos = transform.getLocalPosition();

                // Check if note is in the correct lane (with small tolerance)
                if (Math.abs(pos.x - laneXPos) < 1.0) {
                    // Check if note is within the hit zone Y range
                    const yDistance = Math.abs(pos.y - hitLineY);
                    if (yDistance < hitZoneHeight) {
                        activeNotes.push(noteObj);
                        // print(`📍 Note found at Y=${pos.y.toFixed(1)}, HitLine Y=${hitLineY.toFixed(1)}, distance=${yDistance.toFixed(1)}`);
                    }
                }
            }
        }

        return activeNotes;
    }

    private getHitLineYPosition(laneXPos: number): number {
        // Determine which hit line to check based on lane position
        let hitLine: SceneObject | null = null;

        if (Math.abs(laneXPos - this.lanePositions[0]) < 0.1) {
            hitLine = this.hitLineLeft;
        } else if (Math.abs(laneXPos - this.lanePositions[1]) < 0.1) {
            hitLine = this.hitLineCenter;
        } else if (Math.abs(laneXPos - this.lanePositions[2]) < 0.1) {
            hitLine = this.hitLineRight;
        }

        if (hitLine) {
            const hitLineTransform = hitLine.getTransform();
            return hitLineTransform.getLocalPosition().y;
        }

        return 0.0; // Default if no hit line found
    }

    private checkMissedNotes(): void {
        if (!this.noteSpawnerObject) {
            return;
        }

        // Get the NoteSpawner script to access the pool
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
            return;
        }

        // Define the miss threshold - notes below this Y position are considered missed
        const missThreshold = -12.0; // Below the hitline (hitline is at -10)

        // Check all pooled notes
        for (let noteObj of spawnerScript.pool) {
            if (noteObj.enabled && !this.judgedNotes.has(noteObj)) {
                const transform = noteObj.getTransform();
                const pos = transform.getLocalPosition();

                // If note has passed below the miss threshold, count it as a miss
                if (pos.y < missThreshold) {
                    // Mark this note as judged
                    this.judgedNotes.add(noteObj);

                    // Count as miss and break combo
                    this.scoreStats.miss++;
                    this.resetCombo();

                    print(`💀 Auto-Miss! Note passed hitzone (Y: ${pos.y.toFixed(2)}) | Total: ${this.scoreStats.totalScore}pts`);

                    // Disable the note
                    noteObj.enabled = false;

                    // Clean up the judged note from our tracking set when it's disabled
                    // (Note will be re-enabled when spawned again, so we remove it from set)
                    this.judgedNotes.delete(noteObj);
                }
            }
        }
    }

    private hitNote(noteObj: SceneObject, beatError: number, yDistance: number, lane: number): void {
        // Mark this note as judged to prevent auto-miss
        this.judgedNotes.add(noteObj);

        // Determine hit quality ONLY based on Y distance (visual accuracy)
        // Miss if Y distance is too far (beyond Good range)
        let quality = "Miss";
        let shouldDisableNote = false;
        let pointsEarned = 0;

        // Perfect: Very close to hitline
        if (yDistance < 0.6) {
            quality = "Perfect!";
            shouldDisableNote = true;
            this.scoreStats.perfect++;
            pointsEarned = this.SCORE_VALUES.perfect;
            this.incrementCombo();
        }
        // Great: Close to hitline
        else if (yDistance < 1.0) {
            quality = "Great!";
            shouldDisableNote = true;
            this.scoreStats.great++;
            pointsEarned = this.SCORE_VALUES.great;
            this.incrementCombo();
        }
        // Good: Moderately close
        else if (yDistance < 1.5) {
            quality = "Good";
            shouldDisableNote = true;
            this.scoreStats.good++;
            pointsEarned = this.SCORE_VALUES.good;
            this.incrementCombo();
        }
        // Miss: Too far from hitline - don't count as a hit
        else {
            quality = "Miss";
            shouldDisableNote = false; // Don't disable the note on miss
            this.scoreStats.miss++;
            pointsEarned = this.SCORE_VALUES.miss;
            this.resetCombo();
        }

        this.scoreStats.totalScore += pointsEarned;

        const comboText = this.scoreStats.currentCombo > 0 ? ` | 🔥 ${this.scoreStats.currentCombo}x` : "";
        print(`✨ Score => ${quality} (+${pointsEarned}pts) | Total: ${this.scoreStats.totalScore}pts${comboText} (Y: ${yDistance.toFixed(2)})`);

        // Only disable the note if it was a successful hit (not Miss)
        if (shouldDisableNote) {
            noteObj.enabled = false;
            // Clean up from judged notes set when disabled
            this.judgedNotes.delete(noteObj);
        }

        // Flash the corresponding hit line only on successful hits
        if (shouldDisableNote) {
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

    // Public method to display final score - can be called when song ends
    public showFinalScore(): void {
        const totalNotes = this.scoreStats.perfect + this.scoreStats.great + this.scoreStats.good + this.scoreStats.miss;
        const hitNotes = this.scoreStats.perfect + this.scoreStats.great + this.scoreStats.good;
        const accuracy = totalNotes > 0 ? (hitNotes / totalNotes * 100) : 0;
        const maxPossibleScore = totalNotes * this.SCORE_VALUES.perfect;
        const scorePercentage = maxPossibleScore > 0 ? (this.scoreStats.totalScore / maxPossibleScore * 100) : 0;

        print("╔════════════════════════════════════╗");
        print("║       🎵 FINAL SCORE 🎵           ║");
        print("╠════════════════════════════════════╣");
        print(`║ Total Score: ${this.scoreStats.totalScore} pts (${scorePercentage.toFixed(1)}%)  `);
        print(`║ Accuracy: ${accuracy.toFixed(1)}%                  `);
        print(`║ Max Combo: 🔥 ${this.scoreStats.maxCombo}x              `);
        print("╠════════════════════════════════════╣");
        print(`║ Perfect!  ⭐ : ${this.scoreStats.perfect} (×100pts)     `);
        print(`║ Great!    ✨ : ${this.scoreStats.great} (×70pts)      `);
        print(`║ Good      👍 : ${this.scoreStats.good} (×40pts)      `);
        print(`║ Miss      ❌ : ${this.scoreStats.miss} (×0pts)       `);
        print("╠════════════════════════════════════╣");
        print(`║ Total Notes: ${totalNotes}                  `);
        print(`║ Max Score: ${maxPossibleScore}                  `);
        print("╚════════════════════════════════════╝");
    }

    // Public method to reset score - useful for restart
    public resetScore(): void {
        this.scoreStats.perfect = 0;
        this.scoreStats.great = 0;
        this.scoreStats.good = 0;
        this.scoreStats.miss = 0;
        this.scoreStats.totalScore = 0;
        this.scoreStats.currentCombo = 0;
        this.scoreStats.maxCombo = 0;
        this.updateComboDisplay();
        print("🔄 Score reset!");
    }
}
