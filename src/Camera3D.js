function Camera3D() {

	Object3D.call(this);

	Object.defineProperties(this, {
		_aspectRatio: { value: 1.5, writable: true },
		_fieldOfView: { value: Math.PI / 2, writable: true },

		_far: { value: 1000, writable: true },
		_near: { value: 0.1, writable: true },

		_perspectiveProjection: { value: new Matrix3D() }
	});
}

Camera3D.prototype = Object.create(Object3D.prototype, {
	aspectRatio: {
		get: function() {
			return this._aspectRatio;
		},
		set: function(value) {
			this._aspectRatio = value;
		}
	},
	fieldOfView: {
		get: function() {
			return this._fieldOfView;
		},
		set: function(value) {
			this._fieldOfView = value;
		}
	},
	far: {
		get: function() {
			return this._far;
		},
		set: function(value) {
			this._far = value;
		}
	},
	near: {
		get: function() {
			return this._near;
		},
		set: function(value) {
			this._near = value;
		}
	},
	perspectiveProjection: {
		get: function() {
			return this._perspectiveProjection;
		}
	},
	project: {
		value: function(vector) {
			if (vector instanceof Vector3D == false) {
				throw new Error();
			}
			return vector;
		}
	},
	unproject: {
		value: function(vector) {
			if (vector instanceof Vector3D == false) {
				throw new Error();
			}
			return vector;
		}
	}
});