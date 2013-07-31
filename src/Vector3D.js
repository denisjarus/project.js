function Vector3D(elements) {
    if (!elements || elements.length !== 3) {
        elements = new Float32Array(3);
    } else if (elements instanceof Float32Array === false) {
        elements = new Float32Array(elements);
    }
    
    Object.defineProperties(this, {
        elements: { value: elements }
    });
}

Object.defineProperties(Vector3D.prototype, {
    clone: {
        value: function() {
            return new Vector3D(this.elements);
        }
    },
    copyFrom: {
        value: function(vector) {
            if (vector instanceof Vector3D === false) {
                throw new TypeError();
            }

            this.elements.set(vector.elements);

            return this;
        }
    },
    add: {
        value: function(vector) {
            if (vector instanceof Vector3D === false) {
                throw new TypeError();
            }

            var a = this.elements,
                b = vector.elements;

            a[0] += b[0];
            a[1] += b[1];
            a[2] += b[2];
            
            return this;
        }
    },
    subtract: {
        value: function(vector) {
            if (vector instanceof Vector3D === false) {
                throw new TypeError();
            }

            var a = this.elements,
                b = vector.elements;

            a[0] -= b[0];
            a[1] -= b[1];
            a[2] -= b[2];

            return this;
        }
    },
    cross: {
        value: function(vector) {
            if (vector instanceof Vector3D === false) {
                throw new TypeError();
            }

            var a = this.elements,
                b = vector.elements,
                x = a[0],
                y = a[1],
                z = a[2];

            a[0] = y * b[2] - z * b[1];
            a[1] = z * b[0] - x * b[2];
            a[2] = x * b[1] - y * b[0];

            return this;
        }
    },
    distance: {
        value: function(vector) {
            if (vector instanceof Vector3D === false) {
                throw new TypeError();
            }

            var a = this.elements,
                b = vector.elements,
                x = b[0] - a[0],
                y = b[1] - a[1],
                z = b[2] - a[2];
            
            return Math.sqrt(x * x + y * y + z * z);
        }
    },
    dot: {
        value: function(vector) {
            if (vector instanceof Vector3D === false) {
                throw new TypeError();
            }

            var a = this.elements,
                b = vector.elements;

            return (
                a[0] * b[0] +
                a[1] * b[1] +
                a[2] * b[2]
            );
        }
    },
    length: {
        get: function() {
            var vec = this.elements;

            return Math.sqrt(
                vec[0] * vec[0] +
                vec[1] * vec[1] +
                vec[2] * vec[2]
            );
        }
    },
    lengthSquared: {
        get: function() {
            var vec = this.elements;

            return (
                vec[0] * vec[0] +
                vec[1] * vec[1] +
                vec[2] * vec[2]
            );
        }
    },
    negate: {
        value: function() {
            var vec = this.elements;

            vec[0] = -vec[0];
            vec[1] = -vec[1];
            vec[2] = -vec[2];

            return this;
        }
    },
    normalize: {
        value: function() {
            var vec = this.elements,
                len = 1 / (this.length || 1);

            vec[0] *= len;
            vec[1] *= len;
            vec[2] *= len;

            return this;
        }
    },
    scale: {
        value: function(scalar) {
            var vec = this.elements;

            vec[0] *= scalar;
            vec[1] *= scalar;
            vec[2] *= scalar;

            return this;
        }
    },
    transform: {
        value: function(matrix) {
            if (matrix instanceof Matrix3D === false) {
                throw new TypeError();
            }
            
            var vec = this.elements,
                mat = matrix.elements,
                x = vec[0],
                y = vec[1],
                z = vec[2],
                
                w = 1 / (mat[3] * x + mat[7] * y + mat[11] * z + mat[15]);

            vec[0] = (mat[0] * x + mat[4] * y + mat[ 8] * z + mat[12]) * w;
            vec[1] = (mat[1] * x + mat[5] * y + mat[ 9] * z + mat[13]) * w;
            vec[2] = (mat[2] * x + mat[6] * y + mat[10] * z + mat[14]) * w;

            return this;
        }
    },
    x: {
        get: function() {
            return this.elements[0];
        },
        set: function(value) {
            this.elements[0] = value;
        }
    },
    y: {
        get: function() {
            return this.elements[1];
        },
        set: function(value) {
            this.elements[1] = value;
        }
    },
    z: {
        get: function() {
            return this.elements[2];
        },
        set: function(value) {
            this.elements[2] = value;
        }
    }
});