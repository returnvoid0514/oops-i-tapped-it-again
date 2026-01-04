@component
export class HitLineFeedback extends BaseScriptComponent {
    @input
    normalColor: vec4 = new vec4(1, 1, 1, 0.5); // Semi-transparent white

    @input
    hitColor: vec4 = new vec4(0, 1, 0, 1); // Bright green

    @input
    flashDuration: number = 0.1; // seconds

    private imagePass: Pass | null = null;
    private isFlashing: boolean = false;
    private flashTimer: number = 0;

    onAwake() {
        // Get the Image component's main pass
        const imageComponent = this.getSceneObject().getComponent("Component.Image");
        if (imageComponent) {
            this.imagePass = imageComponent.mainPass;
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
