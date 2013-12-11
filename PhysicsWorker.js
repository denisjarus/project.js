'use strict';

importScripts(
    'src/Matrix3D.js',
    'src/Vector3D.js',
    'src/Collider.js',
    'src/BoundBox.js'
);

var objects = [],
    gravity = new Vector3D(),
    message = [];

var vec = new Vector3D();

// public api

var methods = {
    addObject: function(object) {
        objects.push({
            imass: 1 / object.mass,

            position: new Vector3D([object.x, object.y, object.z]),
            velocity: new Vector3D(),
            rotation: new Vector3D(),
            
            drag: object.drag,

            force: new Vector3D(),

            collider: object.bounds
        });
    },
    removeObject: function(index) {
        objects.splice(index, 1);
    },
    setGravity: function(value) {
        gravity.set(value.elements);
    },
    addForce: function(data) {
        var object = objects[data.index];

        object.force.add(vec.set(data.force));
    },
    setVelocity: function(data) {
        var object = objects[data.index];

        object.velocity.set(data.velocity);

    },
    simulate: function(dt) {
        var g = gravity;

        for (var object, i = 0; object = objects[i]; i++) {
            var offset = i * 3,
                im = object.imass,
                p = object.position,
                v = object.velocity,
                f = object.force,
                d = object.drag;

            f.subtract(vec.copyFrom(v).normalize().scale(v.lengthSquared * d));

            // v += (f / m + g) * dt

            v.add(vec.copyFrom(f).scale(im).add(g).scale(dt));

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
