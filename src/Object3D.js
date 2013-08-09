function Object3D() {
    
    EventDispatcher.call(this);

    Object.defineProperties(this, {
        id: { value: Object3D._counter++ },

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
            if (!(event instanceof Event3D)) {
                throw new TypeError();
            }

            event.target = this;
            event.currentTarget = this;
            
            // bubble

            do {
                var listeners = event.currentTarget._listeners[event.type];
                if (listeners) {
                    for (var listener, i = 0; listener = listeners[i]; i++) {
                        listener.call(null, event);
                    }
                }
            } while ((event.currentTarget = event.currentTarget._parent));
        }
    },
    matrix: {
        get: function() {
            var matrix = this._matrix;

            if (this._update) {
                this._update = false;

                matrix.recompose(
                    this._x,
                    this._y,
                    this._z,
                    this._rotationX,
                    this._rotationY,
                    this._rotationZ,
                    this._scaleX,
                    this._scaleY,
                    this._scaleZ
                );
            }
            return matrix;
        }
    },
    localToGlobal: {
        get: function() {
            var localToGlobal = this._localToGlobal,
                parent = this._parent;

            if (this._concat) {
                this._concat = false;

                localToGlobal.copyFrom(this.matrix);

                if (parent) {
                    localToGlobal.append(parent.localToGlobal);
                }
            }
            return localToGlobal;
        }
    },
    globalToLocal: {
        get: function() {
            var globalToLocal = this._globalToLocal;

            if (this._invert) {
                this._invert = false;

                globalToLocal.copyFrom(this.localToGlobal).invert();
            }
            return globalToLocal;
        }
    },
    invalidate: {
        value: function() {
            var children = this._children;

            if (this._concat === false) {
                this._concat = true;
                this._invert = true;

                for (var child, i = 0; child = children[i]; i++) {
                    child.invalidate();
                }
            }
        }
    },
    bounds: {
        get: function() {
            return this._bounds;
        },
        set: function(bounds) {
            if (!(bounds instanceof BoundBox)) {
                return new TypeError();
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
            if (!(child instanceof Object3D)) {
                throw new TypeError();
            }
            if (child.contains(this)) {
                throw new Error();
            }
            if (child._parent !== null) {
                child._parent.removeChild(child);
            }

            child._parent = this;
            child.invalidate();

            this._children.push(child);

            child.dispatchEvent(new Event3D(Event3D.ADDED));

            return child;
        }
    },
    removeChild: {
        value: function(child) {
            if (!(child instanceof Object3D)) {
                throw new TypeError();
            }
            if (child._parent !== this) {
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
            if (!(child instanceof Object3D)) {
                throw new TypeError();
            }
            for (var object = child; object !== null; object = object._parent) {
                if (object === this) {
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

Object.defineProperties(Object3D, {
    _counter: { value: 0, writable: true }
});
