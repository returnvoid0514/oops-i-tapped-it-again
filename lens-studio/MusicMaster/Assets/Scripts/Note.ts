@component
export class Note extends BaseScriptComponent {
    public targetBeat: number = 0;
    public conductor: any;
    public noteId: number = 0; // Unique ID for debugging

    @input
    speed: number = 15.0;

    @input
    normalColor: vec4 = new vec4(0.3, 0.5, 1.0, 1.0); // Blue - ready to hit

    @input
    tooEarlyColor: vec4 = new vec4(1.0, 0.8, 0.2, 0.6); // Yellow/orange - not yet ready

    @input
    expiredColor: vec4 = new vec4(0.5, 0.5, 0.5, 0.4); // Dim gray - too late

    @input
    hitLineY: number = -10.0; // Y position of hit line (set this in inspector or via code)

    private imagePass: Pass | null = null;
    private currentState: string = "tooEarly"; // "tooEarly", "ready", "expired"
    private materialCloned: boolean = false;

    // Zone boundaries (calculated from hitLineY)
    private scoreableZoneTop: number = 0;
    private scoreableZoneBottom: number = 0;

    onAwake() {
        this.setupVisualComponent();
        this.createEvent("UpdateEvent").bind(this.onUpdate.bind(this));
    }

    // Try to find and setup the visual component for color changes
    private setupVisualComponent(): void {
        if (this.imagePass && this.materialCloned) return; // Already set up

        const sceneObj = this.getSceneObject();

        // Try Image component first
        let visualComponent = sceneObj.getComponent("Component.Image") as any;

        // Try RenderMeshVisual if Image not found
        if (!visualComponent) {
            visualComponent = sceneObj.getComponent("Component.RenderMeshVisual") as any;
        }

        // Try looking in children
        if (!visualComponent && sceneObj.getChildrenCount() > 0) {
            for (let i = 0; i < sceneObj.getChildrenCount(); i++) {
                const child = sceneObj.getChild(i);
                visualComponent = child.getComponent("Component.Image") as any;
                if (visualComponent) break;
                visualComponent = child.getComponent("Component.RenderMeshVisual") as any;
                if (visualComponent) break;
            }
        }

        if (visualComponent) {
            // Clone the material for independent color control
            if (visualComponent.mainMaterial && !this.materialCloned) {
                const clonedMaterial = visualComponent.mainMaterial.clone();
                visualComponent.mainMaterial = clonedMaterial;
                this.materialCloned = true;
            }
            this.imagePass = visualComponent.mainPass;
        }
    }

    // Called when note is re-enabled from pool - reset state
    public resetAppearance(): void {
        // Reset to initial state - actual color will be set by updateAppearanceByPosition
        this.currentState = "tooEarly";

        // Ensure visual component is set up
        if (!this.imagePass) {
            this.setupVisualComponent();
        }

        // Set initial color (will be updated in onUpdate based on position)
        if (this.imagePass) {
            this.imagePass.baseColor = this.tooEarlyColor;
        }
    }

    // Called when note enters the scoreable zone - ready to hit
    public markAsReady(): void {
        if (this.currentState !== "tooEarly") return; // Only transition from too early

        this.currentState = "ready";

        if (!this.imagePass) {
            this.setupVisualComponent();
        }

        if (this.imagePass) {
            this.imagePass.baseColor = this.normalColor;
        }
    }

    // Called when note passes the hittable zone - too late to score
    public markAsExpired(): void {
        if (this.currentState === "expired") return; // Already expired

        this.currentState = "expired";

        // Retry setup if not done yet
        if (!this.imagePass) {
            this.setupVisualComponent();
        }

        if (this.imagePass) {
            this.imagePass.baseColor = this.expiredColor;
        }
    }

    public getIsExpired(): boolean {
        return this.currentState === "expired";
    }

    public getIsTooEarly(): boolean {
        return this.currentState === "tooEarly";
    }

    public getCurrentState(): string {
        return this.currentState;
    }

    onUpdate() {
        // Only update if note is enabled
        if (!this.getSceneObject().enabled) {
            return;
        }

        if (!this.conductor) {
            // Conductor will be set before note is enabled, so this should rarely happen
            print(`⚠️ Note at ${this.getTransform().getLocalPosition().y.toFixed(1)} has no conductor!`);
            return;
        }

        const currentBeat = this.conductor.currentBeat;
        const beatDiff = this.targetBeat - currentBeat;

        const yPos = beatDiff * this.speed;

        const transform = this.getTransform();
        const currentX = transform.getLocalPosition().x;

        transform.setLocalPosition(new vec3(currentX, yPos, 0));

        // Update appearance based on Y position
        this.updateAppearanceByPosition(yPos);

        if (yPos < -20.0) {
            this.getSceneObject().enabled = false;
        }
    }

    // Update note color based on its position relative to hit line
    private updateAppearanceByPosition(yPos: number): void {
        // Calculate zone boundaries (6 units from hit line for scoreable zone)
        const scoreableTop = this.hitLineY + 6.0;
        const scoreableBottom = this.hitLineY - 6.0;

        let newState = this.currentState;

        if (yPos < scoreableBottom) {
            // Below scoreable zone - expired (gray)
            newState = "expired";
        } else if (yPos <= scoreableTop) {
            // Inside scoreable zone - ready (blue)
            newState = "ready";
        } else {
            // Above scoreable zone - too early (yellow)
            newState = "tooEarly";
        }

        // Only update if state changed
        if (newState !== this.currentState) {
            this.currentState = newState;
            this.applyColorForState();
        }
    }

    // Apply the appropriate color for the current state
    private applyColorForState(): void {
        if (!this.imagePass) {
            this.setupVisualComponent();
        }

        if (this.imagePass) {
            switch (this.currentState) {
                case "tooEarly":
                    this.imagePass.baseColor = this.tooEarlyColor;
                    break;
                case "ready":
                    this.imagePass.baseColor = this.normalColor;
                    break;
                case "expired":
                    this.imagePass.baseColor = this.expiredColor;
                    break;
            }
        }
    }
}
