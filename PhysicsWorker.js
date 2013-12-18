'use strict';

importScripts(
    'src/Matrix3D.js',
    'src/Vector3D.js',
    'src/physics/Collider.js',
    'src/physics/BoundBox.js',

    'RigidBody.js'
);

var message = [];

// stage

var rigidBodies = [],
    colliders = [],
    constraints = [],

    gravity = new Vector3D();

// math

var vec = new Vector3D(),
    min = new Vector3D(),
    max = new Vector3D();
    // boundBoxA = new BoundBox(),
    // boundBoxB = new BoundBox();

// public api

var methods = {
    addObject: function(data) {
        var object = new RigidBody();

        object.collider = new BoundBox(new Vector3D(data.min.elements), new Vector3D(data.max.elements));
        object.collider.inverseMass = data.inverseMass;

        console.log(object.collider.inverseMass);

        rigidBodies.push(object);
    },
    removeObject: function(index) {
        rigidBodies.splice(index, 1);
    },
    setGravity: function(vector) {
        gravity.set(vector);
    },
    addForce: function(data) {
        rigidBodies[data.index].force.add(vec.set(data.force));
    },
    setPosition: function(data) {
        rigidBodies[data.index].position.set(data.position);
    },
    setRotation: function(data) {
        rigidBodies[data.index].rotation.set(data.rotation);
    },
    setVelocity: function(data) {
        rigidBodies[data.index].velocity.set(data.velocity);
    },
    simulate: function(dt) {
        for (var object1, i = 0; object1 = rigidBodies[i]; i++) {
            for (var object2, j = i + 1; object2 = rigidBodies[j]; j++) {
                transformAABB(object1.matrix, object1.collider.min, object1.collider.max, min, max);
            }
        }

        for (var object, i = 0; object = rigidBodies[i]; i++) {
            var offset = i * 3,

                p = object.position,
                r = object.rotation,

                vl = object.linearVelocity,
                va = object.angularVelocity,

                f = object.force,
                t = object.torque,

                im = object.collider.inverseMass,
                dl = object.collider.linearDrag,
                da = object.collider.angularDrag;

            f.add(vec.copyFrom(gravity));
            // f.sub(vec.copyFrom(vl).normalize().scale(0.5 * vl.lengthSquared * dl));

            // v += (f / m + g) * dt

            vl.add(vec.copyFrom(f).scale(im).scale(dt));

            // p += v * dt

            p.add(vec.copyFrom(vl).scale(dt));

            object.matrix.recompose(p.x, p.y, p.z, r.x, r.y, r.z, 1, 1, 1);

            message[offset] = object.position.x;
            message[offset + 1] = object.position.y;
            message[offset + 2] = object.position.z;

            f.set([0, 0, 0]);
            t.set([0, 0, 0]);
        }

        postMessage(message);
    }
};

onmessage = function(event) {
    methods[event.data.method](event.data.arguments);
}

// aabb utils

var center = new Vector3D(),
    extent = new Vector3D();

function transformAABB(matrix, localMin, localMax, globalMin, globalMax) {
    center.copyFrom(localMax).add(localMin).scale(0.5);
    extent.copyFrom(localMax).sub(localMin).scale(0.5);

    center.transform(matrix);

    var ex = extent.dot(vec.set(matrix.elements, 0).absolute()),
        ey = extent.dot(vec.set(matrix.elements, 4).absolute()),
        ez = extent.dot(vec.set(matrix.elements, 8).absolute());

    extent[0] = ex;
    extent[1] = ey;
    extent[2] = ez;

    globalMin.copyFrom(center).sub(extent);
    globalMax.copyFrom(center).add(extent);
}
