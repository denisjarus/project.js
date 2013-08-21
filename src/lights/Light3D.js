function Light3D(color) {
    
    Object3D.call(this);

    Object.defineProperties(this, {
        color: { value: new Float32Array(3) }
    });

    this.color.set(color || [1, 1, 1]);
}

Light3D.prototype = Object.create(Object3D.prototype);
