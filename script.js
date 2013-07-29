var canvas,
    context,

    keyboard,
    renderer,

    stage,
    camera,
    surface,

    forwards,
    backwards,
    left,
    right,
    up,
    down;

window.onload = function() {
    canvas = document.getElementById('canvas');
    if (!(context = canvas.getContext('experimental-webgl'))) {
        console.warn('webgl is not available');
    }
        
    renderer = new Renderer(context);
    
    stage = new Object3D();

    camera = stage.addChild(new Camera3D());
    // camera.z = 500;

    // surface

    surface = stage.addChild(new Mesh());

    // surface.material = new Material();

    surface.material = new TextureMaterial();
    surface.material.diffuseMap = new Texture();

    var img = new Image();
    img.src = 'test.bmp';
    img.onload = function() {
        surface.material.diffuseMap.setData(img);
    };

    // surface.geometry = new SurfaceGeometry(35, 35);
    // surface.geometry = new SurfaceGeometry(2, 2);
    surface.geometry = new SurfaceGeometry(60, 5);

    surface.geometry.parametrize(
        Geometry.POSITION,
        [
            function(s, t) { return (150 + t * Math.cos(s / 2)) * Math.cos(s); },
            function(s, t) { return (150 + t * Math.cos(s / 2)) * Math.sin(s); },
            function(s, t) { return t * Math.sin(s / 2); },
        ],
        -Math.PI, Math.PI,
        -50, 50
    );

    //CYLINDER

    // surface.geometry.set(
    //     function(y, r) { return 100 * Math.cos(r); },
    //     function(y, r) { return y; },
    //     function(y, r) { return 100 * Math.sin(r); },
    //     100, -100,
    //     0, 2 * Math.PI
    // );

    //SPHERE

    // surface.geometry.set(
    //     function(u, v) { return 200 * Math.sin(u) * Math.cos(v); },
    //     function(u, v) { return 200 * Math.cos(u); },
    //     function(u, v) { return 200 * Math.sin(u) * Math.sin(v); },
    //     Math.PI / 4, Math.PI * 3/4,
    //     0, 2 * Math.PI
    // );

    //PLANE

    // surface.geometry.parametrize(
    //     Geometry.POSITION,
    //     [
    //         function(x, z) { return x; },
    //         function() { return 0; },
    //         function(x, z) { return z; },
    //     ],
    //     -100, 100,
    //     -100, 100
    // );

    // surface.y = -100;

    // var heightMap = new Image();
    // heightMap.src = 'heightmap.png';

    // heightMap.onload = function(event) {
    //     var context2D = document.createElement('canvas').getContext('2d'),
    //         image = event.target,
    //         width = image.width,
    //         height = image.height;

    //     context2D.width = width;
    //     context2D.height = height;
    //     context2D.drawImage(image, 0, 0);

    //     var data = context2D.getImageData(0, 0, width, height).data;

    //     surface.geometry.set(
    //         function(x, y) { return x - width / 2; },
    //         function(x, y) { console.log(Math.round(x + width * y) * 4); return data[Math.round(x + width * y) * 4] * 10; },
    //         function(x, y) { return y - height / 2; },
    //         0, width - 1,
    //         0, height - 1
    //     );

    //     surface.material.diffuseMap.setData(image);
    // }

    surface.geometry.parametrize(
        Geometry.TEXCOORD,
        [
            function(u, v) { return u; },
            function(u, v) { return v; }
        ],
        0, 10,
        0, 1
    );

    // controls

    var vec = new Vector3D(),
        mat = new Matrix3D();

    keyboard = new KeyboardControls(canvas);
    keyboard.bind('W'.charCodeAt(0),
        function() { forwards = true; },
        function() { forwards = false; }
    );
    keyboard.bind('S'.charCodeAt(0),
        function() { backwards = true; },
        function() { backwards = false; }
    );
    keyboard.bind('A'.charCodeAt(0),
        function() { left = true; },
        function() { left = false; }
    );
    keyboard.bind('D'.charCodeAt(0),
        function() { right = true; },
        function() { right = false; }
    );
    keyboard.bind(KeyboardControls.SPACE,
        function() { up = true; },
        function() { up = false; }
    );
    keyboard.bind('C'.charCodeAt(0),
        function() { down = true; },
        function() { down = false; }
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

window.onmousedown = function() {
    canvas.webkitRequestPointerLock();
}

document.addEventListener('webkitpointerlockchange', function(event) {
    if (document.webkitPointerLockElement === canvas) {
        window.addEventListener('mousemove', mouseMove, false);
    } else {
        window.removeEventListener('mousemove', mouseMove);
    }
});

document.oncontextmenu = function() {
    return false;
}

function enterFrame() {
    var vec = new Vector3D([0, 0, 1]),
        mat = new Matrix3D();

    mat.copyFrom(camera.localToGlobal);
    mat.position.elements.set([0, 0, 0]);

    vec.transform(mat);

    if (forwards) {
        camera.x -= vec.x;
        camera.y -= vec.y;
        camera.z -= vec.z;
    }
    if (backwards) {
        camera.x += vec.x;
        camera.y += vec.y;
        camera.z += vec.z;
    }

    vec.elements.set([1, 0, 0]);
    vec.transform(mat);

    if (left) {
        camera.x -= vec.x;
        camera.y -= vec.y;
        camera.z -= vec.z;
    }
    if (right) {
        camera.x += vec.x;
        camera.y += vec.y;
        camera.z += vec.z;
    }

    if (up) {
        camera.y++;
    }
    if (down) {
        camera.y--;
    }

    renderer.draw(stage, camera);

    window.requestAnimationFrame(enterFrame);
}

function mouseMove(event) {
    camera.rotationY -= 0.2 * event.webkitMovementX * Math.PI / 180;
    camera.rotationX -= 0.2 * event.webkitMovementY * Math.PI / 180;

    camera.rotationX = Math.max(-Math.PI / 2, Math.min(camera.rotationX, Math.PI / 2));
}