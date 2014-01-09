function GeometryEvent(type, attribute, data) {
    
    Event3D.call(this, type);

    Object.defineProperties(this, {
        attribute: { value: attribute !== undefined ? attribute : null },
        data: { value: data !== undefined ? data : null }
    });
}

GeometryEvent.prototype = Object.create(Event3D.prototype);

Object.defineProperties(GeometryEvent, {
    UPDATE: { value: 'geometryAttributeUpdate' },
    INDICES_UPDATE: { value: 'geometryIndicesUpdate' }
});
