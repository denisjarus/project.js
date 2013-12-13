function RigidBody() {
    Object.defineProperties(this, {
        collider: { value: null, writable: true },

        position: { value: new Vector3D() },
        velocity: { value: new Vector3D() },
        rotation: { value: new Vector3D() },

        force: { value: new Vector3D() }
    });
}
