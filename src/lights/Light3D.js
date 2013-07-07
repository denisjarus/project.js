function Light3D(color) {
    
    Object3D.call(this);

    if (!color || color.length !== 4) {
        color = new Float32Array(4);
    } else if (color instanceof Float32Array === false) {
        color = new Float32Array(color);
    }

    Object.defineProperties(this, {
        color: { value: color }
    });
}

Light3D.prototype = Object.create(Object3D.prototype);