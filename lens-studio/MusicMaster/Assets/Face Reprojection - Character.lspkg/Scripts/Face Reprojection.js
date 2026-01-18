// FaceCircleGate.js
// 脸进圆 -> 触发游戏开始（只触发一次）

//@input Component.Camera camera
//@input SceneObject headBindingObject
//@input Component.ScreenTransform circleScreenTransform

//@input SceneObject gameRootToEnable     // 进圆后要开启的对象（比如 GameLogic 总节点）
//@input SceneObject circleUiToHide       // 进圆后要隐藏的UI（可选：Billboard 或 Canvas 圆）
//@input bool debugPrint = false

//@input float radiusScale = 0.95         // <1 更严格, >1 更宽松
//@input float holdSeconds = 0.15         // 需要持续在圆内多久才算成功（防抖）

var insideTimer = 0.0;
var triggered = false;

function log() {
    if (script.debugPrint) {
        // eslint-disable-next-line no-undef
        print.apply(null, arguments);
    }
}

// 把 HeadBinding 的世界坐标 -> 屏幕坐标(0..1)
function getFaceScreenPos01() {
    if (!script.camera || !script.headBindingObject) return null;

    var worldPos = script.headBindingObject.getTransform().getWorldPosition();
    var sp = script.camera.worldSpaceToScreenSpace(worldPos);

    if (!sp) return null;

    // worldSpaceToScreenSpace 返回的通常是 0..1
    return new vec2(sp.x, sp.y);
}

// 从 ScreenTransform 拿圆的中心(0..1) + 半径(0..1)
function getCircleData01() {
    if (!script.circleScreenTransform) return null;

    // ScreenTransform 的 localPointToScreenPoint 返回 0..1
    var center = script.circleScreenTransform.localPointToScreenPoint(new vec2(0, 0));

    // 用 bounds 估算圆半径：取宽高中较小的一半
    // bounds 是 -1..1 的屏幕归一范围
    var b = script.circleScreenTransform.bounds; 
    if (!b) return null;

    var widthN = Math.abs(b.right - b.left);   // 0..2
    var heightN = Math.abs(b.top - b.bottom);  // 0..2

    // 转成 0..1 空间：/2
    var radius01 = (Math.min(widthN, heightN) * 0.5) / 2.0;
    radius01 *= script.radiusScale;

    return { center01: center, radius01: radius01 };
}

function startGameOnce() {
    if (triggered) return;
    triggered = true;

    log("✅ Face entered circle -> START GAME");

    if (script.circleUiToHide) {
        script.circleUiToHide.enabled = false;
    }

    if (script.gameRootToEnable) {
        script.gameRootToEnable.enabled = true;
    }

    // 如果你还想触发别的脚本逻辑，也可以在这里：
    // var evt = script.createEvent("DelayedCallbackEvent");
    // evt.bind(function(){ ... });
}

// 每帧检测
function onUpdate(e) {
    if (triggered) return;

    var face = getFaceScreenPos01();
    var circle = getCircleData01();
    if (!face || !circle) {
        insideTimer = 0;
        return;
    }

    var dx = face.x - circle.center01.x;
    var dy = face.y - circle.center01.y;
    var dist = Math.sqrt(dx * dx + dy * dy);

    var inside = dist <= circle.radius01;

    if (inside) {
        insideTimer += getDeltaTime();
        if (insideTimer >= script.holdSeconds) {
            startGameOnce();
        }
    } else {
        insideTimer = 0;
    }

    if (script.debugPrint) {
        log("face:", face.x.toFixed(3), face.y.toFixed(3),
            "center:", circle.center01.x.toFixed(3), circle.center01.y.toFixed(3),
            "r:", circle.radius01.toFixed(3),
            "dist:", dist.toFixed(3),
            inside ? "IN" : "OUT",
            "t:", insideTimer.toFixed(2));
    }
}

var updateEvent = script.createEvent("UpdateEvent");
updateEvent.bind(onUpdate);
