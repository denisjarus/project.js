function KeyboardControls() {

    var keys = {},
        keyDownActions = {},
        keyUpActions = {};

    window.addEventListener('keydown', onKeyDown, false);
    window.addEventListener('keyup', onKeyUp, false);

    function onKeyDown(event) {
        var k = event.keyCode; 
        if (keys[k]) {
            return;
        }

        keys[k] = true;

        var action = keyDownActions[k];
        if (action) {
            action(event);
        }
    }

    function onKeyUp(event) {
        var k = event.keyCode;
        if (!keys[k]) {
            return;
        }

        keys[k] = undefined;

        var action = keyUpActions[k];
        if (action) {
            action(event);
        }
    }

    Object.defineProperties(this, {
        _down: { value: keyDownActions },
        _up: { value: keyUpActions }
    });
}

Object.defineProperties(KeyboardControls.prototype, {
    bind: {
        value: function(key, keyDown, keyUp) {
            this._down[key] = keyDown;
            this._up[key] = keyUp;
        }
    }
});

Object.defineProperties(KeyboardControls, {
    CONTROL: { value: 17 },
    SPACE: { value: 32 }
});
