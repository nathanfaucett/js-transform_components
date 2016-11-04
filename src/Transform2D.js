var vec2 = require("@nathanfaucett/vec2"),
    mat3 = require("@nathanfaucett/mat3"),
    mat32 = require("@nathanfaucett/mat32"),
    mat4 = require("@nathanfaucett/mat4"),
    sceneGraph = require("@nathanfaucett/scene_graph"),
    Transform2DManager = require("./Transform2DManager");


var Component = sceneGraph.Component,
    ComponentPrototype = Component.prototype,
    Transform2DPrototype;


module.exports = Transform2D;


function Transform2D() {

    Component.call(this);

    this._localPosition = vec2.create();
    this._position = vec2.create();

    this._localRotation = 0.0;
    this._rotation = 0.0;

    this._localScale = vec2.create(1.0, 1.0);
    this._scale = vec2.create(1.0, 1.0);

    this._localMatrix = mat32.create();
    this._matrix = mat32.create();

    this._matrixNeedsUpdate = false;
}
Component.extend(Transform2D, "transform.Transform2D", Transform2DManager);
Transform2DPrototype = Transform2D.prototype;

Transform2DPrototype.construct = function() {

    ComponentPrototype.construct.call(this);

    return this;
};

Transform2DPrototype.destructor = function() {

    ComponentPrototype.destructor.call(this);

    vec2.set(this._localPosition, 0.0, 0.0);
    vec2.set(this._position, 0.0, 0.0);

    this._localRotation = 0.0;
    this._rotation = 0.0;

    vec2.set(this._localScale, 1.0, 1.0);
    vec2.set(this._scale, 1.0, 1.0);

    mat32.identity(this._localMatrix);
    mat32.identity(this._matrix);

    return this;
};

Transform2DPrototype.setPosition = function(v) {
    vec2.copy(this._localPosition, v);
    this._matrixNeedsUpdate = true;
    return this;
};
Transform2DPrototype.getPosition = function() {
    if (this._matrixNeedsUpdate) {
        this.updateMatrix();
    }
    return this._position;
};
Transform2DPrototype.getLocalPosition = function() {
    return this._localPosition;
};

Transform2DPrototype.setRotation = function(value) {
    this._localRotation = value;
    this._matrixNeedsUpdate = true;
    return this;
};
Transform2DPrototype.getRotation = function() {
    if (this._matrixNeedsUpdate) {
        this.updateMatrix();
    }
    return this._rotation;
};
Transform2DPrototype.getLocalRotation = function() {
    return this._localRotation;
};

Transform2DPrototype.setScale = function(v) {
    vec2.copy(this._localScale, v);
    this._matrixNeedsUpdate = true;
    return this;
};
Transform2DPrototype.getScale = function() {
    if (this._matrixNeedsUpdate) {
        this.updateMatrix();
    }
    return this._scale;
};
Transform2DPrototype.getLocalScale = function() {
    return this._localScale;
};

Transform2DPrototype.translate = function(v) {
    vec2.add(this._localPosition, this._localPosition, v);
    this._matrixNeedsUpdate = true;
    return this;
};

Transform2DPrototype.rotate = function(rotation) {
    this._localRotation += rotation;
    this._matrixNeedsUpdate = true;
    return this;
};

var lookAt_mat = mat32.create(),
    lookAt_vec = vec2.create();
Transform2DPrototype.lookAt = function(target) {
    var mat = lookAt_mat,
        vec = lookAt_vec;

    if (target._matrix) {
        vec2.transformMat4(vec, vec2.set(vec, 0.0, 0.0), target._matrix);
    } else {
        vec2.copy(vec, target);
    }

    mat32.lookAt(mat, this._position, vec);
    this._rotation = mat32.getRotation(mat);

    return this;
};

Transform2DPrototype.localToWorld = function(out, v) {
    return vec2.transformMat32(out, v, this._matrix);
};

var worldToLocal_mat = mat32.create();
Transform2DPrototype.worldToLocal = function(out, v) {
    return vec2.transformMat32(out, v, mat32.inverse(worldToLocal_mat, this._matrix));
};

function mat32FromMat4(a, b) {
    a[0] = b[0];
    a[2] = b[4];
    a[1] = b[1];
    a[3] = b[5];
    a[4] = b[12];
    a[5] = b[15];
    return a;
}

var updateMatrix_parentMatrix = mat32.create();
Transform2DPrototype.updateMatrix = function() {
    var matrix, localMatrix, entity, parent, needsUpdated, parentTransform;

    if (this._matrixNeedsUpdate) {
        this._matrixNeedsUpdate = false;

        matrix = this._matrix;
        localMatrix = this._localMatrix;
        entity = this.entity;
        needsUpdated = false;

        mat32.compose(localMatrix, this._localPosition, this._localScale, this._localRotation);

        if ((parent = entity && entity.parent)) {
            if ((parentTransform = parent.getComponent("transform.Transform2D"))) {
                needsUpdated = true;
                mat32.mul(matrix, parentTransform.getMatrix(), localMatrix);
            } else if ((parentTransform = parent.getComponent("transform.Transform3D"))) {
                needsUpdated = true;
                mat32.mul(
                    matrix,
                    mat32FromMat4(
                        updateMatrix_parentMatrix,
                        parentTransform.getMatrix()
                    ),
                    localMatrix
                );
            }
        }

        if (needsUpdated) {
            this._rotation = mat32.decompose(matrix, this._position, this._scale);
        } else {
            mat32.copy(matrix, localMatrix);
            vec2.copy(this._position, this._localPosition);
            vec2.copy(this._scale, this._localScale);
            this._rotation = this._localRotation;
        }
    }

    return this;
};

Transform2DPrototype.getMatrix = function() {
    if (this._matrixNeedsUpdate) {
        this.updateMatrix();
    }
    return this._matrix;
};

var getLocalMatrix_mat4 = mat4.create();
Transform2DPrototype.getLocalMatrix = function() {
    var tmp = getLocalMatrix_mat4,
        mw = this._localMatrix;

    tmp[0] = mw[0];
    tmp[4] = mw[2];
    tmp[1] = mw[1];
    tmp[5] = mw[3];
    tmp[12] = mw[4];
    tmp[13] = mw[5];

    return tmp;
};

var getWorldMatrix_mat4 = mat4.create();
Transform2DPrototype.getWorldMatrix = function() {
    var tmp = getWorldMatrix_mat4,
        mw = this.getMatrix();

    tmp[0] = mw[0];
    tmp[4] = mw[2];
    tmp[1] = mw[1];
    tmp[5] = mw[3];
    tmp[12] = mw[4];
    tmp[13] = mw[5];

    return tmp;
};

Transform2DPrototype.calculateModelView = function(viewMatrix, modelView) {
    return mat4.mul(modelView, viewMatrix, this.getWorldMatrix());
};

Transform2DPrototype.calculateNormalMatrix = function(modelView, normalMatrix) {
    return mat3.transpose(normalMatrix, mat3.inverseMat4(normalMatrix, modelView));
};

Transform2DPrototype.toJSON = function(json) {

    json = ComponentPrototype.toJSON.call(this, json);

    json._localPosition = vec2.copy(json._localPosition || [], this._localPosition);
    json._localRotation = json._localRotation;
    json._localScale = vec2.copy(json._localScale || [], this._localScale);

    return json;
};

Transform2DPrototype.fromJSON = function(json) {

    ComponentPrototype.fromJSON.call(this, json);

    this._matrixNeedsUpdate = true;
    vec2.copy(this._localPosition, json._localPosition);
    this._localRotation = json._localRotation;
    vec2.copy(this._localScale, json._localScale);

    return this;
};