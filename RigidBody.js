function RigidBody(object) {
    if (!(object instanceof Object3D)) {
        throw new TypeError();
    }

    Object.defineProperties(this, {
        object: { value: object },

        mass: { value: 1, writable: true },

        _force: { value: new Vector3D() },

        _position: { value: new Vector3D([object.x, object.y, object.z]) },
        _velocity: { value: new Vector3D() },

        _enabled: { value: true, writable: true }
    });
}

Object.defineProperties(RigidBody.prototype, {
    enabled: {
        get: function() {
            return this._enabled;
        },
        set: function(value) {
            if (value === false) {
                this._position.x = this.object.x;
                this._position.y = this.object.y;
                this._position.z = this.object.z;

                this._velocity.x = 0;
                this._velocity.y = 0;
                this._velocity.z = 0;
            }

            this._enabled = value;
        }
    },
    move: {
        value: function(dt) {
            var m = this.mass,
                p = this._position,
                v = this._velocity,
                f = this._force,

                vec = new Vector3D();

            // v += (f / m) * dt

            v.add(vec.copyFrom(f).scale(1 / m * dt));

            // p += v * dt

            p.add(vec.copyFrom(v).scale(dt));

            this._force.x = 0;
            this._force.y = 0;
            this._force.z = 0;

            this.object.x = p.x;
            this.object.y = p.y;
            this.object.z = p.z;
        }
    },
    addForce: {
        value: function(force) {
            if (!(force instanceof Vector3D)) {
                throw new TypeError();
            }
            this._force.add(force);
        }
    }
});
