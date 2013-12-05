function RigidBody(object) {

    EventDispatcher.call(this);

    Object.defineProperties(this, {
        object: { value: object },

        mass: { value: 1, writable: true, enumerable: true },
        drag: { value: 0.01, writable: true, enumerable: true },

        _enabled: { value: true, writable: true }
    });

    if (!(object instanceof Object3D)) {
        throw new TypeError();
    }
}

RigidBody.prototype = Object.create(EventDispatcher.prototype, {
    enabled: {
        get: function() {
            return this._enabled;
        },
        set: function(value) {
            this._enabled = value;
        }
    }
});
