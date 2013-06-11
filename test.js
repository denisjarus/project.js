var context,
    renderer,
    stage,
    light,
    camera,
    objects = [];

var program, uColor, uLight, uAmbient;

window.onload = function() {
    if (! (context = document.getElementById('canvas').getContext('experimental-webgl'))) {
        console.warn('webgl is not available');
    }
        
    renderer = new Renderer(context);
    
    stage = new Object3D();

    light = stage.addChild(new Light3D());

    camera = stage.addChild(new Camera3D());
    camera.z = 500;

    //geometry
    var geometry = new Geometry(),
        segments = 50,
        radius = 5;

    //vertices
    var sphereVertices = [];

    for (var i = 0; i <= segments; i++) {
        var phi = i * Math.PI / segments,
            sinPhi = Math.sin(phi),
            cosPhi = Math.cos(phi);

        for (var j = 0; j <= segments; j++) {
            var lambda = j * Math.PI * 2 / segments;
            sphereVertices.push(
                radius * Math.cos(lambda) * sinPhi,
                radius * cosPhi,
                radius * Math.sin(lambda) * sinPhi
                );
        }
    }
    geometry.setData(Geometry.POSITION, new Float32Array(sphereVertices));

    //indices
    var sphereIndices = [];

    for (i = 0; i < segments; i++) {
        for (j = 0; j < segments; j++) {
            var a = i * (segments + 1) + j,
                b = a + segments + 1;
            sphereIndices.push(
                a, b, a + 1,
                b, b + 1, a + 1
                );
        }
    }
    geometry.indices = new Uint16Array(sphereIndices);

    //material
    var material = new Material();
    material.setData('diffuseMap', new Texture());

    //objects
    var object = stage,
        numObjects = 1000,
        distance = 10;

    for (i = 0; i < numObjects; i++) {
        object = object.addChild(new Mesh());
        object.x = Math.random() * distance;
        object.y = Math.random() * distance;
        object.z = Math.random() * distance;
        object.rotationX = Math.random() * 360;
        object.rotationY = Math.random() * 360;
        object.rotationZ = Math.random() * 360;
        object.geometry = geometry;
        object.material = material;
        objects.push(object);
    }

    window.onresize();
    window.webkitRequestAnimationFrame(enterFrame);
}

window.onresize = function() {
    context.canvas.width = context.canvas.clientWidth;
    context.canvas.height = context.canvas.clientHeight;
    context.viewport(0, 0, context.canvas.width, context.canvas.height);

    camera.aspectRatio = context.canvas.width / context.canvas.height;
}

document.oncontextmenu = function() {
    return false;
}

function enterFrame() {
    for (var i = 0, length = objects.length; i < length; i++) {
        objects[i].rotationY += 0.1;
    }
    renderer.draw(stage, camera);

    window.requestAnimationFrame(enterFrame);
}