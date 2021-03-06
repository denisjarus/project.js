function Collider() {
    Object.defineProperties(this, {
        inverseMass: { value: 1, writable: true, enumerable: true },

        restitution: { value: 0.5, writable: true, enumerable: true },
        friction: { value: 0.5, writable: true, enumerable: true },

        linearDrag: { value: 1, writable: true, enumerable: true },
        angularDrag: { value: 1, writable: true, enumerable: true },

        sleepVelocity: { value: 0.001, writable: true, enumerable: true }
    });
}

Object.defineProperties(Collider.prototype, {
    mass: {
        get: function() {
            var value = this.inverseMass;
            return value !== 0 ? 1 / value : 0;
        },
        set: function(value) {
            this.inverseMass = value !== 0 ? 1 / value : 0;
        }
    },
    getSupport: {
        value: function() {
            return;
        }
    },
    getAabb: {
        value: function(min, max) {
            return;
        }
    }
});
