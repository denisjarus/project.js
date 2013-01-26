function Object3D() {

	EventDispatcher.call(this);

	Object.defineProperties(this, {
		_x: { value: 0, writable: true },
		_y: { value: 0, writable: true },
		_z: { value: 0, writable: true },

		_rotationX: { value: 0, writable: true },
		_rotationY: { value: 0, writable: true },
		_rotationZ: { value: 0, writable: true },

		_scaleX: { value: 1, writable: true },
		_scaleY: { value: 1, writable: true },
		_scaleZ: { value: 1, writable: true },

		_matrix: { value: new Matrix3D() },
		_localToGlobal: { value: new Matrix3D() },
		_globalToLocal: { value: new Matrix3D() },

		_update: { value: false, writable: true },
		_concat: { value: false, writable: true },
		_invert: { value: false, writable: true },

		_bounds: { value: null, writable: true },

		visible: { value: true, writable: true },

		_parent: { value: null, writable: true },
		_children: { value: [] }
	});
}
	
Object3D.prototype = Object.create(EventDispatcher.prototype, {
	dispatchEvent: {
		value: function(event) {
			if (event instanceof Event3D == false) {
				throw new Error();
			}
			event.target = this;

			var path = [];
			for (var object = this; object != null; object = object._parent) {
				path.push(object);
			}

			//capture phase
			for (var i = path.length - 1; i >= 0; i--) {
				var handlers = path[i]._listeners[event.type];
				if (handlers) {
					for (var j = 0, length = handlers.length; j < length; j++) {
						handlers[j](event);
					}
				}
			}
		}
	},
	matrix: {
		get: function() {
			if (this._update) {
				this._update = false;
				this._matrix.recompose(
					this._x,
					this._y,
					this._z,
					this._rotationX * Math.PI / 180,
					this._rotationY * Math.PI / 180,
					this._rotationZ * Math.PI / 180,
					this._scaleX,
					this._scaleY,
					this._scaleZ
					);
			}
			return this._matrix;
		}
	},
	localToGlobal: {
		get: function() {
			if (this._concat) {
				this._concat = false;
				this._localToGlobal.copyFrom(this.matrix);
				if (this._parent) {
					this._localToGlobal.append(this._parent.localToGlobal);
				}
			}
			return this._localToGlobal;
		}
	},
	globalToLocal: {
		get: function() {
			if (this._invert) {
				this._invert = false;
				this._globalToLocal.copyFrom(this.localToGlobal).invert();
			}
			return this._globalToLocal;
		}
	},
	invalidate: {
		value: function() {
			if (this._concat == false) {
				this._concat = true;
				this._invert = true;
				for (var i = 0; i < this._children.length; i++) {
					this._children[i].invalidate();
				}
			}
		}
	},
	bounds: {
		get: function() {
			return this._bounds;
		},
		set: function(bounds) {
			if (BoundBox instanceof BoundBox == false) {
				return new Error();
			}
			this._bounds = bounds;
		}
	},
	parent: {
		get: function() {
			return this._parent;
		}
	},
	addChild: {
		value: function(child) {
			if (child instanceof Object3D == false) {
				throw new Error();
			}
			for (var object = this; object != null; object = object._parent) {
				if (object == child) {
					throw new Error();
				}
			}
			if (child._parent != null) {
				child._parent.removeChild(child);
			} else {
				child.dispatchEvent(new Event3D(Event3D.ADDED));
			}
			child._parent = this;
			child.invalidate();

			this._children.push(child);

			return child;
		}
	},
	removeChild: {
		value: function(child) {
			if (child instanceof Object3D == false) {
				throw new Error();
			}
			if (child._parent != this) {
				throw new Error();
			}
			child.dispatchEvent(new Event3D(Event3D.REMOVED));

			child._parent = null;
			child.invalidate();

			this._children.splice(this._children.indexOf(child), 1);
			
			return child;
		}
	},
	getChildAt: {
		value: function(index) {
			return this._children[index];
		}
	},
	getChildIndex: {
		value: function(child) {
			return this._children.indexOf(child);
		}
	},
	numChildren: {
		get: function() {
			return this._children.length;
		}
	},
	contains: {
		value: function(child) {
			for (var object = child; object != null; object = object._parent) {
				if (object == this) {
					return true;
				}
			}
			return false;
		}
	},
	x: {
		get: function() {
			return this._x;
		},
		set: function(value) {
			this._x = value;
			this._update = true;
			this.invalidate();
		}
	},
	y: {
		get: function() {
			return this._y;
		},
		set: function(value) {
			this._y = value;
			this._update = true;
			this.invalidate();
		}
	},
	z: {
		get: function() {
			return this._z;
		},
		set: function(value) {
			this._z = value;
			this._update = true;
			this.invalidate();
		} 
	},
	rotationX: {
		get: function() {
			return this._rotationX;
		},
		set: function(value) {
			this._rotationX = value;
			this._update = true;
			this.invalidate();
		} 
	},
	rotationY: {
		get: function() {
			return this._rotationY;
		},
		set: function(value) {
			this._rotationY = value;
			this._update = true;
			this.invalidate();
		} 
	},
	rotationZ: {
		get: function() {
			return this._rotationZ;
		},
		set: function(value) {
			this._rotationZ = value;
			this._update = true;
			this.invalidate();
		} 
	},
	scaleX: {
		get: function() {
			return this._scaleX;
		},
		set: function(value) {
			this._scaleX = value;
			this._update = true;
			this.invalidate();
		} 
	},
	scaleY: {
		get: function() {
			return this._scaleY;
		},
		set: function(value) {
			this._scaleY = value;
			this._update = true;
			this.invalidate();
		} 
	},
	scaleZ: {
		get: function() {
			return this._scaleZ;
		},
		set: function(value) {
			this._scaleZ = value;
			this._update = true;
			this.invalidate();
		} 
	}
});
