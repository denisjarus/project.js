function Geometry() {
    
    EventDispatcher.call(this);

    Object.defineProperties(this, {
        id: { value: Geometry._counter++ },

        _data: { value: {} },
        _strides: { value: {} },
        _offsets: { value: {} },

        _indices: { value: null, writable: true },
        _normals: { value: null, writable: true },

        _update: { value: false, writable: true }
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

            if (attribute === Geometry.POSITION) {
                this._update = true;
            }

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

            if (data.length % 3 !== 0) {
                throw new Error();
            }

            var resize = !this._indices || this._indices.length !== data.length;

            this._indices = data;

            this._update = true;
            
            this.dispatchEvent(new DataEvent(DataEvent.VERTEX_INDICES_CHANGE, null, resize));
        }
    },
    normals: {
        get: function() {
            var positions = this._data[Geometry.POSITION],
                stride = this._strides[Geometry.POSITION] || 3,
                offset = this._offsets[Geometry.POSITION],

                indices = this._indices,
                normals = this._normals;

            if (!indices || !positions) {
                return null;
            }

            if (!normals || normals.length !== indices.length) {
                normals = new Float32Array(indices.length);
            }

            if (this._update) {
                this._update = false;

                var a = new Vector3D(),
                    ab = new Vector3D(),
                    ac = new Vector3D();

                for (var i = 0, len = indices.length; i < len; i += 3) {
                    var index = offset + indices[i] * stride;
                    a.elements[0] = positions[index];
                    a.elements[1] = positions[index + 1];
                    a.elements[2] = positions[index + 2];

                    index = offset + indices[i + 1] * stride;
                    ab.elements[0] = positions[index];
                    ab.elements[1] = positions[index + 1];
                    ab.elements[2] = positions[index + 2];
                    ab.subtract(a);

                    index = offset + indices[i + 2] * stride;
                    ac.elements[0] = positions[index];
                    ac.elements[1] = positions[index + 1];
                    ac.elements[2] = positions[index + 2];
                    ac.subtract(a);

                    normals.set(ab.cross(ac).normalize().elements, i);
                }

                this._normals = normals;
            }

            return normals;
        }
    }
});

Object.defineProperties(Geometry, {
    _counter: { value: 0, writable: true },

    POSITION: { value: 'position' },
    TEXCOORD: { value: 'texcoord' },

    interleave: {
        value: function (a, b, stride, offset) {
            if (a instanceof Float32Array === false || b instanceof Float32Array === false) {
                throw new Error();
            }

            var array = new Float32Array(a.length + b.length);
 
            for (var i = 0, j = 0, k = 0, len = array.length; i < len; i++) {
                if (i % stride < offset) {
                    array[i] = a[j++];
                } else {
                    array[i] = b[k++];
                }
            }
 
            return array;
        }
    },
    getNormals: {
        value: function(geometry, weighted) {
            if (geometry instanceof Geometry === false) {
                throw new Error();
            }

            var positions = geometry.getData(Geometry.POSITION),
                stride = geometry.getStride(Geometry.POSITION) || 3,
                offset = geometry.getOffset(Geometry.POSITION),

                normals = new Float32Array(positions.length / stride * 3),

                indices = geometry.indices,
                faceNormals = new Float32Array(indices.length),

                a = new Vector3D(),
                ab = new Vector3D(),
                ac = new Vector3D();

            for (var i = 0, len = indices.length; i < len; i += 3) {

                // get positions

                var index = offset + indices[i] * stride;
                a.elements[0] = positions[index];
                a.elements[1] = positions[index + 1];
                a.elements[2] = positions[index + 2];

                index = offset + indices[i + 1] * stride;
                ab.elements[0] = positions[index];
                ab.elements[1] = positions[index + 1];
                ab.elements[2] = positions[index + 2];
                ab.subtract(a);

                index = offset + indices[i + 2] * stride;
                ac.elements[0] = positions[index];
                ac.elements[1] = positions[index + 1];
                ac.elements[2] = positions[index + 2];
                ac.subtract(a);

                var normal = weighted ? ab.cross(ac) : ab.cross(ac).normalize(),
                    x = normal.elements[0],
                    y = normal.elements[1],
                    z = normal.elements[2];

                // set normals

                index = indices[i] * 3;
                normals[index] += x;
                normals[index + 1] += y;
                normals[index + 2] += z;

                index = indices[i + 1] * 3;
                normals[index] += x;
                normals[index + 1] += y;
                normals[index + 2] += z;

                index = indices[i + 2] * 3;
                normals[index] += x;
                normals[index + 1] += y;
                normals[index + 2] += z;
            }

            // normalize

            for (i = 0, len = normals.length; i < len; i += 3) {
                a.elements[0] = normals[i];
                a.elements[1] = normals[i + 1];
                a.elements[2] = normals[i + 2];
                
                a.normalize();

                normals.set(a.elements, i);
            }

            return normals;
        }
    }
});