function RigidBody(object) {
    Object.defineProperties(this, {
        collider: { value: null, writable: true },

        position: { value: new Vector3D() },
        rotation: { value: new Vector3D() },

        linVelocity: { value: new Vector3D() },
        angVelocity: { value: new Vector3D() },

        force: { value: new Vector3D() },
        torque: { value: new Vector3D() },

        matrix: { value: new Matrix3D() }
    });
}
