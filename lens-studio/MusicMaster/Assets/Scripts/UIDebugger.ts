// UI Component Debugger
// This script helps diagnose why UI elements are not visible
// Attach this to any SceneObject and assign the UI component you want to debug

@component
export class UIDebugger extends BaseScriptComponent {
    @input
    targetText: Text; // The Text component to debug

    @input
    targetSceneObject: SceneObject; // The SceneObject containing the Text

    @input
    mainCamera: Camera; // Reference to the main camera

    onAwake() {
        print("═══════════════════════════════════════");
        print("🔍 UI DEBUGGER STARTED");
        print("═══════════════════════════════════════");

        // Create update event to continuously monitor
        this.createEvent("UpdateEvent").bind(this.onUpdate.bind(this));

        // Run initial diagnosis
        this.runDiagnosis();
    }

    private frameCount = 0;
    onUpdate() {
        this.frameCount++;

        // Log every 60 frames (approximately 1 second at 60fps)
        if (this.frameCount % 60 === 0) {
            this.runDiagnosis();
        }
    }

    private runDiagnosis() {
        print("\n📋 UI DIAGNOSIS REPORT:");
        print("─────────────────────────────────────");

        // 1. Check if Text component exists
        if (!this.targetText) {
            print("❌ ERROR: targetText is NULL!");
            print("   → Please assign a Text component in Inspector");
            return;
        }
        print("✅ Text component found");

        // 2. Check Text properties
        print(`📝 Text content: "${this.targetText.text}"`);
        print(`   Enabled: ${this.targetText.enabled}`);

        // 3. Check SceneObject
        if (!this.targetSceneObject) {
            print("⚠️ WARNING: targetSceneObject not assigned");
        } else {
            print(`🎬 SceneObject: ${this.targetSceneObject.name}`);
            print(`   Enabled: ${this.targetSceneObject.enabled}`);
            print(`   Layer: ${this.targetSceneObject.layer}`);

            // Get transform info
            const transform = this.targetSceneObject.getTransform();
            const pos = transform.getWorldPosition();
            const scale = transform.getWorldScale();

            print(`   World Position: (${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)})`);
            print(`   World Scale: (${scale.x.toFixed(2)}, ${scale.y.toFixed(2)}, ${scale.z.toFixed(2)})`);
        }

        // 4. Check Camera
        if (!this.mainCamera) {
            print("⚠️ WARNING: mainCamera not assigned");
        } else {
            print(`📷 Camera info:`);
            print(`   Enabled: ${this.mainCamera.enabled}`);
            print(`   Render Layers: ${this.mainCamera.renderLayer}`);

            if (this.targetSceneObject) {
                const objectLayer = this.targetSceneObject.layer;
                const cameraLayers = this.mainCamera.renderLayer;

                print(`   Object Layer: ${objectLayer}`);
                print(`   Camera Render Layers: ${cameraLayers}`);

                // Note: Layer compatibility check
                // If object layer doesn't match camera render layers, it won't be visible
                // Common fix: Change object to Layer 0 or Layer 1 (default layers)
            }
        }

        // 5. Check Screen Transform (if exists)
        if (this.targetSceneObject) {
            const screenTransform = this.targetSceneObject.getComponent("Component.ScreenTransform");
            if (screenTransform) {
                print(`📐 Screen Transform found`);
                // Screen transform exists - this is good for UI
            } else {
                print(`⚠️ No Screen Transform found`);
                print(`   💡 This might be okay if using world-space UI`);
            }
        }

        print("─────────────────────────────────────");
        print("💡 COMMON FIXES:");
        print("1. Make sure object Layer matches Camera render layers");
        print("2. Check if text color contrasts with background");
        print("3. Verify object is not behind camera (z position)");
        print("4. Ensure text is not empty");
        print("5. Check if parent objects are enabled");
        print("═══════════════════════════════════════\n");
    }

    // Helper function to manually test text update
    public testTextUpdate() {
        if (this.targetText) {
            this.targetText.text = "TEST " + Date.now();
            print(`🧪 Test: Updated text to "${this.targetText.text}"`);
        }
    }
}
