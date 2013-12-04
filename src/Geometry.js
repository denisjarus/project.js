function Geometry() {
    
    EventDispatcher.call(this);

    Object.defineProperties(this, {
        id: { value: Geometry._counter++ },

        _data: { value: {} },

        _indices: { value: null, writable: true },
        _normals: { value: null, writable: true }
    });
}

Geometry.prototype = Object.create(EventDispatcher.prototype, {
    attributes: {
        get: function() {
            return Object.keys(this._data);
        }
    },
    getData: {
        value: function(attribute) {
            return this._data[attribute] || null;
        }
    },
    setData: {
        value: function(attribute, data) {
            if (!(data instanceof Float32Array)) {
                throw new TypeError();
            }

            this._data[attribute] = data;
            this.dispatchEvent(new GeometryEvent(GeometryEvent.UPDATE, attribute, data));
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

            this._indices = data;
            this.dispatchEvent(new GeometryEvent(GeometryEvent.INDICES_UPDATE, null, data));
        }
    },
    normals: {
        get: function() {
            return this._normals;
        }
    }
});

Object.defineProperties(Geometry, {
    _counter: { value: 0, writable: true },

    POSITION: { value: 'position' },
    TEXCOORD: { value: 'texcoord' },
    NORMAL: { value: 'normal' },

    getNormals: {
        value: (function() {
            var normal = new Vector3D(),

                a = new Vector3D(),
                b = new Vector3D(),
                c = new Vector3D();

            return function(geometry, weighted, stride, offset) {
                var positions = geometry._data[Geometry.POSITION],
                    stride = stride || 3,
                    offset = offset || 0,

                    indices = geometry._indices,

                    faceNormals = geometry._normals,
                    faceNormalsLength = indices.length,

                    vertexNormals = geometry._data[Geometry.NORMAL],
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

                    a.set(vertexNormals, indices[i] * 3).add(normal);
                    b.set(vertexNormals, indices[i + 1] * 3).add(normal);
                    c.set(vertexNormals, indices[i + 2] * 3).add(normal);

                    vertexNormals.set(a.elements, indices[i] * 3);
                    vertexNormals.set(b.elements, indices[i + 1] * 3);
                    vertexNormals.set(c.elements, indices[i + 2] * 3);

                    if (weighted) { normal.normalize(); }

                    faceNormals.set(normal.elements, i);
                }

                // normalize vertex normals

                for (var i = 0; i < vertexNormalsLength; i += 3) {
                    normal.set(vertexNormals, i).normalize();
                    vertexNormals.set(normal.elements, i);
                }

                geometry._normals = faceNormals;
                geometry.setData(Geometry.NORMAL, vertexNormals);
            };
        })()
    }
});
