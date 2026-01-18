// -----JS CODE-----

//@input string expressionName
//@input Component.RenderMeshVisual meshFrom
//@input string blendshapeName
//@input Component.RenderMeshVisual meshTo

if (!script.meshFrom || !script.meshFrom.mesh.control.getExpressionWeightByName) {
    debugPrint(" ERROR, Face Mesh to get expression weights from is not set");
    return;
}
if (!script.meshTo) {
    debugPrint(" ERROR, Mesh with blendshapes is not set");
    return;
}

var multiplier = script.meshFrom.getBlendShapeWeight("ExternalFaceMesh");
print(multiplier)
var weight;

function debugPrint(message) {
    print("[SetBlendshapeFromExpression], " + message);
}

function onUpdate(){
    weight = script.meshFrom.mesh.control.getExpressionWeightByName(script.expressionName) * multiplier;
    script.meshTo.setBlendShapeWeight(script.blendshapeName, weight);
}

var event = script.createEvent("UpdateEvent");
event.bind(onUpdate);