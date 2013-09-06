function Physics() {

    'use strict';

    // worker

    var worker = new Worker('PhysicsWorker.js');

    // current stage

    var stage = null,
        objects = [];

    // settings

    var gravity = new Vector3D([0, -9.8, 0]);

    // public api

    Object.defineProperties(this, {
        simulate: {
            value: simulate
        },
        gravity: {
            value: gravity
        }
    });

    // internal functions

    function simulate(object, dt) {
        if (!(object instanceof Object3D)) {
            throw new TypeError();
        }

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

        // worker.postMessage(':3');

        for (var object, i = 0; object = objects[i]; i++) {

        }
    }

    // stage management

    function onAdd(event) {
        addObject(event.target);
    }

    function addObject(object) {
        objects.push(object);
        for (var child, i = 0; child = object.getChildAt(i); i++) {
            addObject(child);
        }
    }

    function onRemove(event) {
        removeObject(event.target);
    }

    function removeObject(object) {
        objects.splice(objects.indexOf(object), 1);
        for (var child, i = 0; child = object.getChildAt(i); i++) {
            removeObject(child);
        }
    }

    // worker communication

    worker.onmessage = function(event) {
        // console.log(event);
    }
}