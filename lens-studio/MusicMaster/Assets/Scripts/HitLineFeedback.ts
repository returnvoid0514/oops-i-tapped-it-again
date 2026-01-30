@component
export class HitLineFeedback extends BaseScriptComponent {
    @input
    normalColor: vec4 = new vec4(1, 1, 1, 1); // Original texture (no tint)

    @input
    hitColor: vec4 = new vec4(0, 1, 0, 1); // Default hit color (fallback)

    @input
    emptyTapColor: vec4 = new vec4(0.5, 0.5, 0.5, 0.7); // Dim gray for empty taps

    // Score-based colors for Mario ? block
    @input
    perfectColor: vec4 = new vec4(1.0, 0.6, 0.0, 1.0); // Orange

    @input
    greatColor: vec4 = new vec4(0.0, 0.9, 0.3, 1.0); // Green

    @input
    goodColor: vec4 = new vec4(0.6, 0.35, 0.1, 1.0); // Brown

    @input
    missColor: vec4 = new vec4(1.0, 0.2, 0.2, 1.0); // Red

    @input
    flashDuration: number = 0.1; // seconds

    private imagePass: Pass | null = null;
    private isFlashing: boolean = false;
    private flashTimer: number = 0;

    onAwake() {
        // Get the Image component and clone its material for independent color control
        const imageComponent = this.getSceneObject().getComponent("Component.Image") as any;
        if (imageComponent) {
            // Clone the material so each hit line has its own independent copy
            // This prevents all hit lines from changing color when one is hit
            if (imageComponent.mainMaterial) {
                const clonedMaterial = imageComponent.mainMaterial.clone();
                imageComponent.mainMaterial = clonedMaterial;
                this.imagePass = imageComponent.mainPass;
            } else {
                // Fallback if mainMaterial not available
                this.imagePass = imageComponent.mainPass;
            }

            if (this.imagePass) {
                this.imagePass.baseColor = this.normalColor;
            }
        }

        this.createEvent("UpdateEvent").bind(this.onUpdate.bind(this));
    }

    public flash() {
        if (!this.imagePass) return;

        this.isFlashing = true;
        this.flashTimer = 0;
        this.imagePass.baseColor = this.hitColor;
    }

    // Flash with color based on hit quality (Perfect/Great/Good/Miss)
    public flashWithQuality(quality: string) {
        if (!this.imagePass) return;

        this.isFlashing = true;
        this.flashTimer = 0;

        switch (quality) {
            case "Perfect!":
                this.imagePass.baseColor = this.perfectColor;
                break;
            case "Great!":
                this.imagePass.baseColor = this.greatColor;
                break;
            case "Good":
                this.imagePass.baseColor = this.goodColor;
                break;
            case "Miss":
                this.imagePass.baseColor = this.missColor;
                break;
            default:
                this.imagePass.baseColor = this.hitColor;
        }
    }

    // Flash with dimmer color for empty taps (no note present)
    public flashEmpty() {
        if (!this.imagePass) return;

        this.isFlashing = true;
        this.flashTimer = 0;
        this.imagePass.baseColor = this.emptyTapColor;
    }

    private onUpdate() {
        if (!this.isFlashing || !this.imagePass) return;

        this.flashTimer += getDeltaTime();

        if (this.flashTimer >= this.flashDuration) {
            // Flash complete, return to normal color
            this.imagePass.baseColor = this.normalColor;
            this.isFlashing = false;
        }
    }
}
