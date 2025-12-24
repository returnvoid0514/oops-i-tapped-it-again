import { Conductor } from "./Conductor";
import { Note } from "./Note";


@component
export class InputManager extends BaseScriptComponent {
    @input
    conductor: Conductor;

    onAwake() {
        this.createEvent("TouchStartEvent").bind(this.handleTouch.bind(this));
    }

    handleTouch() {
        // 获取当前场景中所有激活的音符
        // Senior 提示：实际开发中应维护一个“活动音符列表”以提高性能
        const activeNotes = this.getActiveNotes();
        
        for (let note of activeNotes) {
            const error = this.conductor.getBeatError(note.targetBeat);
            
            if (error < 0.15) { // 判定窗口
                this.hitNote(note, error);
                return;
            }
        }
    }

    hitNote(note: Note, error: number) {
        print("Hit! 误差拍数: " + error);
        
        // 1. 播放打击特效 (VFX)
        // 2. 增加分数
        // 3. 将音符归还对象池
        note.getSceneObject().enabled = false;
    }
    
    private getActiveNotes(): Note[] {
        // 这里应返回当前在判定区附近的音符实例
        return []; 
    }
}