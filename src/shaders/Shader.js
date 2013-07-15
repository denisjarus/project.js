function Shader(vertex, fragment, uniform) {
    Object.defineProperties(this, {
        id: { value: Shader._counter++ },

        vertex: { value: vertex },

        fragment: { value: fragment },

        uniform: { value: uniform }
    });
}

Object.defineProperties(Shader, {
    _counter: { value: 0, writable: true },
});

const BASIC_SHADER = new Shader(
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

        'uniform sampler2D texture;',

        'varying vec2 uv;',

        'void main(void) {',

        '   gl_FragColor = texture2D(texture, uv);',

        '}'

    ].join('\n'),
    function(uniforms, object, camera) {
        uniforms.model = object.localToGlobal.elements;
        uniforms.view = camera.globalToLocal.elements;
        uniforms.projection = camera.projection.elements;
        uniforms.texture = object.material.texture;
    }
);