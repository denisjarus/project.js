function Shader(vertex, fragment, uniforms, uniform) {
    Object.defineProperties(this, {
        id: { value: Shader._counter++ },

        vertex: { value: vertex },
        fragment: { value: fragment },
        uniforms: { value: uniforms }

        uniform: { value: uniform }
    });

    if (!vertex || !fragment || !uniform) {
        throw new Error();
    }
}

Object.defineProperties(Shader, {
    _counter: { value: 0, writable: true },
});
