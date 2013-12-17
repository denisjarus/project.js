function BoundBox(min, max) {

    Collider.call(this);

    Object.defineProperties(this, {
        min: { value: min instanceof Vector3D ? min : new Vector3D(), enumerable: true },
        max: { value: max instanceof Vector3D ? max : new Vector3D(), enumerable: true }
    });
}

BoundBox.prototype = Object.create(Collider.prototype, {
    clone: {
        value: function() {
            return new BoundBox(this.min.clone(), this.max.clone());
        }
    },
    copyFrom: {
        value: function(boundBox) {
            if (!(boundBox instanceof BoundBox)) {
                throw new TypeError();
            }

            this.min.copyFrom(boundBox.min);
            this.max.copyFrom(boundBox.max);
            
            return this;
        }
    },
    transform: {
        value: (function() {
            var currentMin = new Float32Array(3),
                currentMax = new Float32Array(3);

            return function(matrix) {
                if (!(matrix instanceof Matrix3D)) {
                    throw new TypeError();
                }

                var min = this.min.elements,
                    max = this.max.elements,
                    mat = matrix.elements;

                currentMin.set(min);
                currentMax.set(max);

                for (var i = 0; i < 3; i++) {
                    min[i] = max[i] = mat[12 + i];

                    for (var j = 0; j < 3; j++) {
                        var a = mat[i * 4 + j] * currentMin[j],
                            b = mat[i * 4 + j] * currentMax[j];

                        if (a < b) {
                            min[i] += a;
                            max[i] += b;
                        } else {
                            min[i] += b;
                            max[i] += a;
                        }
                    }
                }

                return this;
            }
        })()
    },
    getSupport: {
        value: function(direction) {
            var support = new Vector3D();

            support.x = direction.x >= 0 ? this.max.x : this.min.x;
            support.y = direction.y >= 0 ? this.max.y : this.min.y;
            support.z = direction.z >= 0 ? this.max.z : this.min.z;

            return support;
        }
    },
    sizeX: {
        get: function() {
            return this.max.x - this.min.x;
        },
        set: function(value) {
            this.max.x = this.min.x + value;
        }
    },
    sizeY: {
        get: function() {
            return this.max.y - this.min.y;
        },
        set: function(value) {
            this.max.y = this.min.y + value;
        }
    },
    sizeZ: {
        get: function() {
            return this.max.z - this.min.z;
        },
        set: function(value) {
            this.max.z = this.min.z + value;
        }
    }
});