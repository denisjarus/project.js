function Material() {
    
    EventDispatcher.call(this);

    Object.defineProperties(this, {
        id: { value: Material._counter++ },

        depthTest: { value: true, writable: true },
        depthMask: { value: true, writable: true },

        _properties: { value: {} },

        _shader: { value: Shader.depthShader, writable: true }
    });
}

Material.prototype = Object.create(EventDispatcher.prototype, {
    properties: {
        get: function() {
            return Object.keys(this._properties);
        }
    },
    getProperty: {
        value: function(property) {
            return this._properties[property];
        }
    },
    setProperty: {
        value: function(property, value) {
            this._properties[property] = value;
            this.dispatchEvent(new MaterialEvent(MaterialEvent.UPDATE, property));
        }
    },
    shader: {
        get: function() {
            return this._shader;
        },
        set: function(shader) {
            if (!(shader instanceof Shader)) {
                throw new TypeError();
            }

            this._shader = shader;
            this.dispatchEvent(new MaterialEvent(MaterialEvent.SHADER_CHANGE));
        }
    },
    clone: {
        value: function() {
            var material = new Material();

            for (var property in this._properties) {
                material._properties[property] = this._properties[property];
            }

            material._shader = this._shader;

            return material;
        }
    }
});

Object.defineProperties(Material, {
    _counter: { value: 0, writable: true }
});
