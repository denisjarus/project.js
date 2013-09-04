function Stage3D() {

    Object3D.call(this);

    var objects = [];

    Object.defineProperties(this, {
        _objects: { value: objects }
    });

    this.addEventListener(Event3D.ADDED, onAdded);
    this.addEventListener(Event3D.REMOVED, onRemoved);
    this.addEventListener(Event3D.GEOMETRY_CHANGE, onChange);
    this.addEventListener(Event3D.MATERIAL_CHANGE, onChange);

    function onAdded(event) {
        addObject(event.target, true);
    }

    function addObject(object, recursive) {
        if (object instanceof Mesh) {
            if (objects.length && object.geometry && object.material) {
                for (var obj, i = 0; obj = objects[i]; i++) {
                    if (object.material.shader.id > obj.material.shader.id) {
                        if (object.geometry.id > obj.geometry.id) {
                            if (object.material.id > obj.material.id) {
                                objects.splice(i, 0, object);
                                break;
                            }
                        }
                    }
                }
            } else {
                objects.push(object);
            }
        }
        if (recursive) {
            for (var child, i = 0; child = object._children[i]; i++) {
                addObject(child);
            }
        }
    }

    function onRemoved(event) {
        removeObject(event.target, true);
    }

    function removeObject(object, recursive) {
        objects.splice(objects.indexOf(object), 1);
        if (recursive) {
            for (var child, i = 0; child = object._children[i]; i++) {
                removeObject(child);
            }
        }
    }

    function onChange(object) {
        removeObject(object);
        addObject(object);
    }
}

Stage3D.prototype = Object.create(Object3D.prototype, {
    getObjects: {
        value: function() {
            return this._objects.slice(0);
        }
    }
});
