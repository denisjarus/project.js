function Vector3D(x, y, z) {
	Object.defineProperties(this, {
		x: { value: x || 0, writable: true },
		y: { value: y || 0, writable: true },
		z: { value: z || 0, writable: true }
	});
}

Object.defineProperties(Vector3D.prototype, {
	add: {
		value: function(vector) {
			if (vector instanceof Vector3D == false) {
				throw new Error();
			}
			this.x += vector.x;
			this.y += vector.y;
			this.z += vector.z;
			return this;
		}
	},
	subtract: {
		value: function(vector) {
			if (vector instanceof Vector3D == false) {
				throw new Error();
			}
			this.x -= vector.x;
			this.y -= vector.y;
			this.z -= vector.z;
			return this;
		}
	},
	clone: {
		value: function() {
			return new Vector3D(this.x, this.y, this.z);
		}
	},
	copyFrom: {
		value: function(vector) {
			if (vector instanceof Vector3D == false) {
				throw new Error();
			}
			this.x = vector.x;
			this.y = vector.y;
			this.z = vector.z;
			return this;
		}
	},
	cross: {
		value: function(vector) {
			this.x = this.y * vector.z - this.z * vector.y;
			this.y = this.z * vector.x - this.x * vector.z;
			this.z = this.x * vector.y - this.y * vector.x;
			return this;
		}
	},
	distance: {
		value: function(vector) {
			var dx = vector.x - this.x,
				dy = vector.y - this.y,
				dz = vector.z - this.z;
				
			return Math.sqrt(dx * dx + dy * dy + dz * dz);
		}
	},
	dot: {
		value: function(vector) {
			return (
				this.x * vector.x +
				this.y * vector.y +
				this.z * vector.z
				);
		}
	},
	length: {
		get: function() {
			return Math.sqrt(
				this.x * this.x +
				this.y * this.y +
				this.z * this.z
				);
		}
	},
	lengthSquared: {
		get: function() {
			return (
				this.x * this.x +
				this.y * this.y +
				this.z * this.z
				);
		}
	},
	negate: {
		value: function() {
			this.x = - this.x;
			this.y = - this.y;
			this.z = - this.z;
			return this;
		}
	},
	normalize: {
		value: function() {
			var length = 1 / (this.length || 1);
			this.x *= length;
			this.y *= length;
			this.z *= length;
			return this;
		}
	},
	scale: {
		value: function(scalar) {
			this.x *= scalar;
			this.y *= scalar;
			this.z *= scalar;
			return this;
		}
	},
	transform: {
		value: function(matrix) {
			if (matrix instanceof Matrix3D == false) {
				throw new Error();
			}
			var m = matrix.elements,
				x = this.x,
				y = this.y,
				z = this.z;

			//calculate 1 / w
			var	w = 1 / (m[3] * x + m[7] * y + m[11] * z + m[15]);

			this.x = (m[0] * x + m[4] * y + m[ 8] * z + m[12]) * w;
			this.y = (m[1] * x + m[5] * y + m[ 9] * z + m[13]) * w;
			this.z = (m[2] * x + m[6] * y + m[10] * z + m[14]) * w;

			return this;
		}
	}
});