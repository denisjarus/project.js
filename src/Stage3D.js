function Stage3D() {
	Object.defineProperties(this, {
		_objects: { value: [] },
		_lights: { value: [] },

		_camera: { value: null, writable: true },

		_gl: { value: null, writable: true }
	});
}

Object.defineProperties(Stage3D.prototype, {
	camera: {
		get: function() {
			return this._camera;
		},
		set: function(camera) {
			if (camera instanceof Camera3D == false) {
				throw new Error();
			}
			this._camera = camera;
		}
	},
	canvas: {
		get: function() {
			return this._gl.canvas;
		},
		set: function(canvas) {
			if (canvas instanceof HTMLCanvasElement == false) {
				throw new Error();
			}
			this._gl = canvas.getContext(CONTEXT_WEBGL);

			if (! this._gl) { throw new Error(); }
		}
	},
	draw: {
		value: function() {
			if (! this._gl) {
				return;
			}
			var object;
			var length = this._objects.length;
			for (var i = 0; i < length; i++) {
				object = this._objects[i];
			}
		}
	}
});

const CONTEXT_WEBGL = 'experimental-webgl';