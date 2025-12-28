@component
export class SimpleClick extends BaseScriptComponent {
    @input
    conductor: any;

    onAwake() {
        this.createEvent("TouchStartEvent").bind(() => {
            print("当前拍子: " + this.conductor.currentBeat.toFixed(2));
        });
    }
}