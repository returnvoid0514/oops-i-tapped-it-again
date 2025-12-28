@component
export class HitLineFeedback extends BaseScriptComponent {
    @input
    normalColor: vec4 = new vec4(1, 1, 1, 0.5); // Semi-transparent white

    @input
    hitColor: vec4 = new vec4(0, 1, 0, 1); // Bright green

    @input
    flashDuration: number = 0.1; // seconds

    private imageMaterial: Material | null = null;
    private isFlashing: boolean = false;
    private flashTimer: number = 0;

    onAwake() {
        // Get the Image component's material
        const imageComponent = this.getSceneObject().getComponent("Component.Image");
        if (imageComponent) {
            this.imageMaterial = imageComponent.mainPass;
            if (this.imageMaterial) {
                this.imageMaterial.mainPass.baseColor = this.normalColor;
            }
        }

        this.createEvent("UpdateEvent").bind(this.onUpdate.bind(this));
    }

    public flash() {
        if (!this.imageMaterial) return;

        this.isFlashing = true;
        this.flashTimer = 0;
        this.imageMaterial.mainPass.baseColor = this.hitColor;
    }

    private onUpdate(eventData: UpdateEvent) {
        if (!this.isFlashing || !this.imageMaterial) return;

        this.flashTimer += getDeltaTime();

        if (this.flashTimer >= this.flashDuration) {
            // Flash complete, return to normal color
            this.imageMaterial.mainPass.baseColor = this.normalColor;
            this.isFlashing = false;
        }
    }
}
