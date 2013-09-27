function MaterialEvent(type, property) {

	Event3D.call(this, type);

	Object.defineProperties(this, {
		property: { value: property }
	});
}

MaterialEvent.prototype = Object.create(Event3D.prototype);

Object.defineProperties(MaterialEvent, {
	UPDATE: { value: 'materialPropertyUpdate' },
	SHADER_CHANGE: { value: 'materialShaderChange' }
});