function SphereGeometry(radius, latSegments, longSegments, minLat, minLong, maxLat, maxLong) {

    Geometry.call(this);

    Object.defineProperties(this, {
        radius: { value: radius }
    });

    latSegments = Math.max(3, latSegments || 8);
    longSegments = Math.max(3, longSegments || 8);
    minLat = minLat || 0;
    maxLat = maxLat || Math.PI;
    minLong = minLong || 0;
    maxLong = maxLong || Math.PI * 2;

    var positions = [],
        texcoords = [],
        indices = [];

    //vertices
    for (var i = 0; i <= latSegments; i++) {
        var phi = i * (maxLat - minLat) / latSegments,
            sinPhi = Math.sin(phi),
            cosPhi = Math.cos(phi);

        for (var j = 0; j <= longSegments; j++) {
            var lambda = j * (maxLong - minLong) / longSegments,
                x = Math.cos(lambda) * sinPhi,
                y = cosPhi,
                z = Math.sin(lambda) * sinPhi;

            positions.push(x * radius, y * radius, z * radius);
        }
    }

    //indices
    for (i = 0; i < latSegments; i++) {
        for (j = 0; j < longSegments; j++) {
            var a = i * (longSegments + 1) + j,
                b = a + longSegments + 1;

            indices.push(
                a, b, a + 1,
                b, b + 1, a + 1
            );
        }
    }

    this.setData('position', new Float32Array(positions));
    this.setData('texcoord', new Float32Array(texcoords));
    this.indices = new Uint16Array(indices);
}

SphereGeometry.prototype = Object.create(Geometry.prototype);