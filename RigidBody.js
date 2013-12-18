function RigidBody() {
    Object.defineProperties(this, {
        collider: { value: null, writable: true },
        boundBox: { value: new BoundBox() },

        position: { value: new Vector3D() },
        rotation: { value: new Vector3D() },

        linearVelocity: { value: new Vector3D() },
        angularVelocity: { value: new Vector3D() },

        force: { value: new Vector3D() },
        torque: { value: new Vector3D() },

        matrix: { value: new Matrix3D() }
    });
}
