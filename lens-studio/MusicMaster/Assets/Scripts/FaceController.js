// -----JS CODE-----
//
// Face enters a UI circle -> prints ENTER/LEAVE (debug)
// Works with:
// - Camera: Camera Object (Component.Camera)
// - Head Binding object: Camera Object > Effects > Head Binding (SceneObject)
// - Circle UI: Canvas > CircleUI_Screen (Component.ScreenTransform)
//
// @input Component.Camera camera
// @input SceneObject headBindingObject
// @input Component.ScreenTransform circleUI
// @input float radiusScale = 0.48     // 0.42~0.60 (smaller = stricter)
// @input bool debugPrint = true

var wasInside = false;
var acc = 0;

print("🔥 FaceCircleDetector loaded");

function getScreenSizePx() {
    if (global.deviceInfoSystem) {
        if (typeof global.deviceInfoSystem.getScreenSize === "function") {
            return global.deviceInfoSystem.getScreenSize();
        }
        if (typeof global.deviceInfoSystem.getScreenResolution === "function") {
            return global.deviceInfoSystem.getScreenResolution();
        }
    }
    return new vec2(720, 1280);
}

function toPixelsMaybe(v) {
    if (!v) return null;
    var s = getScreenSizePx();

    // If values look normalized (0..1 or -1..1), convert to pixels.
    if (Math.abs(v.x) <= 2 && Math.abs(v.y) <= 2) {
        return new vec2(v.x * s.x, v.y * s.y);
    }
    // Otherwise assume pixels already.
    return new vec2(v.x, v.y);
}

function getFacePx() {
    if (!script.camera || !script.headBindingObject) return null;

    var worldPos = script.headBindingObject.getTransform().getWorldPosition();
    var sp = script.camera.worldSpaceToScreenSpace(worldPos); // usually 0..1
    if (!sp) return null;

    var s = getScreenSizePx();
    return new vec2(sp.x * s.x, sp.y * s.y);
}

function getCircleDataPx() {
    if (!script.circleUI) return null;

    // Preferred: screen rect (more stable)
    if (typeof script.circleUI.getScreenRect === "function") {
        var r = script.circleUI.getScreenRect();

        var left   = toPixelsMaybe(new vec2(r.left,  r.bottom)).x;
        var right  = toPixelsMaybe(new vec2(r.right, r.bottom)).x;
        var bottom = toPixelsMaybe(new vec2(r.left,  r.bottom)).y;
        var top    = toPixelsMaybe(new vec2(r.left,  r.top)).y;

        var cx = (left + right) * 0.5;
        var cy = (bottom + top) * 0.5;

        var w = Math.abs(right - left);
        var h = Math.abs(top - bottom);

        // Circle radius ~= half of the smaller rect side, scaled a bit for inner circle feel
        var radius = 0.5 * Math.min(w, h) * script.radiusScale;

        return { center: new vec2(cx, cy), radius: radius };
    }

    // Fallback: localPointToScreenPoint (less reliable)
    var p = script.circleUI.localPointToScreenPoint(new vec2(0, 0));
    var center = toPixelsMaybe(p);
    if (!center) return null;

    // If we cannot read rect, use a conservative default radius
    var radiusFallback = 150 * script.radiusScale;
    return { center: center, radius: radiusFallback };
}

script.createEvent("UpdateEvent").bind(function () {
    var facePx = getFacePx();
    var circle = getCircleDataPx();
    if (!facePx || !circle) return;

    var dist = facePx.distance(circle.center);
    var inside = dist <= circle.radius;

    if (script.debugPrint) {
        acc += getDeltaTime();
        if (acc >= 0.5) {
            acc = 0;
            print(
                "DBG facePx=" + facePx.x.toFixed(1) + "," + facePx.y.toFixed(1) +
                " centerPx=" + circle.center.x.toFixed(1) + "," + circle.center.y.toFixed(1) +
                " dist=" + dist.toFixed(1) +
                " rPx=" + circle.radius.toFixed(1) +
                " inside=" + inside
            );
        }
    }

    if (inside !== wasInside) {
        wasInside = inside;
        print(inside ? "✅ ENTERED circle" : "⬅️ LEFT circle");
        // TODO: later we will trigger your GameLogic here when inside becomes true
    }
});
