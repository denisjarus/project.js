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
    NORMAL_MATRIX: { value: 'normalMatrix' }
});
