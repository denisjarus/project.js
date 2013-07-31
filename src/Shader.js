function Shader(vertex, fragment, uniform) {
	if (!vertex || !fragment || !uniform) {
		throw new Error();
	}

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
