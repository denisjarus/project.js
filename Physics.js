function Physics(object) {
	if (!(object instanceof Object3D)) {
		throw new TypeError();
	}

    Object.defineProperties(this, {
        object: { value: object }
    });
}

Object.defineProperties(Physics.prototype, {

});
