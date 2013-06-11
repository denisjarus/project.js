function Material(shader) {
    
    EventDispatcher.call(this);

    Object.defineProperties(this, {
        id: { value: Material._counter++ },

        properties: { value: {} },
        
        _textures: { value: {} },

        _shader: { value: BASIC_SHADER, writable: true }
    });
}

Material.prototype = Object.create(EventDispatcher.prototype, {
    getData: {
        value: function(name) {
            return this._textures[name];
        }
    },
    setData: {
        value: function(name, data) {
            if (data instanceof Texture === false) {
                throw new Error();
            }
            this._textures[name] = data;
            this.dispatchEvent(
                new GeometryEvent('temp', name)
            );
        }
    },
    textures: {
        get: function() {
            return Object.keys(this._textures);
        }
    },
    shader: {
        get: function() {
            return this._shader;
        },
        set: function(shader) {
            if (shader instanceof Shader === false) {
                throw new Error();
            }
            this._shader = shader;
            this.dispatchEvent(
                new GeometryEvent('temp')
            );
        }
    }
});

Object.defineProperties(Material, {
    _counter: { value: 0, writable: true }
});