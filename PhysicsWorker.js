'use strict';

importScripts(
    'src/Matrix3D.js',
    'src/Vector3D.js',
    'src/Collider.js',
    'src/BoundBox.js',

    'RigidBody.js'
);

var message = [];

// stage

var rigidBodies = [],
    colliders = [],
    constraints = [],

    gravity = new Vector3D();

// math

var vec = new Vector3D();

// public api

var methods = {
    addObject: function(data) {
        var object = new RigidBody();

        object.collider = new BoundBox();

        console.log(JSON.stringify(data));

        rigidBodies.push(object);
    },
    removeObject: function(index) {
        rigidBodies.splice(index, 1);
    },
    setGravity: function(value) {
        gravity.set(value.elements);
    },
    addForce: function(data) {
        var object = rigidBodies[data.index];

        object.force.add(vec.set(data.force));
    },
    setVelocity: function(data) {
        var object = rigidBodies[data.index];

        object.velocity.set(data.velocity);

    },
    simulate: function(dt) {
        for (var object, i = 0; object = rigidBodies[i]; i++) {
            var offset = i * 3,

                p = object.position,
                v = object.velocity,
                f = object.force,

                m = object.collider.mass,
                d = object.collider.drag;

            f.add(vec.copyFrom(gravity).scale(m));
            f.sub(vec.copyFrom(v).normalize().scale(0.5 * v.lengthSquared * d));

            // v += (f / m) * dt

            v.add(vec.copyFrom(f).scale(1 / m).scale(dt));

            // p += v * dt

            p.add(vec.copyFrom(v).scale(dt));

            message[offset] = object.position.x;
            message[offset + 1] = object.position.y;
            message[offset + 2] = object.position.z;

            f.set([0, 0, 0]);
        }

        postMessage(message);
    }
};

onmessage = function(event) {
    methods[event.data.method](event.data.data);
}

// collision detection

function aabb(a, b, result) {

}
