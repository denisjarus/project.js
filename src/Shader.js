function Shader(vertex, fragment, uniforms) {
    Object.defineProperties(this, {
        id: { value: Shader._counter++ },

        vertex: { value: vertex },
        fragment: { value: fragment },
        
        modelMatrix: { value: uniforms },
        modelViewMatrix: { value: 'no' }
    });

    if (!vertex || !fragment) {
        throw new Error();
    }
}

Object.defineProperties(Shader, {
    _counter: { value: 0, writable: true },

    MODEL_MATRIX: { value: 'modelMatrix' },
    MODEL_VIEW_MATRIX: { value: 'modelViewMatrix' },
    VIEW_MATRIX: { value: 'viewMatrix' },
    PROJECTION_MATRIX: { value: 'projectionMatrix' },
    NORMAL_MATRIX: { value: 'normalMatrix' },

    depthShader: {
        value: new Shader(
            [
                'attribute vec3 position;',

                'uniform mat4 modelMatrix;',
                'uniform mat4 viewMatrix;',
                'uniform mat4 projectionMatrix;',

                'void main(void) {',

                '   gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);',

                '}'

            ].join('\n'),
            [
                'precision mediump float;',

                'uniform float far;',

                'void main(void) {',

                '   float depth = gl_FragCoord.z / gl_FragCoord.w;',

                '   gl_FragColor = vec4(vec3(1.0 - depth / far), 1.0);',

                '}'

            ].join('\n')
        )
    }
});
