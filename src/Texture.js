function Texture() {

    EventDispatcher.call(this);

    Object.defineProperties(this, {
        id: { value: Texture._counter++ },

        _data: { value: null, writable: true },

        _wrapU: { value: Texture.REPEAT, writable: true },
        _wrapV: { value: Texture.REPEAT, writable: true }
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

            this.dispatchEvent(new TextureEvent(TextureEvent.UPDATE, resize));
        }
    },
    wrapU: {
        get: function() {
            return this._wrapU;
        },
        set: function(value) {
            this._wrapU = value;

            this.dispatchEvent(new TextureEvent(TextureEvent.WRAP_CHANGE, false));
        }
    },
    wrapV: {
        get: function() {
            return this._wrapV;
        },
        set: function(value) {
            this._wrapV = value;

            this.dispatchEvent(new TextureEvent(TextureEvent.WRAP_CHANGE, false));
        }
    }
});

Object.defineProperties(Texture, {
    _counter: { value: 0, writable: true },

    REPEAT: { value: 0x2901 },
    CLAMP: { value: 0x812F },
    MIRROR: { value: 0x8370 }
});
