function SurfaceGeometry(x, y, z, uArray, vArray) {

    Geometry.call(this);

    var uLength = uArray.length,
        vLength = vArray.length,

        positions = [],
        texcoords = [],
        indices = [];

    for (var u, i = 0; (u = uArray[i]) !== undefined; i++) {
        for (var v, j = 0; (v = vArray[j]) !== undefined; j++) {
            positions.push(x(u, v), y(u, v), z(u, v));
            texcoords.push(i / (uLength - 1), j / (vLength - 1));
        }
    }
    
    for (i = 0; i < uLength - 1; i++) {
        for (j = 0; j < vLength - 1; j++) {
            var a = i * vLength + j,
                b = a + vLength;

            indices.push(
                a, a + 1, b,
                a + 1, b + 1, b
            );
        }
    }

    this.setData(Geometry.POSITION, new Float32Array(positions));
    this.setData(Geometry.TEXCOORD, new Float32Array(texcoords));
    this.indices = new Uint16Array(indices);
}

SurfaceGeometry.prototype = Object.create(Geometry.prototype);