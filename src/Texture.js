function Texture() {

    EventDispatcher.call(this);

    Object.defineProperties(this, {
        id: { value: Texture._counter++ },

        _data: { value: null, writable: true }
    });
}

Texture.prototype = Object.create(EventDispatcher.prototype, {
    getData: {
        value: function() {
            return this._data;
        }
    },
    setData: {
        value: function(data) {
            var resize = this._data &&
                this._data.width !== data.width &&
                this._data.height !== data.height;
            
            this._data = data;

            this.dispatchEvent(new DataEvent(DataEvent.TEXTURE_CHANGE, null, resize));
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