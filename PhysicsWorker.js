'use strict';

importScripts(
    'src/Matrix3D.js',
    'src/Vector3D.js'
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

            force: new Vector3D()
        });
    },
    removeObject: function(object) {
        objects.splice(objects.indexOf(object), 1);
    },
    setGravity: function(value) {
        console.log(value)
        gravity.set(value.elements);
    },
    addForce: function(object, index) {

    },
    simulate: function(dt) {
        var g = gravity;

        for (var object, i = 0; object = objects[i]; i++) {
            var offset = i * 3,
                im = object.imass,
                p = object.position,
                v = object.velocity,
                f = object.force;

            f.set([0, 0, 0]);

            // v += (f / m + g) * dt

            v.add(vec.copyFrom(f).scale(im).add(g).scale(dt));

            // p += v * dt

            p.add(vec.copyFrom(v).scale(dt));

            message[offset] = object.position.x;
            message[offset + 1] = object.position.y;
            message[offset + 2] = object.position.z;
        }

        postMessage(message);
    }
};

onmessage = function(event) {
    console.log(event.data[1])
    methods[event.data[0]].apply(self, Array.prototype.slice.call(event.data, 1));
}
