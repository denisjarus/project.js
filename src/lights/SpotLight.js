function SpotLight(color) {

    Light3D.call(this, color);

    Object.defineProperties(this, {
    	distance: { value: 10, writable: true },
    	direction: { value: new Vector3D() },

    	_shadowMap: { value: null, writable: true }
    });
}

SpotLight.prototype = Object.create(Light3D.prototype, {
	shadowMap: {
		get: function() {
			return this._shadowMap;
		},
		set: function(texture) {
			if (!(texture instanceof Texture)) {
				throw new TypeError();
			}

			this._shadowMap = texture;
		}
	}
});
