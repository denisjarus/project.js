function BoundBox(min, max) {
    Object.defineProperties(this, {
        min: { value: min instanceof Vector3D ? min : new Vector3D() },
        max: { value: max instanceof Vector3D ? max : new Vector3D() }
    });
}

Object.defineProperties(BoundBox.prototype, {
    clone: {
        value: function() {
            return new BoundBox(this.min.clone(), this.max.clone());
        }
    },
    copyFrom: {
        value: function(boundBox) {
            if (boundBox instanceof BoundBox === false) {
                throw new Error();
            }
            this.min.copyFrom(boundBox.min);
            this.max.copyFrom(boundBox.max);
            
            return this;
        }
    },
    intersects: {
        value: function(toIntersect) {
            if (toIntersect instanceof BoundBox === false) {
                throw new Error();
            }
            //TO DO
            return false;
        }
    },
    intersection: {
        value: function(toIntersect) {
            if (toIntersect instanceof BoundBox === false) {
                throw new Error();
            }
            //TO DO
            return new BoundBox();
        }
    },
    sizeX: {
        get: function() {
            return max.x - min.x;
        },
        set: function(value) {
            max.x = min.x + value;
        }
    },
    sizeY: {
        get: function() {
            return max.y - min.y;
        },
        set: function(value) {
            max.y = min.y + value;
        }
    },
    sizeZ: {
        get: function() {
            return max.z - min.z;
        },
        set: function(value) {
            max.z = min.z + value;
        }
    }
});