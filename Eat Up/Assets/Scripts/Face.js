//@input Component.RenderMeshVisual faceMesh

function onUpdate() {
    if (!script.faceMesh || !script.faceMesh.mesh) {
        return;
    }

    var weight = script.faceMesh.mesh.control
        .getExpressionWeightByName(Expressions.MouthClose);

    print("MouthClose weight: " + weight);
}

var updateEvent = script.createEvent("UpdateEvent");
updateEvent.bind(onUpdate);
