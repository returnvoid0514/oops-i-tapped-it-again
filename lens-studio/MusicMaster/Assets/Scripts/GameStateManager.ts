import { Conductor } from "./Conductor";
import { NoteSpawner } from "./NoteSpawner";
import { HitZoneManager } from "./HitZoneManager";
import { SongEndDetector } from "./SongEndDetector";

// Game state enum
enum GameState {
    IDLE = "IDLE",
    PLAYING = "PLAYING",
    ENDED = "ENDED"
}

@component
export class GameStateManager extends BaseScriptComponent {
    // Core game components
    @input
    conductor: Conductor;

    @input
    noteSpawner: NoteSpawner;

    @input
    hitZoneManager: HitZoneManager;

    @input
    songEndDetector: SongEndDetector;

    // UI Text elements
    @input
    startButton: Text;

    @input
    endButton: Text;

    @input
    replayButton: Text;

    @input
    finalScoreText: Text;

    // Current game state
    private currentState: GameState = GameState.IDLE;

    onAwake() {
        // Validate required inputs
        if (!this.conductor || !this.noteSpawner || !this.hitZoneManager) {
            print("GameStateManager: Missing required component references!");
            return;
        }

        // Set initial UI state
        this.setIdleState();

        // Listen for touch events
        this.createEvent("TouchStartEvent").bind(this.onTouch.bind(this));

        print("GameStateManager initialized - Game is in IDLE state");
    }

    private onTouch(eventData: TouchStartEvent) {
        const touchPos = eventData.getTouchPosition();

        switch (this.currentState) {
            case GameState.IDLE:
                // Any tap in center area starts the game
                if (this.isStartButtonArea(touchPos)) {
                    this.startGame();
                }
                break;

            case GameState.PLAYING:
                // Tap in top-right corner ends the game
                if (this.isEndButtonArea(touchPos)) {
                    this.endGame();
                }
                break;

            case GameState.ENDED:
                // Tap in bottom area replays the game
                if (this.isReplayButtonArea(touchPos)) {
                    this.restartGame();
                }
                break;
        }
    }

    // Button area detection methods
    private isStartButtonArea(touchPos: vec2): boolean {
        // Center area - roughly middle 60% of screen
        return touchPos.x > 0.2 && touchPos.x < 0.8 &&
               touchPos.y > 0.3 && touchPos.y < 0.7;
    }

    private isEndButtonArea(touchPos: vec2): boolean {
        // Top-right corner
        return touchPos.x > 0.75 && touchPos.y < 0.25;
    }

    private isReplayButtonArea(touchPos: vec2): boolean {
        // Bottom center area
        return touchPos.x > 0.2 && touchPos.x < 0.8 && touchPos.y > 0.7;
    }

    // State transition methods
    public startGame(): void {
        if (this.currentState !== GameState.IDLE) {
            print("Cannot start game - not in IDLE state");
            return;
        }

        print("Starting game...");
        this.currentState = GameState.PLAYING;

        // Hide start button, show end button
        this.setButtonVisibility(this.startButton, false);
        this.setButtonVisibility(this.endButton, true);
        this.setButtonVisibility(this.replayButton, false);
        this.setButtonVisibility(this.finalScoreText, false);

        // Start the game components
        if (this.conductor) {
            this.conductor.play();
        }

        if (this.noteSpawner) {
            this.noteSpawner.start();
        }

        if (this.songEndDetector) {
            this.songEndDetector.reset();
        }

        print("Game PLAYING - music and notes started");
    }

    public endGame(): void {
        if (this.currentState !== GameState.PLAYING) {
            print("Cannot end game - not in PLAYING state");
            return;
        }

        print("Ending game...");
        this.currentState = GameState.ENDED;

        // Hide end button, show replay button and score
        this.setButtonVisibility(this.startButton, false);
        this.setButtonVisibility(this.endButton, false);
        this.setButtonVisibility(this.replayButton, true);
        this.setButtonVisibility(this.finalScoreText, true);

        // Stop the game components
        if (this.conductor) {
            this.conductor.stop();
        }

        if (this.noteSpawner) {
            this.noteSpawner.stop();
        }

        // Show final score
        if (this.hitZoneManager) {
            this.hitZoneManager.showFinalScore();
        }

        // Update final score text display if available
        this.updateFinalScoreDisplay();

        print("Game ENDED - showing final score");
    }

    public restartGame(): void {
        if (this.currentState !== GameState.ENDED) {
            print("Cannot restart game - not in ENDED state");
            return;
        }

        print("Restarting game...");

        // Reset all game components
        if (this.conductor) {
            this.conductor.reset();
        }

        if (this.noteSpawner) {
            this.noteSpawner.reset();
        }

        if (this.hitZoneManager) {
            this.hitZoneManager.reset();
        }

        if (this.songEndDetector) {
            this.songEndDetector.reset();
        }

        // Return to idle state
        this.setIdleState();

        print("Game reset - ready to play again");
    }

    private setIdleState(): void {
        this.currentState = GameState.IDLE;

        // Show only start button
        this.setButtonVisibility(this.startButton, true);
        this.setButtonVisibility(this.endButton, false);
        this.setButtonVisibility(this.replayButton, false);
        this.setButtonVisibility(this.finalScoreText, false);
    }

    private setButtonVisibility(textComponent: Text, visible: boolean): void {
        if (textComponent) {
            // Get the parent SceneObject and enable/disable it
            const sceneObject = textComponent.getSceneObject();
            if (sceneObject) {
                sceneObject.enabled = visible;
            }
        }
    }

    private updateFinalScoreDisplay(): void {
        if (this.finalScoreText && this.hitZoneManager) {
            // The score stats would need to be exposed from HitZoneManager
            // For now, set a placeholder that can be customized
            this.finalScoreText.text = "GAME OVER\n\nTap below to\nPLAY AGAIN";
        }
    }

    // Public getter for current state
    public getState(): string {
        return this.currentState;
    }

    // Called by SongEndDetector when song naturally ends
    public onSongEnd(): void {
        if (this.currentState === GameState.PLAYING) {
            this.endGame();
        }
    }
}
