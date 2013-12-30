function Constraint() {
    Object.defineProperties(this, {
    	object1: { value: null, writable: true, enumerable: true },
    	object2: { value: null, writable: true, enumerable: true },

    	point: { value: new Vector3D(), enumerable: true },
    	normal: { value: new Vector3D(), enumerable: true },

    	friction: { value: 0, writable: true, enumerable: true }
    });
}
