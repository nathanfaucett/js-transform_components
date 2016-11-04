var vec3 = require("@nathanfaucett/vec3"),
    mat3 = require("@nathanfaucett/mat3"),
    mat4 = require("@nathanfaucett/mat4"),
    quat = require("@nathanfaucett/quat"),
    sceneGraph = require("@nathanfaucett/scene_graph"),
    Transform3DManager = require("./Transform3DManager");


var Component = sceneGraph.Component,
    ComponentPrototype = Component.prototype,
    Transform3DPrototype;


module.exports = Transform3D;


function Transform3D() {

    Component.call(this);

    this._localPosition = vec3.create();
    this._position = vec3.create();

    this._localRotation = quat.create(0.0, 0.0, 0.0, 1.0);
    this._rotation = quat.create(0.0, 0.0, 0.0, 1.0);

    this._localScale = vec3.create(1.0, 1.0, 1.0);
    this._scale = vec3.create(1.0, 1.0, 1.0);

    this._localMatrix = mat4.create();
    this._matrix = mat4.create();

    this._matrixNeedsUpdate = false;
}
Component.extend(Transform3D, "transform.Transform3D", Transform3DManager);
Transform3DPrototype = Transform3D.prototype;

Transform3DPrototype.construct = function() {

    ComponentPrototype.construct.call(this);

    return this;
};

Transform3DPrototype.destructor = function() {

    ComponentPrototype.destructor.call(this);

    vec3.set(this._localPosition, 0.0, 0.0, 0.0);
    vec3.set(this._position, 0.0, 0.0, 0.0);

    quat.set(this._localRotation, 0.0, 0.0, 0.0, 1.0);
    quat.set(this._rotation, 0.0, 0.0, 0.0, 1.0);

    vec3.set(this._localScale, 1.0, 1.0, 1.0);
    vec3.set(this._scale, 1.0, 1.0, 1.0);

    mat4.identity(this._localMatrix);
    mat4.identity(this._matrix);

    return this;
};

Transform3DPrototype.setPosition = function(v) {
    vec3.copy(this._localPosition, v);
    this._matrixNeedsUpdate = true;
    return this;
};
Transform3DPrototype.getPosition = function() {
    if (this._matrixNeedsUpdate) {
        this.updateMatrix();
    }
    return this._position;
};
Transform3DPrototype.getLocalPosition = function() {
    return this._localPosition;
};

Transform3DPrototype.setRotation = function(v) {
    vec3.copy(this._localRotation, v);
    this._matrixNeedsUpdate = true;
    return this;
};
Transform3DPrototype.getRotation = function() {
    if (this._matrixNeedsUpdate) {
        this.updateMatrix();
    }
    return this._rotation;
};
Transform3DPrototype.getLocalRotation = function() {
    return this._localRotation;
};

Transform3DPrototype.setScale = function(v) {
    vec3.copy(this._localScale, v);
    this._matrixNeedsUpdate = true;
    return this;
};
Transform3DPrototype.getScale = function() {
    if (this._matrixNeedsUpdate) {
        this.updateMatrix();
    }
    return this._scale;
};
Transform3DPrototype.getLocalScale = function() {
    return this._localScale;
};

Transform3DPrototype.translate = function(v) {
    vec3.add(this._localPosition, this._localPosition, v);
    this._matrixNeedsUpdate = true;
    return this;
};

Transform3DPrototype.rotate = function(rotation) {
    vec3.transformQuat(this._localRotation, this._localRotation, rotation);
    this._matrixNeedsUpdate = true;
    return this;
};

var lookAt_mat = mat4.create(),
    lookAt_vec = vec3.create(),
    lookAt_dup = vec3.create(0.0, 0.0, 1.0);
Transform3DPrototype.lookAt = function(target, up) {
    var mat = lookAt_mat,
        vec = lookAt_vec;

    up = up || lookAt_dup;

    if (target._matrix) {
        vec3.transformMat4(vec, vec3.set(vec, 0.0, 0.0, 0.0), target._matrix);
    } else {
        vec3.copy(vec, target);
    }

    mat4.lookAt(mat, this._position, vec, up);
    quat.fromMat4(this._rotation, mat);

    return this;
};

Transform3DPrototype.localToWorld = function(out, v) {
    return vec3.transformMat4(out, v, this._matrix);
};

var worldToLocal_mat = mat4.create();
Transform3DPrototype.worldToLocal = function(out, v) {
    return vec3.transformMat4(out, v, mat4.inverse(worldToLocal_mat, this._matrix));
};

Transform3DPrototype.updateMatrix = function() {
    var matrix, localMatrix, entity, parent, isUpdated, parentTransform;

    if (this._matrixNeedsUpdate) {
        this._matrixNeedsUpdate = false;

        matrix = this._matrix;
        localMatrix = this._localMatrix;
        entity = this.entity;
        isUpdated = false;

        mat4.compose(localMatrix, this._localPosition, this._localScale, this._localRotation);

        if ((parent = entity && entity.parent)) {
            if (
                (parentTransform = (
                    parent.getComponent("transform.Transform3D") ||
                    parent.getComponent("transform.Transform2D")
                ))
            ) {
                isUpdated = true;
                mat4.mul(matrix, parentTransform.getWorldMatrix(), localMatrix);
            }
        }

        if (isUpdated) {
            mat4.decompose(matrix, this._position, this._scale, this._rotation);
        } else {
            mat4.copy(matrix, localMatrix);
            vec3.copy(this._position, this._localPosition);
            vec3.copy(this._scale, this._localScale);
            quat.copy(this._rotation, this._localRotation);
        }
    }

    return this;
};

Transform3DPrototype.getMatrix = function() {
    if (this._matrixNeedsUpdate) {
        this.updateMatrix();
    }
    return this._matrix;
};

Transform3DPrototype.getMatrix = function() {
    if (this._matrixNeedsUpdate) {
        this.updateMatrix();
    }
    return this._matrix;
};

Transform3DPrototype.getLocalMatrix = function() {
    return this._localMatrix;
};

Transform3DPrototype.getWorldMatrix = Transform3DPrototype.getMatrix;

Transform3DPrototype.calculateModelView = function(viewMatrix, modelView) {
    return mat4.mul(modelView, viewMatrix, this.getWorldMatrix());
};

Transform3DPrototype.calculateNormalMatrix = function(modelView, normalMatrix) {
    return mat3.transpose(normalMatrix, mat3.inverseMat4(normalMatrix, modelView));
};

Transform3DPrototype.toJSON = function(json) {

    json = ComponentPrototype.toJSON.call(this, json);

    json._localPosition = vec3.copy(json._localPosition || [], this._localPosition);
    json._localRotation = quat.copy(json._localRotation || [], this._localRotation);
    json._localScale = vec3.copy(json._localScale || [], this._localScale);

    return json;
};

Transform3DPrototype.fromJSON = function(json) {

    ComponentPrototype.fromJSON.call(this, json);

    this._matrixNeedsUpdate = true;
    vec3.copy(this._localPosition, json._localPosition);
    quat.copy(this._localRotation, json._localRotation);
    vec3.copy(this._localScale, json._localScale);

    return this;
};