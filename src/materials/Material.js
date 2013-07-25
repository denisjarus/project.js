function Material() {
    
    EventDispatcher.call(this);

    Object.defineProperties(this, {
        id: { value: Material._counter++ }
    });
}

Material.prototype = Object.create(EventDispatcher.prototype, {
    shader: {
        value: new Shader(
            [
                'attribute vec3 position;',
                'attribute vec3 normal;',

                'uniform mat4 model;',
                'uniform mat4 view;',
                'uniform mat4 projection;',

                'uniform float far;',

                'varying float depth;',

                'void main(void) {',

                '   gl_Position = projection * view * model * vec4(position, 1.0);',

                '   depth = gl_Position.z / far;',

                '}'

            ].join('\n'),
            [
                'precision mediump float;',

                'varying float depth;',

                'void main(void) {',

                '   gl_FragColor = vec4(vec3(1.0 - depth), 1.0);',

                '}'

            ].join('\n'),
            function(uniforms, object, camera) {
                uniforms.model = object.localToGlobal.elements;
                uniforms.view = camera.globalToLocal.elements;
                uniforms.projection = camera.projection.elements;

                uniforms.far = camera.far;
            }
        )
    }
});

Object.defineProperties(Material, {
    _counter: { value: 0, writable: true }
});
