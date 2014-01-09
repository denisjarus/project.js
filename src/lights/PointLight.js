function PointLight(color) {
    
    Light3D.call(this, color);

    Object.defineProperties(this, {
    	distance: { value: 10, writable: true }
    });
}

PointLight.prototype = Object.create(Light3D.prototype);