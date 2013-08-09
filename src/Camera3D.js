function Camera3D() {
    
    Object3D.call(this);

    Object.defineProperties(this, {
        _aspectRatio: { value: 1.5, writable: true },
        _fieldOfView: { value: Math.PI / 3, writable: true },

        _far: { value: 2000, writable: true },
        _near: { value: 0.1, writable: true },

        _projection: { value: new Matrix3D() },
        _updateProjection: { value: true, writable: true }
    });
}

Camera3D.prototype = Object.create(Object3D.prototype, {
    aspectRatio: {
        get: function() {
            return this._aspectRatio;
        },
        set: function(value) {
            this._aspectRatio = value;
            this._updateProjection = true;
        }
    },
    fieldOfView: {
        get: function() {
            return this._fieldOfView;
        },
        set: function(value) {
            this._fieldOfView = value;
            this._updateProjection = true;
        }
    },
    far: {
        get: function() {
            return this._far;
        },
        set: function(value) {
            this._far = value;
            this._updateProjection = true;
        }
    },
    near: {
        get: function() {
            return this._near;
        },
        set: function(value) {
            this._near = value;
            this._updateProjection = true;
        }
    },
    projection: {
        get: function() {
            if (this._updateProjection) {
                this._updateProjection = false;

                this._projection.perspective(
                    this._fieldOfView,
                    this._aspectRatio,
                    this._near,
                    this._far
                );
            }
            return this._projection;
        }
    }
});
