function SurfaceGeometry(slices, stacks) {

    Geometry.call(this);

    Object.defineProperties(this, {
        slices: { value: slices || 16 },
        stacks: { value: stacks || 16 }
    });

    var indices = [];

    for (var i = 0; i < slices - 1; i++) {
        for (var j = 0; j < stacks - 1; j++) {
            var a = i * stacks + j,
                b = a + stacks;

            indices.push(
                a, a + 1, b,
                a + 1, b + 1, b
            );
        }
    }
    this.setData(Geometry.POSITION, new Float32Array(slices * stacks * 3));
    this.setData(Geometry.TEXCOORD, new Float32Array(slices * stacks * 2));
    this.indices = new Uint16Array(indices);
}

SurfaceGeometry.prototype = Object.create(Geometry.prototype, {
    set: {
        value: function(x, y, z, uMin, uMax, vMin, vMax) {
            var positions = this.getData(Geometry.POSITION),
                texcoords = this.getData(Geometry.TEXCOORD),
                index1 = 0,
                index2 = 0;

            for (var i = 0; i < this.slices; i++) {
                for (var j = 0; j < this.stacks; j++) {
                    var u = uMin + (uMax - uMin) * i / (this.slices - 1),
                        v = vMin + (vMax - vMin) * j / (this.stacks - 1);

                    positions[index1++] = x(u, v);
                    positions[index1++] = y(u, v);
                    positions[index1++] = z(u, v);
                    texcoords[index2++] = 20 * i / (this.slices - 1);
                    texcoords[index2++] = 2 * j / (this.stacks - 1);
                }
            }

            var vertices = Geometry.interleave(positions, texcoords, 5, 3);

            this.setData(Geometry.POSITION, vertices, 5, 0);
            this.setData(Geometry.TEXCOORD, vertices, 5, 3);

            console.log(this.getData(Geometry.POSITION) === this.getData(Geometry.TEXCOORD))
        }
    }
});
