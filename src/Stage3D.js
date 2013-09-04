function Stage3D() {

    Object3D.call(this);

    Object.defineProperties(this, {
        _objects: { value: [] }
    });

    var objects = this._objects;

    this.addEventListener(Event3D.ADDED, function(event) {
        addObject(event.target);
    });

    function addObject(object) {
        objects.push(object);
        for (var child, i = 0; child = object._children[i]; i++) {
            addObject(child);
        }
    }

    this.addEventListener(Event3D.REMOVED, function(event) {
        removeObject(event.target)
    });

    function removeObject(object) {
        objects.splice(objects.indexOf(object), 1);
        for (var child, i = 0; child = object._children[i]; i++) {
            removeObject(object);
        }
    }
}

Stage3D.prototype = Object.create(Object3D.prototype, {

});
