function Mesh(geometry, material) {

    Object3D.call(this);

    Object.defineProperties(this, {
        _geometry: { value: null, writable: true },
        _material: { value: null, writable: true }
    });

    if (geometry) {
        this.geometry = geometry;
    }
    if (material) {
        this.material = material;
    }
}

Mesh.prototype = Object.create(Object3D.prototype, {
    geometry: {
        get: function() {
            return this._geometry;
        },
        set: function(geometry) {
            if (!(geometry instanceof Geometry)) {
                throw new TypeError();
            }

            this._geometry = geometry;

            this.dispatchEvent(new Event3D(Event3D.GEOMETRY_CHANGE));
        }
    },
    material: {
        get: function() {
            return this._material;
        },
        set: function(material) {
            if (!(material instanceof Material)) {
                throw new TypeError();
            }

            this._material = material;
            
            this.dispatchEvent(new Event3D(Event3D.MATERIAL_CHANGE));
        }
    }
});
