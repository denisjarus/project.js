'use strict';

importScripts(
    'src/Matrix3D.js',
    'src/Vector3D.js'
);

var objects = [],
    gravity = null;

// public api

var methods = {
    addObject: function(object) {
        objects.push(object);
    },
    removeObject: function(object) {
        objects.splice(objects.indexOf(object), 1);
    },
    setGravity: function(value) {
        gravity = value;
    },
    simulate: function(dt) {
        for (var object, i = 0; object = objects[i]; i++) {
            object.y++;
        }

        postMessage(objects);
    }
};

onmessage = function(event) {
    methods[event.data.method](event.data.data);
}
