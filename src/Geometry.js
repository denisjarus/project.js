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
            if (!(data instanceof Float32Array)) {
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
            if (!(data instanceof Uint16Array)) {
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
            if (!(a instanceof Float32Array) || !(b instanceof Float32Array)) {
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
        value: (function() {
            var normal = new Vector3D(),

                a = new Vector3D(),
                b = new Vector3D(),
                c = new Vector3D();

            return function(geometry, weighted) {
                var positions = geometry._data[Geometry.VERTEX_POSITIONS],
                    stride = geometry._strides[Geometry.VERTEX_POSITIONS] || 3,
                    offset = geometry._offsets[Geometry.VERTEX_POSITIONS],

                    indices = geometry._indices,

                    faceNormals = geometry._data[Geometry.FACE_NORMALS],
                    faceNormalsLength = indices.length,

                    vertexNormals = geometry._data[Geometry.VERTEX_NORMALS],
                    vertexNormalsLength = positions.length / stride * 3;

                if (!positions || !indices) {
                    return;
                }
                if (!faceNormals || faceNormals.length !== faceNormalsLength) {
                    faceNormals = new Float32Array(faceNormalsLength);
                }
                if (!vertexNormals || vertexNormals.length !== vertexNormalsLength) {
                    vertexNormals = new Float32Array(vertexNormalsLength);
                } else {
                    for (var i = 0; i < vertexNormalsLength; i++) {
                        vertexNormals[i] = 0;
                    }
                }

                for (var i = 0; i < faceNormalsLength; i += 3) {

                    // get vertex positions

                    a.set(positions, offset + indices[i] * stride);
                    b.set(positions, offset + indices[i + 1] * stride).subtract(a);
                    c.set(positions, offset + indices[i + 2] * stride).subtract(a);

                    // calculate face normal

                    normal.copyFrom(c.cross(b));

                    if (!weighted) { normal.normalize(); }

                    // append face normal to each vertex normal in a face

                    var index = indices[i] * 3;
                    a.set(vertexNormals, index).add(normal);
                    vertexNormals.set(a.elements, index);

                    index = indices[i + 1] * 3;
                    b.set(vertexNormals, index).add(normal);
                    vertexNormals.set(b.elements, index);

                    index = indices[i + 2] * 3;
                    c.set(vertexNormals, index).add(normal);
                    vertexNormals.set(c.elements, index);

                    if (weighted) { normal.normalize(); }

                    faceNormals.set(normal.elements, i);
                }

                // normalize vertex normals

                for (var i = 0; i < vertexNormalsLength; i += 3) {
                    normal.set(vertexNormals, i).normalize();
                    vertexNormals.set(normal.elements, i);
                }

                geometry.setData(Geometry.VERTEX_NORMALS, vertexNormals);
                geometry.setData(Geometry.FACE_NORMALS, faceNormals);
            };
        })()
    }
});
