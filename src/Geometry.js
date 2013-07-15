function Geometry() {
    
    EventDispatcher.call(this);

    Object.defineProperties(this, {
        id: { value: Geometry._counter++ },

        _data: { value: {} },
        _strides: { value: {} },
        _offsets: { value: {} },

        _indices: { value: null, writable: true }
    });
}

Geometry.prototype = Object.create(EventDispatcher.prototype, {
    getData: {
        value: function(attribute) {
            return this._data[attribute];
        }
    },
    getStride: {
        value: function(attribute) {
            return this._strides[attribute];
        }
    },
    getOffset: {
        value: function(attribute) {
            return this._offsets[attribute];
        }
    },
    setData: {
        value: function(attribute, data, stride, offset) {
            if (data instanceof Float32Array === false) {
                throw new Error();
            }   
            var resize = !this._data[attribute] || this._data[attribute].length !== data.length;

            this._data[attribute] = data;
            this._strides[attribute] = stride || 0;
            this._offsets[attribute] = offset || 0;

            this.dispatchEvent(new DataEvent(DataEvent.VERTEX_ATTRIBUTE_CHANGE, attribute, resize));
        }
    },
    indices: {
        get: function() {
            return this._indices;
        },
        set: function(data) {
            if (data instanceof Uint16Array === false) {
                throw new Error();
            }
            var resize = !this._indices || this._indices.length !== data.length;

            this._indices = data;
            
            this.dispatchEvent(new DataEvent(DataEvent.VERTEX_INDICES_CHANGE, null, resize));
        }
    }
});

Object.defineProperties(Geometry, {
    _counter: { value: 0, writable: true },

    POSITION: { value: 'position' },
    TEXCOORD: { value: 'texcoord' }
});