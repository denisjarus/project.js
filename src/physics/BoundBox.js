function BoundBox(min, max) {

    Collider.call(this);

    Object.defineProperties(this, {
        min: { value: min instanceof Vector3D ? min : new Vector3D(), enumerable: true },
        max: { value: max instanceof Vector3D ? max : new Vector3D(), enumerable: true }
    });
}

BoundBox.prototype = Object.create(Collider.prototype, {
    clone: {
        value: function() {
            return new BoundBox(this.min.clone(), this.max.clone());
        }
    },
    copyFrom: {
        value: function(boundBox) {
            if (!(boundBox instanceof BoundBox)) {
                throw new TypeError();
            }

            this.min.copyFrom(boundBox.min);
            this.max.copyFrom(boundBox.max);
            
            return this;
        }
    },
    intersects: {
        value: function(boundBox) {
            if (!(boundBox instanceof BoundBox)) {
                throw new TypeError();
            }

            var aMin = this.min.elements,
                aMax = this.max.elements,
                bMin = boundBox.min.elements,
                bMax = boundBox.max.elements,

                intersects = true;

            intersects = (aMin[0] > bMax[0] || aMax[0] < bMin[0]) ? false : intersects;
            intersects = (aMin[1] > bMax[1] || aMax[1] < bMin[1]) ? false : intersects;
            intersects = (aMin[2] > bMax[2] || aMax[2] < bMin[2]) ? false : intersects;

            return intersects;
        }
    },
    getSupport: {
        value: function(direction) {
            var support = new Vector3D();

            support.x = direction.x >= 0 ? this.max.x : this.min.x;
            support.y = direction.y >= 0 ? this.max.y : this.min.y;
            support.z = direction.z >= 0 ? this.max.z : this.min.z;

            return support;
        }
    },
    sizeX: {
        get: function() {
            return this.max.x - this.min.x;
        },
        set: function(value) {
            this.max.x = this.min.x + value;
        }
    },
    sizeY: {
        get: function() {
            return this.max.y - this.min.y;
        },
        set: function(value) {
            this.max.y = this.min.y + value;
        }
    },
    sizeZ: {
        get: function() {
            return this.max.z - this.min.z;
        },
        set: function(value) {
            this.max.z = this.min.z + value;
        }
    }
});