var sceneGraph = require("@nathanfaucett/scene_graph");


var ComponentManager = sceneGraph.ComponentManager;


var Transform3DManagerPrototype;


module.exports = Transform3DManager;


function Transform3DManager() {
    ComponentManager.call(this);
}
ComponentManager.extend(Transform3DManager, "transform.Transform3DManager");
Transform3DManagerPrototype = Transform3DManager.prototype;

Transform3DManagerPrototype.sortFunction = function(a, b) {
    return a.entity.depth - b.entity.depth;
};