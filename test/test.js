/*

name - test name to log
actual - a primitive type or an object you get
expected - a primitive type or an object you expected to get
epsilon - math calculation error
key - serves some internal purposes, do not touch this

*/

function test(name, actual, expected, epsilon, key) {
    key = key || 'actual';

    if (name) {
        console.log(name);
    }

    if (actual === expected) {
        return true;

    } else if (typeof(actual) === 'number' && typeof(expected) === 'number') {
        if (Math.abs(actual - expected) < (epsilon || 0.0)) {
            return true;
        }

    } else if (typeof(actual) === 'object' && typeof(expected) === 'object') {
        var properties = Object.getOwnPropertyNames(expected);

        for (var property, i = 0; property = properties[i]; i++) {
            test(null, actual[property], expected[property], epsilon, key + '[' + property + ']');
        }

        return true;
    }

    console.warn(key + ': ' + actual + '; expected: ' + expected);

    return false;
}

// Vector3D

var vec = new Vector3D(),
    a = new Vector3D([1, 2, 3]),
    b = new Vector3D([4, 5, 6]);

// Vector3D.clone

test('Vector3D.clone()', a.clone(), a);

// Vector3D.copyFrom

test('Vector3D.copyFrom()', vec.copyFrom(b), b);

// Vector3D.add

vec.copyFrom(a);
vec.add(b);
test('Vector3D.add()', vec, new Vector3D([5, 7, 9]));

// Vector3D.subtract

vec.copyFrom(b);
vec.subtract(a);
test('Vector3D.subtract()', vec, new Vector3D([3, 3, 3]));

// Vector3D.cross

vec.copyFrom(a);
vec.cross(b);
test('Vector3D.cross()', vec, new Vector3D([-3, 6, -3]));

// Vector3D.distance

test('Vector3D.distance()', a.distance(b), 5.19615, 0.0001);

// Vector3D.dot

test('Vector3D.dot()', a.dot(b), 32);

// Vector3D.length

test('Vector3D.length', a.length, 3.74166, 0.0001);

// Vector3D.lengthSquared

test('Vector3D.lengthSquared', a.lengthSquared, 14);

// Vector3D.negate()

vec.copyFrom(a);
vec.negate();
test('Vector3D.negate()', vec, new Vector3D([-1, -2, -3]));

// Vector3D.normalize()

vec.copyFrom(a);
vec.normalize();
test('Vector3D.normalize()', vec, new Vector3D([0.26726, 0.53452, 0.80178]), 0.0001);

// Vector3D.scale()

vec.copyFrom(a);
vec.scale(2.5);
test('Vector3D.scale()', vec, new Vector3D([2.5, 5, 7.5]));

// Vector3D.transform()

vec.copyFrom(a);
vec.transform(new Matrix3D(
    [
        1, 5, 9, 13,
        2, 6, 10, 14,
        3, 7, 11, 15,
        4, 8, 12, 16
    ]
));
test('Vector3D.transform()', vec, new Vector3D([0.17647, 0.45098, 0.72549]), 0.0001);

// Matrix3D

var mat = new Matrix3D(),
    a = new Matrix3D(),
    b = new Matrix3D();
