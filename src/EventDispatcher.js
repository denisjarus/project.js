function EventDispatcher() {
	Object.defineProperties(this, {
		_listeners: { value: {} },
	});
}

Object.defineProperties(EventDispatcher.prototype, {
	addEventListener: {
		value: function(type, listener) {
			if (! this._listeners[type]) {
				this._listeners[type] = [];
			}
			if (this._listeners[type].indexOf(listener) < 0) {
				this._listeners[type].push(listener);
			}
		}
	},
	removeEventListener: {
		value: function(type, listener) {
			if (! this._listeners[type]) {
				return;
			}
			var index = this._listeners[type].indexOf(listener);
			if (index < 0) {
				this._listeners.splice(index, 1);
			}
			if (this._listeners[type].length == 0) {
				delete this._listeners[type];
			}
		}
	},
	hasEventListener: {
		value: function(type) {
			return this._listeners[type];
		}
	},
	dispatchEvent: {
		value: function(event) {
			if (event instanceof Event3D == false) {
				throw new Error();
			}
			var handlers = this._listeners[event.type];
			if (handlers) {
				event.target = this;
				for (var i = 0, length = handlers.length; i < length; i++) {
					handlers[i](event);
				}
			}
		}
	},
});