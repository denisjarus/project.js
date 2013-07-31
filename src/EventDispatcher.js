function EventDispatcher() {
    Object.defineProperties(this, {
        _listeners: { value: {} },
    });
}

Object.defineProperties(EventDispatcher.prototype, {
    addEventListener: {
        value: function(type, listener) {
            var listeners = this._listeners[type];
            if (listeners === undefined) {
                listeners = this._listeners[type] = [];
            }

            if (listeners.indexOf(listener) === -1) {
                listeners.push(listener);
            }
        }
    },
    removeEventListener: {
        value: function(type, listener) {
            var listeners = this._listeners[type];
            if (listeners === undefined) {
                return;
            }

            var index = listeners.indexOf(listener);
            if (index !== -1) {

                listeners.splice(index, 1);

                if (listeners.length === 0) {
                    delete this._listeners[type];
                }
            }
        }
    },
    hasEventListener: {
        value: function(type) {
            return this._listeners[type] !== undefined;
        }
    },
    dispatchEvent: {
        value: function(event) {
            if (event instanceof Event3D === false) {
                throw new TypeError();
            }
            
            event.target = this;
            event.currentTarget = this;

            var listeners = this._listeners[event.type];
            if (listeners) {
                for (var listener, i = 0; listener = listeners[i]; i++) {
                    listener.call(null, event);
                }
            }
        }
    }
});