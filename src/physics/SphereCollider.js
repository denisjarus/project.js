function SphereCollider(center, radius) {

    Collider.call(this);

    Object.defineProperties(this, {
        type: { value: SphereCollider.COLLIDER_TYPE, enumerable: true },

        center: { value: center instanceof Vector3D ? center : new Vector3D(), enumerable: true },
        radius: { value: radius || 0, writable: true, enumerable: true }
    });
}

SphereCollider.prototype = Object.create(Collider.prototype, {
    getAabb: {
        value: function(min, max) {
            if (!(min instanceof Vector3D && max instanceof Vector3D)) {
                throw new TypeError();
            }

            var radius = this.radius;

            min.set([radius, radius, radius]).negate();
            max.set([radius, radius, radius]);
        }
    }
});

Object.defineProperties(SphereCollider, {
    COLLIDER_TYPE: { value: 'sphere' }
});
