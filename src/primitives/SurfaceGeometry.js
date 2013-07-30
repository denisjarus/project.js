function SurfaceGeometry(slices, stacks) {

    Geometry.call(this);

    Object.defineProperties(this, {
        slices: { value: Math.max(0, slices || 16) },
        stacks: { value: Math.max(0, stacks || 16) }
    });

    var indices = [];

    for (var index = 0, i = 0; i < slices; i++) {
        for (var j = 0; j < stacks; j++) {
            var a = i * (stacks + 1) + j,
                b = a + (stacks + 1);

            indices.push(
                a, a + 1, b,
                a + 1, b + 1, b
            );
        }
    }

    console.log(indices.length / 3, stacks * slices)

    this.indices = new Uint16Array(indices);
}

SurfaceGeometry.prototype = Object.create(Geometry.prototype, {
    parametrize: {
        value: function(attribute, f, uMin, uMax, vMin, vMax) {
            var data = this.getData(attribute),
                slices = this.slices,
                stacks = this.stacks,
                stride = f.length,
                length = (slices + 1) * (stacks + 1) * stride;

            if (!data || data.length !== length) {
                data = new Float32Array(length);
            }

            for (var index = 0, i = 0; i <= slices; i++) {
                for (var j = 0; j <= stacks; j++) {
                    var u = uMin + (uMax - uMin) * i / slices,
                        v = vMin + (vMax - vMin) * j / stacks;

                    for (var k = 0; k < stride; k++) {
                        data[index++] = f[k](u, v);
                    }
                }
            }

            this.setData(attribute, data);
        }
    }
});
