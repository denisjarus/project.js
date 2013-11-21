function Loader() {

    EventDispatcher.call(this);

    Object.defineProperties(this, {
        _request: { value: new XMLHttpRequest() }
    });

    var loader = this;

    this._request.addEventListener('load', function() {
        var data = JSON.parse(this.responseText),
            geometries = {},
            materials = {},
            textures = {};

        for (var name in data.textures) {
            console.log(data.textures[name]);
        }

        loader.dispatchEvent(new Event3D(Loader.LOAD));
    }, false);
}

Loader.prototype = Object.create(EventDispatcher.prototype, {
    load: {
        value: function(url) {
            this._request.open('GET', url, true);
            this._request.send();
        }
    }
});
