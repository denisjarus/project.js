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
            var texture = textures[name] = new Texture(),
                image = new Image();

            image.src = data.textures[name].url;

            texture.setData(image);
        }

        loader.dispatchEvent(new Event3D(Loader.COMPLETE));
    }, false);

    this._request.addEventListener('progress', function(event) {
        console.log(event);
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

Object.defineProperties(Loader, {
    PROGRESS: { value: 'progress' },
    COMPLETE: { value: 'complete' }
});
