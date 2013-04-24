function Light3D() {
	
	Object3D.call(this);

	Object.defineProperties(this, {
		color: { value: new Float32Array(4) }
	});
}

Light3D.prototype = Object.create(Object3D.prototype, {

});