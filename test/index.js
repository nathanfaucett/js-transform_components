var tape = require("tape"),
    sceneGraph = require("@nathanfaucett/scene_graph"),
    components = require("..");


var Scene = sceneGraph.Scene,
    Entity = sceneGraph.Entity,
    Transform2D = components.Transform2D,
    Transform3D = components.Transform3D;


tape("Transform2D", function(assert) {
    var scene = Scene.create(),
        parentTransform = Transform2D.create(),
        childTransform = Transform2D.create(),
        parent = Entity.create().addComponent(parentTransform),
        child = Entity.create().addComponent(childTransform);

    parent.addChild(child);
    scene.addEntity(parent);

    parentTransform.translate([1, 1]);
    childTransform.translate([1, 1]);

    assert.deepEquals(childTransform.getPosition(), [2, 2]);

    assert.end();
});

tape("Transform3D", function(assert) {
    var scene = Scene.create(),
        parentTransform = Transform3D.create(),
        childTransform = Transform3D.create(),
        parent = Entity.create().addComponent(parentTransform),
        child = Entity.create().addComponent(childTransform);

    parent.addChild(child);
    scene.addEntity(parent);

    parentTransform.translate([1, 1, 1]);
    childTransform.translate([1, 1, 1]);

    assert.deepEquals(childTransform.getPosition(), [2, 2, 2]);

    assert.end();
});