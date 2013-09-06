function TextureMaterial() {
    
    Material.call(this);

    Object.defineProperties(this, {
        _diffuseMap: { value: null, writable: true }
    });
}

TextureMaterial.prototype = Object.create(Material.prototype, {
    diffuseMap: {
        get: function() {
            return this._diffuseMap;
        },
        set: function(texture) {
            if (!(texture instanceof Texture)) {
                throw new TypeError();
            }
            this._diffuseMap = texture;
        }
    },
    shader: {
        value: new Shader(
            [
                'attribute vec3 position;',
                'attribute vec2 texcoord;',

                'uniform mat4 model;',
                'uniform mat4 view;',
                'uniform mat4 projection;',

                'varying vec2 uv;',

                'void main(void) {',

                '   uv = texcoord;',

                '   gl_Position = projection * view * model * vec4(position, 1.0);',

                '}'

            ].join('\n'),
            [
                'precision mediump float;',

                'uniform sampler2D diffuseMap;',

                'varying vec2 uv;',

                'void main(void) {',

                '   gl_FragColor = texture2D(diffuseMap, uv);',

                '}'

            ].join('\n'),
            function(uniforms, object, camera) {
                uniforms.model(object.localToGlobal.elements);
                uniforms.view(camera.globalToLocal.elements);
                uniforms.projection(camera.projection.elements);
                
                uniforms.diffuseMap(object.material.diffuseMap);
            }
        )
    }
});
