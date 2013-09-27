function Material() {
    
    EventDispatcher.call(this);

    Object.defineProperties(this, {
        id: { value: Material._counter++ },

        _properties: { value: {} },

        _shader: { value: null, writable: true }
    });
}

Material.prototype = Object.create(EventDispatcher.prototype, {
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

            this.dispatchEvent(new MaterialEvent(MaterialEvent.SHADER_CHANGE, null));
        }
        // value: new Shader(
        //     [
        //         'attribute vec3 position;',

        //         'uniform mat4 modelMatrix;',
        //         'uniform mat4 viewMatrix;',
        //         'uniform mat4 projectionMatrix;',

        //         'void main(void) {',

        //         '   gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);',

        //         '}'

        //     ].join('\n'),
        //     [
        //         'precision mediump float;',

        //         'uniform float far;',

        //         'void main(void) {',

        //         '   float depth = gl_FragCoord.z / gl_FragCoord.w;',

        //         '   gl_FragColor = vec4(vec3(1.0 - depth / far), 1.0);',

        //         '}'

        //     ].join('\n'),
        //     {
        //         'position': Geometry.VERTEX_POSITIONS,
        //         'modelMatrix': Shader.MODEL_MATRIX,
        //         'viewMatrix': Shader.VIEW_MATRIX,
        //         'projectionMatrix': Shader.PROJECTION_MATRIX
        //     }
        // )
    }
});

Object.defineProperties(Material, {
    _counter: { value: 0, writable: true }
});
