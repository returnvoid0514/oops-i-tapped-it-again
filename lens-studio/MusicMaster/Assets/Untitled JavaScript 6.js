// FaceCircleGate.js - Face detection using Head Binding
//@input Component.ScreenTransform circleScreenTransform
//@input SceneObject headBindingObject {"hint":"Drag Head Binding object here"}
//@input SceneObject gameRoot
//@input float holdSeconds = 1.0
//@input bool debugPrint = true

var insideTime = 0.0;
var triggered = false;
var lastFaceDetected = false;

function isFaceDetected() {
    if (!script.headBindingObject) {
        return false;
    }
    
    // Check if Head Binding object is enabled (face is tracked)
    return script.headBindingObject.enabled;
}

function triggerStartOnce() {
    if (triggered) { return; }
    triggered = true;
    
    print("[FaceCircleGate] GAME START!");
    
    if (script.gameRoot) {
        script.gameRoot.enabled = true;
    }
    
    // Hide circle
    if (script.circleScreenTransform) {
        script.circleScreenTransform.getSceneObject().enabled = false;
    }
}

function onUpdate(e) {
    if (triggered) { return; }
    
    var faceDetected = isFaceDetected();
    
    if (faceDetected) {
        // Face detected -> count time
        insideTime += e.getDeltaTime();
        
        if (script.debugPrint) {
            var progress = (insideTime / script.holdSeconds * 100).toFixed(0);
            print("[FaceCircleGate] Face detected! Progress: " + progress + "%");
        }
        
        // Time requirement met -> trigger
        if (insideTime >= script.holdSeconds) {
            triggerStartOnce();
        }
    } else {
        // No face -> reset timer
        if (insideTime > 0 && script.debugPrint) {
            print("[FaceCircleGate] Face lost! Resetting...");
        }
        insideTime = 0.0;
    }
    
    lastFaceDetected = faceDetected;
}

var evt = script.createEvent("UpdateEvent");
evt.bind(onUpdate);

print("[FaceCircleGate] Ready! Show your face to start the game!");
print("[FaceCircleGate] Required hold time: " + (script.holdSeconds || 1.0) + " seconds");