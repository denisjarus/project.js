function BoxCollider(center, extent) {

    Collider.call(this);

    Object.defineProperties(this, {
        type: { value: BoxCollider.COLLIDER_TYPE, enumerable: true },

        center: { value: center instanceof Vector3D ? center : new Vector3D(), enumerable: true },
        extent: { value: extent instanceof Vector3D ? extent : new Vector3D(), enumerable: true }
    });
}

BoxCollider.prototype = Object.create(Collider.prototype, {
    getSupport: {
        value: function(direction) {
            var support = new Vector3D();

            // support.x = direction.x >= 0 ? this.max.x : this.min.x;
            // support.y = direction.y >= 0 ? this.max.y : this.min.y;
            // support.z = direction.z >= 0 ? this.max.z : this.min.z;

            return support;
        }
    },
    getAabb: {
        value: function(min, max) {
            if (!(min instanceof Vector3D && max instanceof Vector3D)) {
                throw new TypeError();
            }

            min.copyFrom(this.center).sub(this.extent);
            max.copyFrom(this.center).add(this.extent);
        }
    }
});

Object.defineProperties(BoxCollider, {
    COLLIDER_TYPE: { value: 'box' }
});
