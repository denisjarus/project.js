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
			if (this._listeners[type].indexOf(listener) == -1) {
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
			if (index > -1) {
				this._listeners[type].splice(index, 1);
			}
			if (this._listeners[type].length == 0) {
				delete this._listeners[type];
			}
		}
	},
	hasEventListener: {
		value: function(type) {
			return this._listeners[type] != null;
		}
	},
	dispatchEvent: {
		value: function(event) {
			if (event instanceof Event3D == false) {
				throw new Error();
			}
			event.target = this;
			event.currentTarget = this;

			var handlers = this._listeners[event.type];
			if (handlers) {
				for (var i = 0, len = handlers.length; i < len; i++) {
					handlers[i].call(null, event);
				}
			}
		}
	}
});