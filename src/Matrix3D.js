function Matrix3D(elements) {
    if (!elements || elements.length !== 16) {
        elements = new Float32Array(IDENTITY);
    } else if (elements instanceof Float32Array === false) {
        elements = new Float32Array(elements);
    }
    
    Object.defineProperties(this, {
        elements: { value: elements },
        position: { value: new Vector3D(elements.subarray(12, 15)) }
    });
}

Object.defineProperties(Matrix3D.prototype, {
    clone: {
        value: function() {
            return new Matrix3D(this.elements);
        }
    },
    copyFrom: {
        value: function(matrix) {
            if (matrix instanceof Matrix3D === false) {
                throw new Error();
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
                m00 = mat[0], m01 = mat[4], m02 = mat[ 8], m03 = mat[12],
                m10 = mat[1], m11 = mat[5], m12 = mat[ 9], m13 = mat[13],
                m20 = mat[2], m21 = mat[6], m22 = mat[10], m23 = mat[14],
                m30 = mat[3], m31 = mat[7], m32 = mat[11], m33 = mat[15],

                d00 = m00 * m11 - m01 * m10,
                d01 = m00 * m12 - m02 * m10,
                d02 = m00 * m13 - m03 * m10,
                d03 = m01 * m12 - m02 * m11,
                d04 = m01 * m13 - m03 * m11,
                d05 = m02 * m13 - m03 * m12,

                d06 = m20 * m31 - m21 * m30,
                d07 = m20 * m32 - m22 * m30,
                d08 = m20 * m33 - m23 * m30,
                d09 = m21 * m32 - m22 * m31,
                d10 = m21 * m33 - m23 * m31,
                d11 = m22 * m33 - m23 * m32;

            // calculate determinant

            var d = d00 * d11 - d01 * d10 + d02 * d09 + d03 * d08 - d04 * d07 + d05 * d06;

            if (d === 0) { console.warn('matrix is singular'); return null; }
            
            d = 1 / d;

            mat[ 0] = (m11 * d11 - m12 * d10 + m13 * d09) * d;
            mat[ 4] = (m01 * d11 - m02 * d10 + m03 * d09) * (-d);
            mat[ 8] = (m31 * d05 - m32 * d04 + m33 * d03) * d;
            mat[12] = (m21 * d05 - m22 * d04 + m23 * d03) * (-d);

            mat[ 1] = (m10 * d11 - m12 * d08 + m13 * d07) * (-d);
            mat[ 5] = (m00 * d11 - m02 * d08 + m03 * d07) * d;
            mat[ 9] = (m30 * d05 - m32 * d02 + m33 * d01) * (-d);
            mat[13] = (m20 * d05 - m22 * d02 + m23 * d01) * d;

            mat[ 2] = (m10 * d10 - m11 * d08 + m13 * d06) * d;
            mat[ 6] = (m00 * d10 - m01 * d08 + m03 * d06) * (-d);
            mat[10] = (m30 * d04 - m31 * d02 + m33 * d00) * d;
            mat[14] = (m20 * d04 - m21 * d02 + m23 * d00) * (-d);

            mat[ 3] = (m10 * d09 - m11 * d07 + m12 * d06) * (-d);
            mat[ 7] = (m00 * d09 - m01 * d07 + m02 * d06) * d;
            mat[11] = (m30 * d03 - m31 * d01 + m32 * d00) * (-d);
            mat[15] = (m20 * d03 - m21 * d01 + m22 * d00) * d;

            return this;
        }
    },
    transpose: {
        value: function() {
            var mat = this.elements, temp;

            temp = mat[ 1]; mat[ 1] = mat[ 4]; mat[ 4] = temp;
            temp = mat[ 2]; mat[ 2] = mat[ 8]; mat[ 8] = temp;
            temp = mat[ 3]; mat[ 3] = mat[12]; mat[12] = temp;

            temp = mat[ 6]; mat[ 6] = mat[ 9]; mat[ 9] = temp;
            temp = mat[ 7]; mat[ 7] = mat[13]; mat[13] = temp;
            
            temp = mat[11]; mat[11] = mat[14]; mat[14] = temp;

            return this;
        }
    },
    append: {
        value: function(matrix) {
            if (matrix instanceof Matrix3D === false) {
                throw new Error();
            }
            var a = this.elements,
                a00 = a[0], a01 = a[4], a02 = a[ 8], a03 = a[12],
                a10 = a[1], a11 = a[5], a12 = a[ 9], a13 = a[13],
                a20 = a[2], a21 = a[6], a22 = a[10], a23 = a[14],
                a30 = a[3], a31 = a[7], a32 = a[11], a33 = a[15];

            // cache only the current line of another matrix 

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

            mat.set(IDENTITY);

            mat[ 0] = cosYscaleX * cosZ;
            mat[ 4] = sinXscaleY * sinYcosZ - cosXscaleY * sinZ;
            mat[ 8] = cosXscaleZ * sinYcosZ + sinXscaleZ * sinZ;
            mat[12] = x;

            mat[ 1] = cosYscaleX * sinZ;
            mat[ 5] = sinXscaleY * sinYsinZ + cosXscaleY * cosZ;
            mat[ 9] = cosXscaleZ * sinYsinZ - sinXscaleZ * cosZ;
            mat[13] = y;

            mat[ 2] = -sinY * sx;
            mat[ 6] = sinXscaleY * cosY;
            mat[10] = cosXscaleZ * cosY;
            mat[14] = z;

            return this;
        }
    }
});

Object.defineProperties(Matrix3D, {
    perspective: {
        value: function(fieldOfView, aspectRatio, near, far) {
            var mat = new Float32Array(16),
                tan = Math.tan(fieldOfView * 0.5);
            
            mat[ 0] = 1 / (tan * aspectRatio);
            mat[ 4] = 0;
            mat[ 8] = 0;
            mat[12] = 0;

            mat[ 1] = 0;
            mat[ 5] = 1 / tan;
            mat[ 9] = 0;
            mat[13] = 0;

            mat[ 2] = 0;
            mat[ 6] = 0;
            mat[10] = -(far + near) / (far - near);
            mat[14] = -2 * far * near / (far - near);

            mat[ 3] = 0;
            mat[ 7] = 0;
            mat[11] = -1;
            mat[15] = 0;

            return new Matrix3D(mat);
        }
    }
});

const IDENTITY = new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
]);