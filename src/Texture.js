function Texture() {

    EventDispatcher.call(this);

    Object.defineProperties(this, {
        id: { value: Texture._counter++ },

        _data: { value: null, writable: true },

        _wrapU: { value: Texture.REPEAT, writable: true },
        _wrapV: { value: Texture.REPEAT, writable: true },

        _magFilter: { value: Texture.NEAREST, writable: true },
        _minFilter: { value: Texture.TRILINEAR, writable: true }
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
            var resize = !this._data || this._data.width !== data.width || this._data.height !== data.height;
            
            this._data = data;

            this.dispatchEvent(new DataEvent(DataEvent.TEXTURE_CHANGE, null, resize));
        }
    },
    wrapU: {
        get: function() {
            return this._wrapU;
        },
        set: function(value) {
            this._wrapU = value;

            this.dispatchEvent(new DataEvent(DataEvent.TEXTURE_CHANGE, null, false));
        }
    },
    wrapV: {
        get: function() {
            return this._wrapV;
        },
        set: function(value) {
            this._wrapV = value;

            this.dispatchEvent(new DataEvent(DataEvent.TEXTURE_CHANGE, null, false));
        }
    },
    magFilter: {
        get: function() {
            return this._magFilter;
        },
        set: function(value) {
            this._magFilter = value;

            this.dispatchEvent(new DataEvent(DataEvent.TEXTURE_CHANGE, null, false));
        }
    },
    minFilter: {
        get: function() {
            return this._minFilter;
        },
        set: function(value) {
            this._minFilter = value;

            this.dispatchEvent(new DataEvent(DataEvent.TEXTURE_CHANGE, null, false));
        }
    }
});

Object.defineProperties(Texture, {
    _counter: { value: 0, writable: true },

    REPEAT: { value: 0x2901 },
    CLAMP: { value: 0x812F },
    MIRROR: { value: 0x8370 },

    NEAREST: { value: 0x2600 },
    BILINEAR: { value: 0x2601 },
    BILINEAR_MIPMAP: { value: 0x2702 },
    TRILINEAR: { value: 0x2703 }
});
