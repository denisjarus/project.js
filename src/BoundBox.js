function BoundBox(min, max) {
	Object.defineProperties(this, {
		min: { value: min instanceof Vector3D ? min : new Vector3D(), writable: true },
		max: { value: max instanceof Vector3D ? max : new Vector3D(), writable: true }
	});
}

Object.defineProperties(BoundBox.prototype, {
	clone: {
		value: function() {
			return new BoundBox(this.min, this.max);
		}
	},
	intersects: {
		value: function(toIntersect) {
			if (toIntersect instanceof BoundBox == false) {
				throw new Error();
			}
			//TO DO
			return false;
		}
	},
	intersection: {
		value: function(toIntersect) {
			if (toIntersect instanceof BoundBox == false) {
				throw new Error();
			}
			//TO DO
			return new Vector3D();
		}
	}
});