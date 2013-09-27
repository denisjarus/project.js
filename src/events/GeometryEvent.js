function GeometryEvent(type, attrib, resize) {
    
    Event3D.call(this, type);

    Object.defineProperties(this, {
        attrib: { value: attrib },
        resize: { value: resize }
    });
}

GeometryEvent.prototype = Object.create(Event3D.prototype);

Object.defineProperties(GeometryEvent, {
    UPDATE: { value: 'geometryAttributeUpdate' },
    INDICES_UPDATE: { value: 'geometryIndicesUpdate' }
});
