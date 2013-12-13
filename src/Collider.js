function Collider() {
    Object.defineProperties(this, {
        mass: { value: 1, writable: true, enumerable: true },
        drag: { value: 1, writable: true, enumerable: true },
    });
}
