function Geometry() {
	Object.defineProperties(this, {
		_vertices: { value: [] },
		_indices: { value: null, writable: true }
	});
}

Object.defineProperties(Geometry.prototype, {
	getData: {
		value: function(attribute) {

		}
	},
	setData: {
		value: function(attribute, data) {

		}
	},
	indices: {
		get: function() {
			return this._indices;
		},
		set: function(data) {
			this._indices = new Uint16Array(data);
		}
	}
});