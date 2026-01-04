@component
export class Note extends BaseScriptComponent {
    public targetBeat: number = 0;
    public conductor: any;

    @input
    speed: number = 15.0;

    onAwake() {
        this.createEvent("UpdateEvent").bind(this.onUpdate.bind(this));
    }

    onUpdate() {
        if (!this.conductor) {
            print("⚠️ Note has no conductor reference!");
            return;
        }

        const currentBeat = this.conductor.currentBeat;
        const beatDiff = this.targetBeat - currentBeat;

        const yPos = beatDiff * this.speed;

        const transform = this.getTransform();
        const currentX = transform.getLocalPosition().x;
        const currentY = transform.getLocalPosition().y;

        transform.setLocalPosition(new vec3(currentX, yPos, 0));

        if (yPos < -20.0) {
            this.getSceneObject().enabled = false;
        }
    }
}
