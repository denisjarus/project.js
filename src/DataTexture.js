function DataTexture(width, height) {

    Texture.call(this);

    Object.defineProperties(this, {
        width: { value: width },
        height: { value: height }
    });

    if (width === undefined || height === undefined) {
        throw new TypeError();
    }
}

DataTexture.prototype = Object.create(Texture.prototype);
