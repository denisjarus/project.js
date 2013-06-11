function Shader(vertex, fragment) {
    Object.defineProperties(this, {
        id: { value: Shader._counter++ },

        vertex: { value: vertex },

        fragment: { value: fragment }
    });
}

Object.defineProperties(Shader, {
    _counter: { value: 0, writable: true },
});

const BASIC_SHADER = new Shader(
    [
        'attribute vec3 position;',

        'uniform mat4 modelView;',
        'uniform mat4 projection;',

        'void main(void) {',

        '   gl_Position = projection * modelView * vec4(position, 1.0);',

        '}'

    ].join('\n'),
    [
        'precision mediump float;',

        'void main(void) {',

        '   gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);',

        '}'

    ].join('\n')
);