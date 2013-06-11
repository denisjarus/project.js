function Texture() {

    EventDispatcher.call(this);

    Object.defineProperties(this, {
        id: { value: Texture._counter++ },

        _data: { value: {} }
    });
}

Texture.prototype = Object.create(EventDispatcher.prototype, {
    getData: {
        value: function(target) {
            return this._data[target];
        }
    },
    setData: {
        value: function(target, data) {
            this._data[target] = data;
            this.dispatchEvent(
                new Event3D('type', target)
            );
        }
    }
});

Object.defineProperties(Texture, {
    _counter: { value: 0, writable: true },

    TEXTURE_2D: { value: 'texture2D' },

    TEXTURE_CUBE_POSITIVE_X: { value: 'textureCubePositiveX' },
    TEXTURE_CUBE_NEGATIVE_X: { value: 'textureCubeNegativeX' },

    TEXTURE_CUBE_POSITIVE_Y: { value: 'textureCubePositiveY' },
    TEXTURE_CUBE_NEGATIVE_Y: { value: 'textureCubeNegativeY' },

    TEXTURE_CUBE_POSITIVE_Z: { value: 'textureCubePositiveZ' },
    TEXTURE_CUBE_NEGATIVE_Z: { value: 'textureCubeNegativeZ' }
});