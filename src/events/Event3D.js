function Event3D(type) {
	Object.defineProperties(this, {
		type: { value: type },
		target: { value: null, writable: true },
	});
}

Object.defineProperties(Event3D, {
	ADDED: { value: 'added' },
	REMOVED: { value: 'removed' }
});