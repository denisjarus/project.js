function DataEvent(type, attribute, resize) {
    
    Event3D.call(this, type);

    Object.defineProperties(this, {
        attribute: { value: attribute },
        resize: { value: resize || false }
    });
}

DataEvent.prototype = Object.create(Event3D.prototype);

Object.defineProperties(DataEvent, {
    VERTICES_CHANGE: { value: 'geometryVerticesChange' },
    INDICES_CHANGE: { value: 'geometryIndicesChange' },
    TEXTURE_UPDATE: { value: 'textureUpdate' },
});
