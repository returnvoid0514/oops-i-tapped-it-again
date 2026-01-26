@component
export class HitLineFeedback extends BaseScriptComponent {
    @input
    normalColor: vec4 = new vec4(1, 1, 1, 0.5); // Semi-transparent white

    @input
    hitColor: vec4 = new vec4(0, 1, 0, 1); // Bright green for real hits

    @input
    emptyTapColor: vec4 = new vec4(0.5, 0.5, 0.5, 0.7); // Dim gray for empty taps

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
