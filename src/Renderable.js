function Renderable(object) {
	Object.defineProperties(this, {
		object: { value: object },

		vertexAttribs: { value: [] },
		vertexBuffers: { value: [] },
		vertexFormats: { value: [] },
		vertexOffsets: { value: [] },

		vertexIndices: { value: null, writable: true },
		indicesLength: { value: 0, writable: true },

		samplers: { value: [] },
		textures: { value: [] },

		program: { value: null }
	});
}