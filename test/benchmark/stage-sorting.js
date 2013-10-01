var shaders = [],
    materials = [],
    geometries = [],
    objects = [];

for (var i = 0; i < 3; i++) {
    shaders[i] = {
        id: i
    };
}

for (var i = 0; i < 10; i++) {
    materials[i] = {
        id: i,
        shader: shaders[Math.floor(Math.random() * shaders.length)]
    }
}

for (var i = 0; i < 10; i++) {
    geometries[i] = {
        id: i
    }
}

for (var i = 0; i < 50; i++) {
    objects[i] = {
        material: materials[Math.floor(Math.random() * materials.length)],
        geometry: geometries[Math.floor(Math.random() * geometries.length)]
    }
}

function log(message, array) {
    console.log(message);
    for (var object, i = 0; object = array[i]; i++) {
        console.log(object.material.shader.id, object.geometry.id, object.material.id);
    }
}

log('unsorted', objects);

// sort

var sorted = objects.slice(0),
    ops1 = 0,
    ops2 = 0;

sorted.sort(function(a, b) {
    var order;

    ops1++;

    if ((order = a.material.shader.id - b.material.shader.id) !== 0) {
        return order;
    }
    if ((order = a.geometry.id - b.geometry.id) !== 0) {
        return order;
        }
    if ((order = a.material.id - b.material.id) !== 0) {
        return order;
    }
    
    return 0;
});

log('sorted 1', sorted);

// sort again

sorted = objects.slice(0);

sorted.sort(function(a, b) {
    ops2++;

    if (a.material.shader !== b.material.shader) {
        return -1;
    } else if (a.geometry !== b.geometry) {
        return -1;
    } else if (a.material !== b.material) {
        return -1;
    }

    return 1;
});

log('sorted 2', sorted);

console.log('operations', ops1, 'vs', ops2);
