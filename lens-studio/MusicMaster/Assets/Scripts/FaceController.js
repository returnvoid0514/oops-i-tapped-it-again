//@input Component.Camera camera
//@input SceneObject headBindingObject
//@input Component.ScreenTransform circleScreenTransform
//@input float radiusPx = 450          // ✅ 先把半径设大，确保能进
//@input bool debugPrint = true

var wasInside = false;
var t = 0;

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

function toPixels(p) {
    var s = getScreenSizePx();
    // normalized -> pixels
    if (p.x >= -0.5 && p.x <= 1.5 && p.y >= -0.5 && p.y <= 1.5) {
        return new vec2(p.x * s.x, p.y * s.y);
    }
    return p;
}

function getFacePos() {
    if (!script.camera || !script.headBindingObject) return null;

    var w = script.headBindingObject.getTransform().getWorldPosition();
    var sp = script.camera.worldSpaceToScreenSpace(w);
    if (!sp) return null;

    return new vec2(sp.x, sp.y);
}

function getCircleCenter() {
    if (!script.circleScreenTransform) return null;
    return script.circleScreenTransform.localPointToScreenPoint(new vec2(0, 0));
}

script.createEvent("UpdateEvent").bind(function () {
    var face = getFacePos();
    var center = getCircleCenter();
    if (!face || !center) return;

    var facePx = toPixels(face);
    var centerPx = toPixels(center);

    var dist = facePx.distance(centerPx);
    var inside = dist <= script.radiusPx;

    // 每 0.5s 打印一次，避免刷屏
    if (script.debugPrint) {
        t += getDeltaTime();
        if (t >= 0.5) {
            t = 0;
            print(
                "DBG facePx=" + facePx.x.toFixed(1) + "," + facePx.y.toFixed(1) +
                " centerPx=" + centerPx.x.toFixed(1) + "," + centerPx.y.toFixed(1) +
                " dist=" + dist.toFixed(1) +
                " r=" + script.radiusPx.toFixed(1) +
                " inside=" + inside
            );
        }
    }

    if (inside !== wasInside) {
        wasInside = inside;
        print(inside ? "✅ ENTERED" : "⬅️ LEFT");
    }
});
