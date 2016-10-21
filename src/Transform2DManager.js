var sceneGraph = require("@nathanfaucett/scene_graph");


var ComponentManager = sceneGraph.ComponentManager;


var Transform2DManagerPrototype;


module.exports = Transform2DManager;


function Transform2DManager() {
    ComponentManager.call(this);
}
ComponentManager.extend(Transform2DManager, "transform.Transform2DManager");
Transform2DManagerPrototype = Transform2DManager.prototype;

Transform2DManagerPrototype.sortFunction = function(a, b) {
    return a.entity.depth - b.entity.depth;
};