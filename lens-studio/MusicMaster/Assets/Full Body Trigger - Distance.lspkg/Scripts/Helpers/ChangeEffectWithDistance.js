// ChangeEffectWithDistance.js
// Version: 0.0.1
// Event: Lens Initialized
// Description: Helper script that changes parameters on material based on distance between 2 objects
// Requires FullBodyTrackingController.js
// @input string mainJoint = "Nose" {"widget" : "combobox", "values" : [{"label" : "Nose", "value" : "Nose"}, {"label" : "Neck", "value" : "Neck"},{"label" : "Left Wrist", "value" : "LeftWrist"},{"label" : "Right Wrist", "value" : "RightWrist"},{"label" : "Left Shoulder", "value" : "LeftShoulder"},{"label" : "Right Shoulder", "value" : "RightShoulder"},{"label" : "Left Elbow", "value" : "LeftElbow"},{"label" : "Right Elbow", "value" : "RightElbow"},{"label" : "Left Hip", "value" : "LeftHip"},{"label" : "Right Hip", "value" : "RightHip"},{"label" : "Left Knee", "value" : "LeftKnee"},{"label" : "Right Knee", "value" : "RightKnee"},{"label" : "Left Ankle", "value" : "LeftAnkle"}, {"label" : "Right Ankle", "value" : "RightAnkle"}]}
// @input int compareTarget = 0 {"widget" : "combobox", "values" : [{"label" : "Joint", "value" : "0"}, {"label" : "Screen Transform", "value" : "1"}]}
// @input string targetJoint = "Nose" {"showIf":"compareTarget","showIfValue":"0", "widget" : "combobox", "values" : [{"label" : "Nose", "value" : "Nose"}, {"label" : "Neck", "value" : "Neck"},{"label" : "Left Wrist", "value" : "LeftWrist"},{"label" : "Right Wrist", "value" : "RightWrist"},{"label" : "Left Shoulder", "value" : "LeftShoulder"},{"label" : "Right Shoulder", "value" : "RightShoulder"},{"label" : "Left Elbow", "value" : "LeftElbow"},{"label" : "Right Elbow", "value" : "RightElbow"},{"label" : "Left Hip", "value" : "LeftHip"},{"label" : "Right Hip", "value" : "RightHip"},{"label" : "Left Knee", "value" : "LeftKnee"},{"label" : "Right Knee", "value" : "RightKnee"},{"label" : "Left Ankle", "value" : "LeftAnkle"}, {"label" : "Right Ankle", "value" : "RightAnkle"}]}
// @input Component.ScreenTransform targetObject{"showIf":"compareTarget","showIfValue":"1"}
// @input bool printDebugLog
// @ui {"widget" : "separator"}

// @input SceneObject effectObject
// @input Asset.Material effectMaterial
// @input string parameter
// @input float multiplier = 1.0

var jointScreenPosition;
var targetJointScreenPosition;
var distance;
var debugPrintTargetName = "";
var aspect;

if (!checkInputs()) {
    return;
}

script.effectObject.enabled = true;

var mainJoint = global.FullBodyTracking[script.mainJoint];
if (script.compareTarget == 0) {
    var targetJoint = global.FullBodyTracking[script.targetJoint];
}

script.createEvent("UpdateEvent").bind(onUpdate);

function onUpdate() {
    if (aspect == undefined) {
        aspect = global.FullBodyTracking.aspect;
    }
    jointScreenPosition = applyAspect(mainJoint.getScreenPosition());

    if (script.compareTarget == 0) {
        targetJointScreenPosition = applyAspect(targetJoint.getScreenPosition());
        distance = jointScreenPosition.distance(targetJointScreenPosition);
    } else if (script.compareTarget == 1) {
        distance = jointScreenPosition.distance(applyAspect(script.targetObject.localPointToScreenPoint(vec2.zero())));
    }

    script.effectMaterial.mainPass[script.parameter] = distance * script.multiplier;

    if (script.printDebugLog) {
        debugPrintTargetName = (script.compareTarget == 0) ? script.targetJoint : script.targetObject.getSceneObject().name;
        debugPrint("Distance between " + script.mainJoint + " and " + debugPrintTargetName + " is " + distance);
    }

}

function checkInputs() {
    if (!global.FullBodyTracking) {
        debugPrint("ERROR, Please make sure that [Full Body Tracking Controller] script is above [" + script.getSceneObject().name + "] sceneobject in scene hierarchy", true);
        return false;
    }
    if (!global.FullBodyTracking[script.mainJoint]) {
        debugPrint("ERROR, " + script.mainJoint + " was not created. Please check log for previous messages", true);
        return false;
    }
    if (script.compareTarget == 0 && !global.FullBodyTracking[script.targetJoint]) {
        debugPrint("ERROR, " + script.mainJoint + " was not created. Please check log for previous mesages", true);
        return false;
    }
    if (script.compareTarget == 1 && !script.targetObject) {
        debugPrint("ERROR, " + script.mainJoint + " was not created. Please check log for previous mesages", true);
        return false;
    }
    if (!script.effectMaterial) {
        debugPrint("ERROR, target material is not set", true);
        return false;
    }
    if (script.parameter == "") {
        debugPrint("ERROR, parameter name for target material is not set", true);
        return false;
    }
    if (!script.effectObject) {
        debugPrint("ERROR, target object not set", true);
        return false;
    }
    return true;
}

//offset camera aspect ratio to get precise non-normalized screen positions
function applyAspect(screenPos) {
    screenPos.x * aspect;
    return screenPos;
}

function debugPrint(message, force) {
    if (script.printDebugLog || force) {
        print("[DistanceModifier], " + message);
    }
}
