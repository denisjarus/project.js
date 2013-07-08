function Material(shader) {
    
    EventDispatcher.call(this);

    Object.defineProperties(this, {
        id: { value: Material._counter++ },
        
        _shader: { value: shader || BASIC_SHADER, writable: true }
    });
}

Material.prototype = Object.create(EventDispatcher.prototype, {
    shader: {
        get: function() {
            return this._shader;
        },
        set: function(shader) {
            if (shader instanceof Shader === false) {
                throw new Error();
            }
            this._shader = shader;
            this.dispatchEvent(new Event3D(Event3D.MATERIAL_SHADER_CHANGE));
        }
    }
});

Object.defineProperties(Material, {
    _counter: { value: 0, writable: true }
});