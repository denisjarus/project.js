function GeometryEvent(type, attribute) {
	
	Event.call(this, type);

	Object.defineProperties(this, {
		attribute: { value: attribute }
	});
}

GeometryEvent.prototype = Object.create(Event.prototype);

Object.defineProperties(GeometryEvent, {
	CHANGED: { value: 'changed' }
});