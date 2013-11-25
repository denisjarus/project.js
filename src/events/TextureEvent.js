function TextureEvent(type, side, resize) {

    Event3D.call(this, type);

    Object.defineProperties(this, {
        side: { value: side || null },
        resize: { value: resize || false }
    });
}

TextureEvent.prototype = Object.create(Event3D.prototype);

Object.defineProperties(TextureEvent, {
    UPDATE: { value: 'textureUpdate' },
    CONFIG: { value: 'textureConfig' },
});
