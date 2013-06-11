function PointLight() {
    
    Light3D.call(this);

    Object.defineProperties(this, {

    });
}

PointLight.prototype = Object.create(Light3D.prototype, {

});