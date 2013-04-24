function Geometry() {
	
	EventDispatcher.call(this);

	Object.defineProperties(this, {
		id: { value: Geometry._counter++ },

		_vertices: { value: {} },

		_indices: { value: null, writable: true }
	});
}

Geometry.prototype = Object.create(EventDispatcher.prototype, {
	getData: {
		value: function(attribute) {
			return this._vertices[attribute];
		}
	},
	setData: {
		value: function(attribute, data) {
			var array = this._vertices[attribute];
			if (array && array.length == data.length) {
				array.set(data);
			} else {
				this._vertices[attribute] = new Float32Array(data);
			}
			this.dispatchEvent(
				new GeometryEvent(GeometryEvent.VERTEX_ATTRIBUTE_CHANGE, attribute)
				);
		}
	},
	attributes: {
		get: function() {
			return Object.keys(this._vertices);
		}
	},
	indices: {
		get: function() {
			return this._indices;
		},
		set: function(data) {
			var array = this._indices;
			if (array && array.length == data.length) {
				array.set(data);
			} else {
				this._indices = new Uint32Array(data);
			}
			this.dispatchEvent(
				new GeometryEvent(GeometryEvent.VERTEX_INDICES_CHANGE, null)
				);
		}
	}
});

Object.defineProperties(Geometry, {
	_counter: { value: 0, writable: true },

	POSITION: { value: 'position' },
	TEXCOORD: { value: 'texCoord' },
	NORMAL: { value: 'normal' },
	TANGENT: { value: 'tangent' }
});