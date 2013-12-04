function TextureEvent(type, side, data) {

    Event3D.call(this, type);

    Object.defineProperties(this, {
        side: { value: side || null },
        data: { value: data || null }
    });
}

TextureEvent.prototype = Object.create(Event3D.prototype);

Object.defineProperties(TextureEvent, {
    UPDATE: { value: 'textureUpdate' },
    CONFIG: { value: 'textureConfig' },
});
