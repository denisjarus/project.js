'use strict';

importScripts(
    'src/Matrix3D.js',
    'src/Vector3D.js',
    'src/Collider.js',
    'src/BoundBox.js'
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
    addObject: function(object) {
        rigidBodies.push({
            mass: object.mass,
            massInv: object.mass !== 0 ? 1 / object.mass : 0,
            drag: object.drag,

            position: new Vector3D([object.x, object.y, object.z]),
            velocity: new Vector3D(),
            rotation: new Vector3D(),

            force: new Vector3D()
        });
    },
    addCollider: function(data) {
        var collider;

        switch (data.type) {
            case 'BoundBox': 
                collider = new BoundBox(data.min, data.max);
                break;
        }

        console.log('FUCK');
        console.log(collider.min.x, collider.min.y, collider.min.z);
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

                m = object.mass,
                im = object.massInv,
                d = object.drag,

                p = object.position,
                v = object.velocity,
                f = object.force;

            f.add(vec.copyFrom(gravity).scale(m));
            f.sub(vec.copyFrom(v).normalize().scale(0.5 * v.lengthSquared * d));

            // v += (f / m) * dt

            v.add(vec.copyFrom(f).scale(im).scale(dt));

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
