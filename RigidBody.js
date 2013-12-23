function RigidBody() {
    Object.defineProperties(this, {
        aabbMin: { value: new Vector3D() },
        aabbMax: { value: new Vector3D() },

        collider: { value: null, writable: true },

        position: { value: new Vector3D() },
        rotation: { value: new Vector3D() },

        linearVelocity: { value: new Vector3D() },
        angularVelocity: { value: new Vector3D() },

        force: { value: new Vector3D() },
        torque: { value: new Vector3D() },

        matrix: { value: new Matrix3D() }
    });
}

Object.defineProperties(RigidBody.prototype, {
    getVelocityInPoint: {
        value: function(point, velocity) {
            velocity.copyFrom(this.angularVelocity).cross(point).add(this.linearVelocity);
        }
    }
});
