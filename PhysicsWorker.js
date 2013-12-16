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
    setGravity: function(vector) {
        gravity.set(vector);
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
                r = object.rotation,

                vl = object.linVelocity,
                va = object.angVelocity,

                f = object.force,
                t = object.torque,

                im = object.collider.inverseMass,
                dl = object.collider.linDrag,
                da = object.collider.angDrag;

            f.sub(vec.copyFrom(vl).normalize().scale(0.5 * vl.lengthSquared * dl));

            // v += (f / m + g) * dt

            vl.add(vec.copyFrom(f).scale(im).add(gravity).scale(dt));

            // p += v * dt

            p.add(vec.copyFrom(vl).scale(dt));

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

// collision detection

function aabb(a, b, result) {

}
