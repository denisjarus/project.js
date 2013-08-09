function Light3D(color) {
    
    Object3D.call(this);

    if (!color || color.length !== 3) {
        color = new Float32Array([1, 1, 1]);
    } else if (!(color instanceof Float32Array)) {
        color = new Float32Array(color);
    }

    Object.defineProperties(this, {
        color: { value: color }
    });
}

Light3D.prototype = Object.create(Object3D.prototype);
