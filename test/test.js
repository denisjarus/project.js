//name - test name to log
//actual - a primitive type or an object you get
//expected - a primitive type or an object you expected to get
//epsilon - math calculation error
//key - serves some internal purposes, do not touch this

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
        var resultProperties = Object.getOwnPropertyNames(actual),
            expectProperties = Object.getOwnPropertyNames(expected);

        for (var property, i = 0; property = resultProperties[i]; i++) {
            test(null, actual[property], expected[property], epsilon, key + '[' + property + ']');
        }

        return true;
    }

    console.warn(key + ': ' + actual + '; expected: ' + expected);

    return false;
}

//MATH
var vec = new Vector3D(),
    mat = new Matrix3D(),
    a = new Vector3D([111, 222, 333]),
    b = new Vector3D([444, 555, 666]);


//Vector3D.add
vec.copyFrom(a);
vec.add(b);
test('Vector3D.add()', vec, new Vector3D([555, 777, 999]));

//Vector3D.subtract
vec.copyFrom(b);
vec.subtract(a);
test('Vector3D.subtract()', vec, new Vector3D([333, 333, 333]));

//Vector3D.cross
vec.copyFrom(a);
vec.cross(b);
test('Vector3D.cross()', vec, new Vector3D([-36963, 73926, -36963]));

//Vector3D.distance
test('Vector3D.distance()', a.distance(b), 576.773, 0.0001);

//Vector3D.dot
test('Vector3D.dot()', a.dot(b), 394272);

//Vector3D.length
test('Vector3D.length', a.length, 415.324, 0.0001);

//Vector3D.lengthSquared
test('Vector3D.lengthSquared', a.lengthSquared, 172494);

//Vector3D.negate()
vec.copyFrom(a);
vec.negate();
test('Vector3D.negate()', vec, new Vector3D([-111, -222, -333]));

//Vector3D.normalize()
vec.copyFrom(a);
vec.normalize();
test('Vector3D.normalize()', vec, new Vector3D([0.267261, 0.534522, 0.801784]), 0.000001);

//Vector3D.scale()
vec.copyFrom(a);
vec.scale(2.5);
test('Vector3D.scale()', vec, new Vector3D([277.5, 555, 832.5]));

//Vector3D.transform()
vec.copyFrom(a);
mat.elements.set(
    [
        1, 5, 9, 13,
        2, 6, 10, 14,
        3, 7, 11, 15,
        4, 8, 12, 16
    ]
);
vec.transform(mat);
