function BoundBox(min, max) {
	Object.defineProperties(this, {
		min: { value: min instanceof Vector3D ? min : new Vector3D() },
		max: { value: max instanceof Vector3D ? max : new Vector3D() }
	});
}

Object.defineProperties(BoundBox.prototype, {
	clone: {
		value: function() {
			return new BoundBox(this.min.clone(), this.max.clone());
		}
	},
	copyFrom: {
		value: function(boundBox) {
			if (boundBox instanceof BoundBox == false) {
				throw new Error();
			}
			this.min.copyFrom(boundBox.min);
			this.max.copyFrom(boundBox.max);
			return this;
		}
	}
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