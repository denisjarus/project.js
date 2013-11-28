function GeometryEvent(type, attrib) {
    
    Event3D.call(this, type);

    Object.defineProperties(this, {
        attrib: { value: attrib || null }
    });
}

GeometryEvent.prototype = Object.create(Event3D.prototype);

Object.defineProperties(GeometryEvent, {
    UPDATE: { value: 'geometryAttributeUpdate' },
    INDICES_UPDATE: { value: 'geometryIndicesUpdate' }
});
