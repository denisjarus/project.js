function Geometry() {
    
    EventDispatcher.call(this);

    Object.defineProperties(this, {
        id: { value: Geometry._counter++ },

        _data: { value: {} },
        _strides: { value: {} },
        _offsets: { value: {} },

        _indices: { value: null, writable: true },

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
                throw new TypeError();
            }

            var resize = !this._data[attribute] || this._data[attribute].length !== data.length;

            this._data[attribute] = data;
            this._strides[attribute] = stride || 0;
            this._offsets[attribute] = offset || 0;

            if (attribute === Geometry.VERTEX_POSITION) {
                this._update = true;
            }

            this.dispatchEvent(new DataEvent(DataEvent.VERTICES_CHANGE, attribute, resize));
        }
    },
    indices: {
        get: function() {
            return this._indices;
        },
        set: function(data) {
            if (data instanceof Uint16Array === false) {
                throw new TypeError();
            }

            if (data.length % 3 !== 0) {
                throw new Error();
            }

            var resize = !this._indices || this._indices.length !== data.length;

            this._indices = data;

            this._update = true;
            
            this.dispatchEvent(new DataEvent(DataEvent.INDICES_CHANGE, null, resize));
        }
    }
});

Object.defineProperties(Geometry, {
    _counter: { value: 0, writable: true },

    VERTEX_POSITIONS: { value: 'position' },
    VERTEX_TEXCOORDS: { value: 'texcoord' },
    VERTEX_NORMALS: { value: 'normal' },

    FACE_NORMALS: { value: 'faceNormal' },

    interleave: {
        value: function (a, b, stride, offset) {
            if (a instanceof Float32Array === false || b instanceof Float32Array === false) {
                throw new TypeError();
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
            var faceIndices = geometry._indices,
                faceNormals = geometry._data[Geometry.FACE_NORMALS],

                positions = geometry._data[Geometry.VERTEX_POSITIONS],
                stride = geometry._strides[Geometry.VERTEX_POSITIONS] || 3,
                offset = geometry._offsets[Geometry.VERTEX_POSITIONS],

                normals = geometry._data[Geometry.VERTEX_NORMALS],
                length = positions.length / stride * 3,

                a = new Vector3D(),
                ab = new Vector3D(),
                ac = new Vector3D();

            if (!positions || !faceIndices) {
                return;
            }
            if (!faceNormals || faceNormals.length !== faceIndices.length) {
                faceNormals = new Float32Array(faceIndices.length);
            }
            if (!normals || normals.length !== length) {
                normals = new Float32Array(length);
            }

            for (var i = 0, len = faceIndices.length; i < len; i += 3) {

                // get positions

                var index = offset + faceIndices[i] * stride;
                a.elements[0] = positions[index];
                a.elements[1] = positions[index + 1];
                a.elements[2] = positions[index + 2];

                index = offset + faceIndices[i + 1] * stride;
                ab.elements[0] = positions[index];
                ab.elements[1] = positions[index + 1];
                ab.elements[2] = positions[index + 2];
                ab.subtract(a);

                index = offset + faceIndices[i + 2] * stride;
                ac.elements[0] = positions[index];
                ac.elements[1] = positions[index + 1];
                ac.elements[2] = positions[index + 2];
                ac.subtract(a);

                // calculate face normal

                var normal = weighted ? ab.cross(ac) : ab.cross(ac).normalize(),
                    x = normal.elements[0],
                    y = normal.elements[1],
                    z = normal.elements[2];

                faceNormals.set(weighted ? normal.normalize().elements : normal.elements, i);

                // update vertex normals

                index = faceIndices[i] * 3;
                normals[index] += x;
                normals[index + 1] += y;
                normals[index + 2] += z;

                index = faceIndices[i + 1] * 3;
                normals[index] += x;
                normals[index + 1] += y;
                normals[index + 2] += z;

                index = faceIndices[i + 2] * 3;
                normals[index] += x;
                normals[index + 1] += y;
                normals[index + 2] += z;
            }

            // normalize vertex normals

            for (i = 0, len = normals.length; i < len; i += 3) {
                a.elements[0] = normals[i];
                a.elements[1] = normals[i + 1];
                a.elements[2] = normals[i + 2];
                
                a.normalize();

                normals.set(a.elements, i);
            }

            geometry.setData(Geometry.VERTEX_NORMALS, normals);
            geometry.setData(Geometry.FACE_NORMALS, faceNormals);
        }
    }
});