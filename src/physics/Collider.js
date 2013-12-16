function Collider() {
    Object.defineProperties(this, {
        inverseMass: { value: 1, writable: true, enumerable: true },
        linearDrag: { value: 1, writable: true, enumerable: true },
        angularDrag: { value: 1, writable: true, enumerable: true }
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
	}
});
