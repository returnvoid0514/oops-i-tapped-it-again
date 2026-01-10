//@input Component.FaceMesh faceMesh
//@input Component.Camera camera
//@input SceneObject headBindingObject
//@input Component.ScreenTransform circleScreenTransform
//@input SceneObject triggerTarget
//@input float radiusScale = 1.0   // < 1.0 = stricter, > 1.0 = looser

var wasInsideCircle = false;

// Convert the head's world position to screen-space
// NOTE: worldSpaceToScreenSpace may return normalized (0-1) OR pixels depending on Lens/Camera.
// We'll normalize later by converting to pixels if needed.
function getFaceScreenPosition() {
    if (!script.camera || !script.headBindingObject) {
        return null;
    }

    var worldPos = script.headBindingObject.getTransform().getWorldPosition();
    var screenPos = script.camera.worldSpaceToScreenSpace(worldPos);

    if (!screenPos) {
        return null;
    }

    return new vec2(screenPos.x, screenPos.y);
}

// Get circle center and radius in screen pixel space
function getCircleData() {
    if (!script.circleScreenTransform) {
        return null;
    }

    // Circle center in screen pixels
    var center = script.circleScreenTransform.localPointToScreenPoint(new vec2(0, 0));

    // Radius from UI size (pixels)
    // getSize() returns size in screen-space units for ScreenTransform
    var size = script.circleScreenTransform.getSize();
    var edgeLocal = new vec2(size.x * 0.5, 0);
    var edge = script.circleScreenTransform.localPointToScreenPoint(edgeLocal);

    var radius = center.distance(edge) * script.radiusScale;

    return { center: center, radius: radius };
}

// Enable / disable the triggered object
function setTriggered(enabled) {
    if (!script.triggerTarget) {
        return;
    }
    script.triggerTarget.enabled = enabled;
}

// Convert a point to pixels if it looks like normalized coordinates
function toPixelsIfNeeded(p) {
    var screenSize = global.deviceInfoSystem.getScreenSize();

    // Heuristic: if it looks like normalized space around 0..1, treat it as normalized and convert to pixels.
    if (p.x >= -0.5 && p.x <= 1.5 && p.y >= -0.5 && p.y <= 1.5) {
        return new vec2(p.x * screenSize.x, p.y * screenSize.y);
    }
    // Otherwise assume it's already pixels
    return p;
}

// Update loop
var updateEvent = script.createEvent("UpdateEvent");
updateEvent.bind(function () {
    var facePos = getFaceScreenPosition();
    var circle = getCircleData();

    if (!facePos || !circle) {
        return;
    }

    //  Unify to pixel coordinates
    var facePx = toPixelsIfNeeded(facePos);

    //  On-screen check in pixels
    var screenSize = global.deviceInfoSystem.getScreenSize();
    var onScreen =
        facePx.x >= 0 && facePx.x <= screenSize.x &&
        facePx.y >= 0 && facePx.y <= screenSize.y;

    //  Distance check in pixels
    var isInsideCircle =
        onScreen &&
        facePx.distance(circle.center) <= circle.radius;

    // Trigger only when state changes
    if (isInsideCircle !== wasInsideCircle) {
        wasInsideCircle = isInsideCircle;

        print(isInsideCircle
            ? "✅ Face entered circle"
            : "⬅️ Face left circle"
        );

        setTriggered(isInsideCircle);
    }
});


