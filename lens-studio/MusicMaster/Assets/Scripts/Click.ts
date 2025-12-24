
@component
export class SimpleClick extends BaseScriptComponent {
    @input
    conductor: any;

    onAwake() {
        this.createEvent("TouchStartEvent").bind(() => {
            print("当前拍子: " + this.conductor.currentBeat.toFixed(2));
            // 这里可以添加判定逻辑：遍历场景中所有激活的 Note
            // 看哪个 Note 的 targetBeat 与 currentBeat 最接近
        });
    }
}