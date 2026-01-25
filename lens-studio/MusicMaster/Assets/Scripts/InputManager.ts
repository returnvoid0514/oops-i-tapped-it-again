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
        const activeNotes = this.getActiveNotes();
        
        for (let note of activeNotes) {
            const error = this.conductor.getBeatError(note.targetBeat);
            
            if (error < 0.15) { 
                this.hitNote(note, error);
                return;
            }
        }
    }

    hitNote(note: Note, error: number) {
        note.getSceneObject().enabled = false;
    }
    
    private getActiveNotes(): Note[] {
        return []; 
    }
}
