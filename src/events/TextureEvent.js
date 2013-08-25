function TextureEvent(type, resize) {

	Event3D.call(this, type);

	Object.defineProperties(this, {
		resize: { value: resize || false }
	});
}

TextureEvent.prototype = Object.create(Event3D.prototype);

Object.defineProperties(TextureEvent, {
	UPDATE: { value: 'textureUpdate' },
	WRAP_CHANGE: { value: 'textureWrapChange' }
});