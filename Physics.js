function Physics() {

    'use strict';

    // worker

    var worker = new Worker('PhysicsWorker.js');

    // current stage

    var stage = null,
        objects = [],
        gravity = null;

    var simulating = false;

    // public api

    Object.defineProperties(this, {
        simulate: {
            value: simulate
        },
        gravity: {
            get: function() {
                return gravity;
            },
            set: function(value) {
                gravity = value;
                message('setGravity', value.elements);
            }
        },
        addForce: {
            value: function(object, force) {
                if (!(object instanceof Object3D)) {
                    throw new TypeError();
                }
                if (!(force instanceof Vector3D)) {
                    throw new TypeError();
                }

                message('addForce', {index: objects.indexOf(object), force: force.elements});
            }
        },
        setVelocity: {
            value: function(object, velocity) {
                if (!(object instanceof Object3D)) {
                    throw new TypeError();
                }
                if (!(velocity instanceof Vector3D)) {
                    throw new TypeError();
                }

                message('setVelocity', {index: objects.indexOf(object), velocity: velocity.elements});
            }
        }
    });

    // settings

    this.gravity = new Vector3D([0, -9.8, 0]);

    // internal functions

    function simulate(object, dt) {
        if (!(object instanceof Object3D)) {
            throw new TypeError();
        }

        if (simulating === true) {
            return false;
        }

        simulating = true;

        if (stage !== object) {
            if (stage) {
                stage.removeEventListener(Event3D.ADDED, onAdd);
                stage.removeEventListener(Event3D.REMOVED, onRemove);

                removeObject(stage);
            }
            stage = object;
            stage.addEventListener(Event3D.ADDED, onAdd);
            stage.addEventListener(Event3D.REMOVED, onRemove);

            addObject(stage);
        }

        message('simulate', dt);
    }

    function updateScene(data) {
        for (var object, i = 0; object = objects[i]; i++) {
            var offset = i * 3;
            object.x = data[offset];
            object.y = data[offset + 1];
            object.z = data[offset + 2];
        }

        simulating = false;
    }

    // stage management

    function onAdd(event) {
        addObject(event.target);
    }

    function addObject(object) {
        if (object.collider) {
            objects.push(object);

            message('addObject', object.collider);
        }

        for (var child, i = 0; child = object.getChildAt(i); i++) {
            addObject(child);
        }
    }

    function onRemove(event) {
        removeObject(event.target);
    }

    function removeObject(object) {
        if (object.collider) {
            var index = objects.indexOf(object);

            objects.splice(index, 1);

            message('removeObject', index);
        }
        for (var child, i = 0; child = object.getChildAt(i); i++) {
            removeObject(child);
        }
    }

    // worker communication

    function message(method, args) {
        worker.postMessage({method: method, arguments: args});
    }

    worker.onmessage = function(event) {
        updateScene(event.data);
    }
}
