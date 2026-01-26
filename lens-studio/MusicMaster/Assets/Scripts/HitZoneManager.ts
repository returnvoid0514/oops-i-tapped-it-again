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

    @input
    hitLineY: number = -10.0; // Y position of hit line (MUST match NoteSpawner.hitLineY)

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

    @input
    hitStatusText: Text; // Reference to UI Text component to display hit status (Perfect/Great/Good/Miss)

    // Track which notes have been judged to avoid duplicate miss judgments
    private judgedNotes = new Set<SceneObject>();

    // Timer for auto-hiding hit status text
    private hitStatusTimer: number = 0;
    private readonly HIT_STATUS_DISPLAY_DURATION = 0.55; // How long to show hit status (seconds)

    // Debug: Track touch events
    private touchCount: number = 0;
    private lastTouchTime: number = 0;

    // Cache the NoteSpawner script reference to avoid repeated lookups
    private spawnerScript: any = null;

    // Debug: Track time for periodic diagnostics
    private debugTimer: number = 0;

    onAwake() {
        // Listen for touch events
        this.createEvent("TouchStartEvent").bind(this.onTouch.bind(this));

        // Listen for update events to check for missed notes
        this.createEvent("UpdateEvent").bind(this.onUpdate.bind(this));

        // Initialize combo display
        this.updateComboDisplay();

        // Cache the NoteSpawner script reference once
        this.cacheSpawnerScript();

        print("✅ HitZoneManager initialized");

        // Debug: Log the configured hitLineY and actual hit line object positions
        print(`📍 Configured hitLineY: ${this.hitLineY}`);
        if (this.hitLineLeft) {
            print(`📍 hitLineLeft actual Y: ${this.hitLineLeft.getTransform().getLocalPosition().y}`);
        }
        if (this.hitLineCenter) {
            print(`📍 hitLineCenter actual Y: ${this.hitLineCenter.getTransform().getLocalPosition().y}`);
        }
        if (this.hitLineRight) {
            print(`📍 hitLineRight actual Y: ${this.hitLineRight.getTransform().getLocalPosition().y}`);
        }

        // Initialize hit status text
        if (this.hitStatusText) {
            this.hitStatusText.text = "";
        }
    }

    private cacheSpawnerScript(): void {
        if (!this.noteSpawnerObject) {
            return;
        }

        const allComponents = this.noteSpawnerObject.getComponents("Component.ScriptComponent");
        for (let i = 0; i < allComponents.length; i++) {
            const script = allComponents[i] as any;
            if (script.pool !== undefined) {
                this.spawnerScript = script;
                return;
            }
        }
    }

    private onUpdate() {
        // Check for notes that have passed the hit zone without being hit
        this.checkMissedNotes();

        // Update hit status timer - hide text after duration expires
        if (this.hitStatusTimer > 0) {
            this.hitStatusTimer -= getDeltaTime();
            if (this.hitStatusTimer <= 0 && this.hitStatusText) {
                this.hitStatusText.text = "";
            }
        }

        // Diagnostic disabled for performance - uncomment if debugging needed
        // this.debugTimer += getDeltaTime();
        // if (this.debugTimer >= 5.0) {
        //     this.debugTimer = 0;
        //     this.diagnosticCheck();
        // }
    }

    private diagnosticCheck(): void {
        if (!this.spawnerScript || !this.spawnerScript.pool) {
            return;
        }

        let enabledCount = 0;
        const enabledNotes: string[] = [];
        let stuckNotes: string[] = [];

        for (let noteObj of this.spawnerScript.pool) {
            if (noteObj.enabled) {
                enabledCount++;
                const pos = noteObj.getTransform().getLocalPosition();
                enabledNotes.push(`(${pos.x.toFixed(0)}, ${pos.y.toFixed(0)})`);

                // Check if note has conductor reference
                const noteScript = noteObj.getComponent("Component.ScriptComponent") as any;
                if (!noteScript || !noteScript.conductor) {
                    stuckNotes.push(`(${pos.x.toFixed(0)}, ${pos.y.toFixed(0)}) NO CONDUCTOR`);
                }
            }
        }

        if (enabledCount > 0) {
            print(`🔍 DIAGNOSTIC: ${enabledCount} enabled notes: ${enabledNotes.join(", ")}`);
        }

        if (stuckNotes.length > 0) {
            print(`⚠️ STUCK NOTES DETECTED: ${stuckNotes.join(", ")}`);

            // Force disable stuck notes to prevent them from blocking gameplay
            for (let noteObj of this.spawnerScript.pool) {
                if (noteObj.enabled) {
                    const noteScript = noteObj.getComponent("Component.ScriptComponent") as any;
                    if (!noteScript || !noteScript.conductor) {
                        print(`🔧 Force disabling stuck note at ${noteObj.getTransform().getLocalPosition().y.toFixed(1)}`);
                        noteObj.enabled = false;
                    }
                }
            }
        }
    }

    private updateComboDisplay(): void {
        if (!this.comboText) {
            print("⚠️ updateComboDisplay: comboText is null!");
            return;
        }

        const combo = this.scoreStats.currentCombo;

        let newText = "";
        if (combo < 5) {
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

    private showHitStatus(quality: string): void {
        if (!this.hitStatusText) {
            return;
        }

        // Set text and color based on quality
        switch (quality) {
            case "Perfect!":
                this.hitStatusText.text = "PERFECT!";
                this.hitStatusText.textFill.color = new vec4(1.0, 0.84, 0.0, 1.0); // Gold
                break;
            case "Great!":
                this.hitStatusText.text = "GREAT!";
                this.hitStatusText.textFill.color = new vec4(0.0, 1.0, 0.5, 1.0); // Green
                break;
            case "Good":
                this.hitStatusText.text = "GOOD";
                this.hitStatusText.textFill.color = new vec4(0.3, 0.7, 1.0, 1.0); // Light Blue
                break;
            case "Miss":
                this.hitStatusText.text = "MISS";
                this.hitStatusText.textFill.color = new vec4(1.0, 0.2, 0.2, 1.0); // Red
                break;
            default:
                this.hitStatusText.text = quality;
                this.hitStatusText.textFill.color = new vec4(1.0, 1.0, 1.0, 1.0); // White
        }

        // Reset timer to keep text visible
        this.hitStatusTimer = this.HIT_STATUS_DISPLAY_DURATION;
    }

    private onTouch(eventData: TouchStartEvent) {
        // Debug: Track touch timing
        const currentTime = getTime();
        const timeSinceLastTouch = currentTime - this.lastTouchTime;
        this.touchCount++;
        this.lastTouchTime = currentTime;
        print(`👆 Touch #${this.touchCount} - Gap: ${(timeSinceLastTouch * 1000).toFixed(0)}ms`);

        if (!this.camera) {
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

    // Maximum distance to search for notes when none are in the hit zone
    private readonly EXTENDED_MISS_RANGE = 12.0;

    private checkNoteHit(lane: number) {
        const laneXPos = this.lanePositions[lane];

        // Find all active notes in this lane (already filtered by Y position in getActiveNotesInLane)
        const activeNotes = this.getActiveNotesInLane(laneXPos);
        // Use the configured hitLineY to match Note.ts color zones
        const hitLineY = this.hitLineY;

        // Two-stage search: if no notes in hit zone, search extended range
        if (activeNotes.length === 0) {
            // Stage 2: Search for closest note in the entire lane within extended range
            const extendedResult = this.findClosestNoteInLane(laneXPos, hitLineY, this.EXTENDED_MISS_RANGE);

            if (extendedResult) {
                // Found a note within extended range - judge and remove it
                const noteScript = extendedResult.note.getComponent("Component.ScriptComponent") as any;
                const noteId = noteScript ? (noteScript.noteId || 0) : 0;
                print(`🎯 Extended search found Note #${noteId} at dist=${extendedResult.distance.toFixed(1)}`);
                this.hitNote(extendedResult.note, 0, extendedResult.distance, lane, noteId);
            } else {
                // No note found - show "empty tap" feedback
                this.showEmptyTapFeedback(lane);
            }
            return;
        }

        // Separate notes into "late" (below hit line) and "early" (above/at hit line)
        // Priority: late notes first (most late), then early notes (closest to hit line)
        let lateNotes: { obj: SceneObject, y: number, dist: number, id: number }[] = [];
        let earlyNotes: { obj: SceneObject, y: number, dist: number, id: number }[] = [];

        for (let noteObj of activeNotes) {
            const pos = noteObj.getTransform().getLocalPosition();
            const dist = Math.abs(pos.y - hitLineY);
            const noteScript = noteObj.getComponent("Component.ScriptComponent") as any;
            const noteId = noteScript ? (noteScript.noteId || 0) : 0;
            // Late = below hit line (pos.y < hitLineY)
            // Early = at or above hit line (pos.y >= hitLineY)
            if (pos.y < hitLineY) {
                lateNotes.push({ obj: noteObj, y: pos.y, dist: dist, id: noteId });
            } else {
                earlyNotes.push({ obj: noteObj, y: pos.y, dist: dist, id: noteId });
            }
        }

        // Debug: Log the categorization with note IDs
        if (lateNotes.length > 0 || earlyNotes.length > 0) {
            let lateInfo = lateNotes.map(n => `#${n.id}@${n.y.toFixed(1)}`).join(", ");
            let earlyInfo = earlyNotes.map(n => `#${n.id}@${n.y.toFixed(1)}`).join(", ");
            print(`🎯 Hit check: hitLineY=${hitLineY}, Late[${lateNotes.length}]: ${lateInfo}, Early[${earlyNotes.length}]: ${earlyInfo}`);
        }

        let selectedNote: SceneObject | null = null;
        let selectedDistance = 0;
        let selectedId = 0;

        if (lateNotes.length > 0) {
            // Among late notes, pick the MOST late (lowest Y = farthest below hit line)
            // This rescues the note closest to being auto-missed
            let mostLate = lateNotes[0];
            for (let i = 1; i < lateNotes.length; i++) {
                if (lateNotes[i].y < mostLate.y) {
                    mostLate = lateNotes[i];
                }
            }
            selectedNote = mostLate.obj;
            selectedDistance = mostLate.dist;
            selectedId = mostLate.id;
            print(`   → Selected LATE Note #${mostLate.id} at Y=${mostLate.y.toFixed(1)}`);
        } else if (earlyNotes.length > 0) {
            // Among early notes, pick the CLOSEST to hit line (smallest distance)
            // This is the note about to arrive
            let closest = earlyNotes[0];
            for (let i = 1; i < earlyNotes.length; i++) {
                if (earlyNotes[i].dist < closest.dist) {
                    closest = earlyNotes[i];
                }
            }
            selectedNote = closest.obj;
            selectedDistance = closest.dist;
            selectedId = closest.id;
            print(`   → Selected EARLY Note #${closest.id} at Y=${closest.y.toFixed(1)} (dist=${closest.dist.toFixed(1)})`);
        }

        if (selectedNote) {
            // Get beat error for scoring
            const noteScript = selectedNote.getComponent("Component.ScriptComponent") as any;
            const targetBeat = noteScript ? noteScript.targetBeat : undefined;
            const beatError = targetBeat !== undefined
                ? this.conductor.getBeatError(targetBeat)
                : 0;

            this.hitNote(selectedNote, beatError, selectedDistance, lane, selectedId);
        }
    }

    // Find the best note to hit in a lane within a maximum distance
    // Priority: late notes (most late first) > early notes (closest to hit line)
    private findClosestNoteInLane(laneXPos: number, hitLineY: number, maxDistance: number): { note: SceneObject, distance: number } | null {
        if (!this.spawnerScript || !this.spawnerScript.pool) {
            return null;
        }

        // Separate into late and early notes, storing Y position for proper sorting
        let lateNotes: { note: SceneObject, distance: number, y: number }[] = [];
        let earlyNotes: { note: SceneObject, distance: number }[] = [];

        for (let noteObj of this.spawnerScript.pool) {
            if (noteObj.enabled) {
                const pos = noteObj.getTransform().getLocalPosition();

                // Check if note is in the correct lane (with small tolerance)
                if (Math.abs(pos.x - laneXPos) < 1.0) {
                    const yDistance = Math.abs(pos.y - hitLineY);

                    // Only consider notes within the max distance
                    if (yDistance < maxDistance) {
                        if (pos.y < hitLineY) {
                            lateNotes.push({ note: noteObj, distance: yDistance, y: pos.y });
                        } else {
                            earlyNotes.push({ note: noteObj, distance: yDistance });
                        }
                    }
                }
            }
        }

        if (lateNotes.length > 0) {
            // Among late notes, pick the MOST late (lowest Y value)
            let mostLate = lateNotes[0];
            for (let i = 1; i < lateNotes.length; i++) {
                if (lateNotes[i].y < mostLate.y) {
                    mostLate = lateNotes[i];
                }
            }
            return { note: mostLate.note, distance: mostLate.distance };
        }

        if (earlyNotes.length > 0) {
            // Among early notes, pick the closest to hit line
            let closest = earlyNotes[0];
            for (let i = 1; i < earlyNotes.length; i++) {
                if (earlyNotes[i].distance < closest.distance) {
                    closest = earlyNotes[i];
                }
            }
            return closest;
        }

        return null;
    }

    private getActiveNotesInLane(laneXPos: number): SceneObject[] {
        const activeNotes: SceneObject[] = [];

        // Use cached spawner script reference
        if (!this.spawnerScript) {
            // Try to cache again if not available
            this.cacheSpawnerScript();
            if (!this.spawnerScript) {
                return activeNotes;
            }
        }

        if (!this.spawnerScript.pool) {
            return activeNotes;
        }

        // Use the configured hitLineY to match Note.ts color zones
        const hitLineY = this.hitLineY;

        // Different ranges for early vs late notes:
        // - Early notes (above hit line): up to 8 units above
        // - Late notes (below hit line): up to miss threshold (8 units below)
        // This ensures late notes are always found for priority selection
        const earlyZoneLimit = hitLineY + 8.0;  // 8 units above
        const lateZoneLimit = hitLineY - 8.0;   // 8 units below (match miss threshold)

        // Check all pooled notes
        for (let noteObj of this.spawnerScript.pool) {
            if (noteObj.enabled) {
                const transform = noteObj.getTransform();
                const pos = transform.getLocalPosition();

                // Check if note is in the correct lane (with small tolerance)
                if (Math.abs(pos.x - laneXPos) < 1.0) {
                    // Check if note is within the appropriate zone
                    // Early notes: pos.y <= earlyZoneLimit (above or at hit line)
                    // Late notes: pos.y >= lateZoneLimit (below hit line but not auto-missed)
                    if (pos.y <= earlyZoneLimit && pos.y >= lateZoneLimit) {
                        activeNotes.push(noteObj);
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
        // Use cached spawner script reference
        if (!this.spawnerScript) {
            // Try to cache again if not available
            this.cacheSpawnerScript();
            if (!this.spawnerScript) {
                return;
            }
        }

        if (!this.spawnerScript.pool) {
            return;
        }

        // Use the configured hitLineY to match Note.ts color zones
        const hitLineY = this.hitLineY;

        // Miss threshold: hitLineY - 8 (auto-miss and disable)
        // Note: Note.ts now handles its own color changes based on position
        const missThreshold = hitLineY - 8.0;

        // Check all pooled notes for auto-miss
        for (let noteObj of this.spawnerScript.pool) {
            if (noteObj.enabled && !this.judgedNotes.has(noteObj)) {
                const transform = noteObj.getTransform();
                const pos = transform.getLocalPosition();

                // If note has passed below the miss threshold, count it as a miss
                if (pos.y < missThreshold) {
                    // Debug: Log which note (and lane) is being auto-missed
                    const noteScript = noteObj.getComponent("Component.ScriptComponent") as any;
                    const noteId = noteScript ? (noteScript.noteId || 0) : 0;
                    const laneIndex = pos.x < -7 ? 0 : (pos.x > 7 ? 2 : 1);
                    const laneName = laneIndex === 0 ? "Left" : (laneIndex === 1 ? "Center" : "Right");
                    print(`🚫 AUTO-MISS: Note #${noteId} at Y=${pos.y.toFixed(1)}, Lane ${laneName} (X=${pos.x.toFixed(0)})`);

                    // Mark this note as judged
                    this.judgedNotes.add(noteObj);

                    // Count as miss and break combo
                    this.scoreStats.miss++;
                    this.resetCombo();

                    // Show miss status on screen
                    this.showHitStatus("Miss");

                    // Move note off-screen before disabling
                    transform.setLocalPosition(new vec3(0, 1000, 0));

                    // Disable the note
                    noteObj.enabled = false;

                    // Clean up the judged note from our tracking set when it's disabled
                    // (Note will be re-enabled when spawned again, so we remove it from set)
                    this.judgedNotes.delete(noteObj);
                }
            }
        }
    }

    private hitNote(noteObj: SceneObject, beatError: number, yDistance: number, lane: number, noteId: number = 0): void {
        // Mark this note as judged to prevent auto-miss
        this.judgedNotes.add(noteObj);

        // Determine hit quality ONLY based on Y distance (visual accuracy)
        // Miss if Y distance is too far (beyond Good range)
        let quality = "Miss";
        let shouldDisableNote = false;
        let pointsEarned = 0;

        // Perfect: Very close to hitline
        if (yDistance < 2.0) {
            quality = "Perfect!";
            shouldDisableNote = true;
            this.scoreStats.perfect++;
            pointsEarned = this.SCORE_VALUES.perfect;
            this.incrementCombo();
        }
        // Great: Close to hitline
        else if (yDistance < 4.0) {
            quality = "Great!";
            shouldDisableNote = true;
            this.scoreStats.great++;
            pointsEarned = this.SCORE_VALUES.great;
            this.incrementCombo();
        }
        // Good: Moderately close
        else if (yDistance < 6.0) {
            quality = "Good";
            shouldDisableNote = true;
            this.scoreStats.good++;
            pointsEarned = this.SCORE_VALUES.good;
            this.incrementCombo();
        }
        // Miss: Too far from hitline
        else {
            quality = "Miss";
            shouldDisableNote = true;
            this.scoreStats.miss++;
            pointsEarned = this.SCORE_VALUES.miss;
            this.resetCombo();
        }

        this.scoreStats.totalScore += pointsEarned;

        // Show hit status on screen
        this.showHitStatus(quality);

        print(`   ✓ Note #${noteId} → ${quality} (distance: ${yDistance.toFixed(1)})`);

        // Disable the note and make it visually disappear
        if (shouldDisableNote) {
            // Move note off-screen immediately for instant visual feedback
            const transform = noteObj.getTransform();
            transform.setLocalPosition(new vec3(0, 1000, 0));

            // Disable the note
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

    // Show feedback when tapping with no note present
    private showEmptyTapFeedback(lane: number): void {
        // Flash the hit line with a dimmer effect to show tap was registered
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
            if (feedbackScript && feedbackScript.flashEmpty) {
                // Use a different flash for empty taps (dimmer/different color)
                feedbackScript.flashEmpty();
            } else if (feedbackScript && feedbackScript.flash) {
                // Fall back to regular flash if flashEmpty not available
                feedbackScript.flash();
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
