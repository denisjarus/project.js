function GeometryEvent(type, attribute) {
	
	Event3D.call(this, type);

	Object.defineProperties(this, {
		attribute: { value: attribute }
	});
}

GeometryEvent.prototype = Object.create(Event3D.prototype);

Object.defineProperties(GeometryEvent, {
	VERTICES_CHANGE: { value: 'geometryVerticesChange' },
	INDICES_CHANGE: { value: 'geometryIndicesChange' }
});