function Matrix3D(elements) {
    Object.defineProperties(this, {
        elements: { value: new Float32Array(16), enumerable: true }
    });

    this.elements.set(elements || IDENTITY);
}

Object.defineProperties(Matrix3D.prototype, {
    position: {
        get: function() {
            return this.elements.subarray(12, 15);
        }
    },
    set: {
        value: function(array, offset) {
            var mat = this.elements;

            offset = offset || 0;

            mat[0] = array[offset];
            mat[1] = array[offset + 1];
            mat[2] = array[offset + 2];
            mat[3] = array[offset + 3];

            mat[4] = array[offset + 4];
            mat[5] = array[offset + 5];
            mat[6] = array[offset + 6];
            mat[7] = array[offset + 7];

            mat[ 8] = array[offset + 8];
            mat[ 9] = array[offset + 9];
            mat[10] = array[offset + 10];
            mat[11] = array[offset + 11];

            mat[12] = array[offset + 12];
            mat[13] = array[offset + 13];
            mat[14] = array[offset + 14];
            mat[15] = array[offset + 15];

            return this;
        }
    },
    clone: {
        value: function() {
            return new Matrix3D(this.elements);
        }
    },
    copyFrom: {
        value: function(matrix) {
            if (!(matrix instanceof Matrix3D)) {
                throw new TypeError();
            }
            this.elements.set(matrix.elements);

            return this;
        }
    },
    identity: {
        value: function() {
            this.elements.set(IDENTITY);

            return this;
        }
    },
    invert: {
        value: function() {
            var mat = this.elements,
                a00 = mat[0], a01 = mat[4], a02 = mat[ 8], a03 = mat[12],
                a10 = mat[1], a11 = mat[5], a12 = mat[ 9], a13 = mat[13],
                a20 = mat[2], a21 = mat[6], a22 = mat[10], a23 = mat[14],
                a30 = mat[3], a31 = mat[7], a32 = mat[11], a33 = mat[15],

                m00 = a00 * a11 - a01 * a10,
                m01 = a00 * a12 - a02 * a10,
                m02 = a00 * a13 - a03 * a10,
                m03 = a01 * a12 - a02 * a11,
                m04 = a01 * a13 - a03 * a11,
                m05 = a02 * a13 - a03 * a12,

                m06 = a20 * a31 - a21 * a30,
                m07 = a20 * a32 - a22 * a30,
                m08 = a20 * a33 - a23 * a30,
                m09 = a21 * a32 - a22 * a31,
                m10 = a21 * a33 - a23 * a31,
                m11 = a22 * a33 - a23 * a32,
                
                det = m00 * m11 - m01 * m10 + m02 * m09 + m03 * m08 - m04 * m07 + m05 * m06;

            if (det === 0) { console.warn('matrix is singular'); return null; }
            
            det = 1 / det;

            mat[0] = (a11 * m11 - a12 * m10 + a13 * m09) * det;
            mat[1] = (a10 * m11 - a12 * m08 + a13 * m07) * (-det);
            mat[2] = (a10 * m10 - a11 * m08 + a13 * m06) * det;
            mat[3] = (a10 * m09 - a11 * m07 + a12 * m06) * (-det);

            mat[4] = (a01 * m11 - a02 * m10 + a03 * m09) * (-det);
            mat[5] = (a00 * m11 - a02 * m08 + a03 * m07) * det;
            mat[6] = (a00 * m10 - a01 * m08 + a03 * m06) * (-det);
            mat[7] = (a00 * m09 - a01 * m07 + a02 * m06) * det;

            mat[ 8] = (a31 * m05 - a32 * m04 + a33 * m03) * det;
            mat[ 9] = (a30 * m05 - a32 * m02 + a33 * m01) * (-det);
            mat[10] = (a30 * m04 - a31 * m02 + a33 * m00) * det;
            mat[11] = (a30 * m03 - a31 * m01 + a32 * m00) * (-det);

            mat[12] = (a21 * m05 - a22 * m04 + a23 * m03) * (-det);
            mat[13] = (a20 * m05 - a22 * m02 + a23 * m01) * det;
            mat[14] = (a20 * m04 - a21 * m02 + a23 * m00) * (-det);
            mat[15] = (a20 * m03 - a21 * m01 + a22 * m00) * det;

            return this;
        }
    },
    transpose: {
        value: function() {
            var mat = this.elements, temp;

            temp = mat[1]; mat[1] = mat[ 4]; mat[ 4] = temp;
            temp = mat[2]; mat[2] = mat[ 8]; mat[ 8] = temp;
            temp = mat[3]; mat[3] = mat[12]; mat[12] = temp;

            temp = mat[6]; mat[6] = mat[ 9]; mat[ 9] = temp;
            temp = mat[7]; mat[7] = mat[13]; mat[13] = temp;
            
            temp = mat[11]; mat[11] = mat[14]; mat[14] = temp;

            return this;
        }
    },
    append: {
        value: function(matrix) {
            if (!(matrix instanceof Matrix3D)) {
                throw new TypeError();
            }
            
            var a = this.elements,
                a00 = a[0], a01 = a[4], a02 = a[ 8], a03 = a[12],
                a10 = a[1], a11 = a[5], a12 = a[ 9], a13 = a[13],
                a20 = a[2], a21 = a[6], a22 = a[10], a23 = a[14],
                a30 = a[3], a31 = a[7], a32 = a[11], a33 = a[15];

            // cache the current row of the second matrix

            var b = matrix.elements,
                b0, b1, b2, b3;

            b0 = b[0], b1 = b[4], b2 = b[8], b3 = b[12];
            a[ 0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
            a[ 4] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
            a[ 8] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
            a[12] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

            b0 = b[1], b1 = b[5], b2 = b[9], b3 = b[13];
            a[ 1] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
            a[ 5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
            a[ 9] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
            a[13] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

            b0 = b[2], b1 = b[6], b2 = b[10], b3 = b[14];
            a[ 2] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
            a[ 6] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
            a[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
            a[14] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

            b0 = b[3], b1 = b[7], b2 = b[11], b3 = b[15];
            a[ 3] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
            a[ 7] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
            a[11] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
            a[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;

            return this;
        }
    },
    recompose: {
        value: function(x, y, z, rx, ry, rz, sx, sy, sz) {
            var sinX = Math.sin(rx), cosX = Math.cos(rx),
                sinY = Math.sin(ry), cosY = Math.cos(ry),
                sinZ = Math.sin(rz), cosZ = Math.cos(rz),

                sinYcosZ = sinY * cosZ,
                sinYsinZ = sinY * sinZ,

                sinXscaleY = sinX * sy,
                cosXscaleY = cosX * sy,

                sinXscaleZ = sinX * sz,
                cosXscaleZ = cosX * sz,

                cosYscaleX = cosY * sx,

                mat = this.elements;

            mat[0] = cosYscaleX * cosZ;
            mat[1] = cosYscaleX * sinZ;
            mat[2] = -sinY * sx;
            mat[3] = 0;

            mat[4] = sinXscaleY * sinYcosZ - cosXscaleY * sinZ;
            mat[5] = sinXscaleY * sinYsinZ + cosXscaleY * cosZ;
            mat[6] = sinXscaleY * cosY;
            mat[7] = 0;

            mat[ 8] = cosXscaleZ * sinYcosZ + sinXscaleZ * sinZ;
            mat[ 9] = cosXscaleZ * sinYsinZ - sinXscaleZ * cosZ;
            mat[10] = cosXscaleZ * cosY;
            mat[11] = 0;

            mat[12] = x;
            mat[13] = y;
            mat[14] = z;
            mat[15] = 1;

            return this;
        }
    },
    perspective: {
        value: function(fieldOfView, aspectRatio, near, far) {
            var mat = this.elements,
                tan = Math.tan(fieldOfView * 0.5);
            
            mat[0] = 1 / (tan * aspectRatio);
            mat[1] = 0;
            mat[2] = 0;
            mat[3] = 0;

            mat[4] = 0;
            mat[5] = 1 / tan;
            mat[6] = 0;
            mat[7] = 0;

            mat[ 8] = 0;
            mat[ 9] = 0;
            mat[10] = -(far + near) / (far - near);
            mat[11] = -1;

            mat[12] = 0;
            mat[13] = 0;
            mat[14] = -2 * far * near / (far - near);
            mat[15] = 0;

            return this;
        }
    },
    normalMatrix: {
        value: function() {
            var mat = this.elements,
                a00 = mat[0], a01 = mat[4], a02 = mat[ 8],
                a10 = mat[1], a11 = mat[5], a12 = mat[ 9],
                a20 = mat[2], a21 = mat[6], a22 = mat[10],

                m00 = a11 * a22 - a12 * a21,
                m01 = a10 * a22 - a12 * a20,
                m02 = a10 * a21 - a11 * a20,

                det = a00 * m00 - a01 * m01 + a02 * m02;

            if (det === 0) { console.warn('matrix is singular'); return null; }

            det = 1 / det;

            // use an untransposed matrix of cofactors

            mat[0] = m00 * det;
            mat[1] = (a01 * a22 - a02 * a21) * (-det);
            mat[2] = (a01 * a12 - a02 * a11) * det;
            mat[3] = 0;

            mat[4] = m01 * (-det);
            mat[5] = (a00 * a22 - a02 * a20) * det;
            mat[6] = (a00 * a12 - a02 * a10) * (-det);
            mat[7] = 0;

            mat[ 8] = m02 * det;
            mat[ 9] = (a00 * a21 - a01 * a20) * (-det);
            mat[10] = (a00 * a11 - a01 * a10) * det;
            mat[11] = 0;

            mat[12] = 0;
            mat[13] = 0;
            mat[14] = 0;
            mat[15] = 1;

            return this;
        }
    }
});

const IDENTITY = new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
]);
