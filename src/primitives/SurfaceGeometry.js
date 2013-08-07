function SurfaceGeometry(slices, stacks) {

    Geometry.call(this);

    Object.defineProperties(this, {
        _slices: { value: slices = Math.max(0, slices || 16) },
        _stacks: { value: stacks = Math.max(0, stacks || 16) }
    });

    var indices = new Uint16Array(slices * stacks * 6),

        offset = 0;

    for (var i = 0; i < slices; i++) {
        for (var j = 0; j < stacks; j++) {
            var a = i * (stacks + 1) + j,
                b = a + 1,
                c = a + (stacks + 1),
                d = c + 1;

            indices.set([a, b, c, b, d, c], (offset++) * 6);
        }
    }

    this._indices = indices;
}

SurfaceGeometry.prototype = Object.create(Geometry.prototype, {
    parametrize: {
        value: function(attribute, f, uMin, uMax, vMin, vMax) {
            var vertices = this.getData(attribute),
                slices = this._slices,
                stacks = this._stacks,
                length = (slices + 1) * (stacks + 1) * f(uMin, vMin).length,

                offset = 0;

            if (!vertices || vertices.length !== length) {
                vertices = new Float32Array(length);
            }

            for (var i = 0; i <= slices; i++) {
                for (var j = 0; j <= stacks; j++) {
                    var u = uMin + (uMax - uMin) * i / slices,
                        v = vMin + (vMax - vMin) * j / stacks,

                        values = f(u, v);

                    vertices.set(values, (offset++) * values.length);
                }
            }

            this.setData(attribute, vertices);
        }
    },
    indices: {
        get: function() {
            return this._indices;
        },
        set: function() {
            console.warn('parametric geometry indices are immutable');
        }
    }
});
