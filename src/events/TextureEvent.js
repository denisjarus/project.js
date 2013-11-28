function TextureEvent(type, side) {

    Event3D.call(this, type);

    Object.defineProperties(this, {
        side: { value: side || null }
    });
}

TextureEvent.prototype = Object.create(Event3D.prototype);

Object.defineProperties(TextureEvent, {
    UPDATE: { value: 'textureUpdate' },
    CONFIG: { value: 'textureConfig' },
});
