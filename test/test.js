function test(name, result, expect, epsilon) {
    if (name) {
        console.log(name);
    }
    var failed = false;

    if (result === expect) {
        return true;

    } else if (typeof(result) === 'number' && typeof(expect) === 'number') {
        if (Math.abs(result - expect) > (epsilon || 0.0)) {
            console.error('rawr');
            return false;
        }

    } else if (typeof(result) === 'object' && typeof(expect) === 'object') {
        var resultProperties = Object.getOwnPropertyNames(result),
            expectProperties = Object.getOwnPropertyNames(expect);

        for (var property, i = 0; property = resultProperties[i]; i++) {
            if (test(null, result[property], expect[property]) !== true) {
                console.error(property, ':', result[property], '( expected:', expect[property], ')');
            }
        }
    } else {
        console.error(result, '( expected:', expect, ')');
        return false;
    }
    return true;
}

//Vector3D
var a = new Vector3D([111, 222, 333]),
    b = new Vector3D([444, 555, 666]),

    result = new Vector3D();

result.copyFrom(a);
result.add(b);
test('Vector3D.add', result.elements, new Float32Array([555, 777, 999]));

result.copyFrom(b);
result.subtract(a);
test('Vector3D.subtract', result.elements, new Float32Array([333, 333, 333]));

result.copyFrom(a);
result.cross(b);
test('Vector3D.cross', result.elements, new Float32Array([-36963, 73926, -36963]));

test('Vector3D.distance', a.distance(b), 9090);

test('test', 10, 10);

