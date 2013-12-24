function RigidBody() {
    Object.defineProperties(this, {
        aabbMin: { value: new Vector3D() },
        aabbMax: { value: new Vector3D() },

        collider: { value: null, writable: true },

        position: { value: new Vector3D() },
        rotation: { value: new Vector3D() },

        linearVelocity: { value: new Vector3D() },
        angularVelocity: { value: new Vector3D() },

        linearFactor: { value: 1, writable: true },
        angularFactor: { value: 1, writable: true },

        force: { value: new Vector3D() },
        torque: { value: new Vector3D() },

        matrix: { value: new Matrix3D() }
    });
}

Object.defineProperties(RigidBody.prototype, {
    applyImpulse: {
        value: function(impulse, point) {
            this.linearVelocity.addScaled(impulse, this.collider.inverseMass * this.linearFactor);
        }
    },
    getVelocityInPoint: {
        value: function(point, velocity) {
            velocity.copyFrom(this.angularVelocity).cross(point).add(this.linearVelocity);
        }
    }
});
