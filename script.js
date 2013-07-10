var context,
    renderer,
    stage,
    camera,
    sphere,
    plane;

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

    //sphere
    sphere = stage.addChild(new Mesh(new SphereGeometry(150, 5, 15), new Material()));
    sphere.material.color = new Float32Array([1, 0, 0]);
    sphere.material.wireframe = true;

    //textured
    var object = stage.addChild(new Mesh());
    object.scaleX = object.scaleY = object.scaleZ = 5;
    object.geometry = new Geometry();
    object.geometry.setData('position', new Float32Array(
        [
            -10, -10, 0,
            10, -10, 0,
            -10, 10, 0,
            10, 10, 0
        ]
    ));
    object.geometry.setData('texcoord', new Float32Array(
        [
            0, 0,
            1, 0,
            0, 1,
            1, 1
        ]
    ));
    object.geometry.indices = new Uint16Array(
        [
            0, 1, 2,
            1, 3, 2
        ]
    );
    object.material = new Material()
    object.material.texture = new Texture();

    var image = new Image();
    image.src = 'test.bmp';
    image.onload = function() {
        object.material.texture.setData(image);
    }

    object.material.shader = new Shader(
        [
            'attribute vec3 position;',
            'attribute vec2 texcoord;',
            'uniform mat4 model;',
            'uniform mat4 view;',
            'uniform mat4 projection;',
            'varying vec2 uv;',
            'void main(void) {',
            '   uv = texcoord;',
            '   gl_Position = projection * view * model * vec4(position, 1.0);',
            '}'
        ].join('\n'),
        [
            'precision mediump float;',
            'uniform sampler2D texture;',
            'varying vec2 uv;',
            'void main(void) {',
            '   gl_FragColor = texture2D(texture, uv);',
            '}'
        ].join('\n'),
        function(uniforms, object, camera) {
            uniforms.model = object.localToGlobal.elements;
            uniforms.view = camera.globalToLocal.elements;
            uniforms.projection = camera.projection.elements;
            uniforms.texture = object.material.texture;
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
    sphere.rotationY += 0.1;

    renderer.draw(stage, camera);

    window.requestAnimationFrame(enterFrame);
}