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
        value: function(toIntersect) {
            if (!(toIntersect instanceof BoundBox)) {
                throw new TypeError();
            }
            
            //TO DO
            return false;
        }
    },
    intersection: {
        value: function(toIntersect) {
            if (!(toIntersect instanceof BoundBox)) {
                throw new TypeError();
            }

            //TO DO
            return new BoundBox();
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