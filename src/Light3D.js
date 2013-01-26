function Light3D() {

	Object3D.call(this);

	Object.defineProperties(this, {
		color: { value: null, writable: true }
	});
}

Light3D.prototype = Object.create(Object3D.prototype, {

});