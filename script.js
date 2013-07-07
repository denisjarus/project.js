var context,
    renderer,
    stage,
    camera,
    objects = [];

var program, uColor, uLight, uAmbient;

window.onload = function() {
    var canvas = document.getElementById('canvas');
    if (!(context = canvas.getContext('experimental-webgl'))) {
        console.warn('webgl is not available');
    }
        
    renderer = new Renderer(context);
    
    stage = new Object3D();

    camera = stage.addChild(new Camera3D());
    camera.z = 500;

    //geometry
    var geometry = new Geometry(),
        segments = 50,
        radius = 5;

    //vertices
    var verts = [],
        norms = [];

    for (var i = 0; i <= segments; i++) {
        var phi = i * Math.PI / segments,
            sinPhi = Math.sin(phi),
            cosPhi = Math.cos(phi);

        for (var j = 0; j <= segments; j++) {
            var lambda = j * Math.PI * 2 / segments,
                x = Math.cos(lambda) * sinPhi,
                y = cosPhi,
                z = Math.sin(lambda) * sinPhi;

            verts.push(x * radius, y * radius, z * radius);
            norms.push(x, y, z);
        }
    }
    geometry.setData('position', new Float32Array(verts));
    geometry.setData('normal', new Float32Array(norms));

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
        object.material = new Material();
        object.material.color = new Float32Array([Math.random(), Math.random(), Math.random()]);
        objects.push(object);
    }
    //add light to the last object
    object.scaleX = object.scaleY = object.scaleZ = 2;
    object.addChild(new Light3D(new Float32Array([1, 0, 0, 1])));
    object.material.color = new Float32Array([1,1,1]);
    object.material.shader = new Shader(
        [
            'attribute vec3 position;',
            'uniform mat4 model;',
            'uniform mat4 view;',
            'uniform mat4 projection;',
            'void main(void) {',
            '   gl_Position = projection * view * model * vec4(position, 1.0);',
            '}'
        ].join('\n'),
        [
            'precision mediump float;',
            'uniform vec3 color;',
            'void main(void) {',
            '   gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);',
            '}'
        ].join('\n'),
        function(uniforms, object, camera) {
            uniforms.model = object.localToGlobal.elements;
            uniforms.view = camera.globalToLocal.elements;
            uniforms.projection = camera.projection.elements;
            uniforms.color = object.material.color;
        }
    );

    window.onresize();
    window.requestAnimationFrame(enterFrame);
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