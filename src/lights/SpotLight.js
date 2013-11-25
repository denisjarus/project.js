function SpotLight() {

    Light3D.call(this);

    Object.defineProperties(this, {

    });
}

SpotLight.prototype = Object.create(Light3D.prototype, {

});
