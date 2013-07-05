function Light3D(color) {
    
    Object3D.call(this);

    Object.defineProperties(this, {
        color: { value: color }
    });
}

Light3D.prototype = Object.create(Object3D.prototype, {

});