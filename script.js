var canvas,
    context,

    keyboard,
    renderer,

    stage,
    light,
    camera,
    surface,

    forwards,
    backwards,
    left,
    right,
    up,
    down,

    physics;

onload = function() {
    canvas = document.getElementById('canvas');
    if (!(context = canvas.getContext('experimental-webgl'))) {
        console.warn('webgl is not available');
    }
        
    renderer = new Renderer(context);
    
    stage = new Object3D();

    light = stage.addChild(new Light3D());

    camera = stage.addChild(new Camera3D());

    // ground

    var ground = stage.addChild(new Mesh());
    ground.y = - 200;

    ground.geometry = new SurfaceGeometry();

    ground.geometry.parametrize(
        Geometry.VERTEX_POSITIONS,
        function(x, y) { return [x, 0, y]; },
        500, -500,
        -500, 500
    );

    ground.geometry.parametrize(
        Geometry.VERTEX_TEXCOORDS,
        function(u, v) { return [u, v]; },
        0, 10,
        0, 10
    );

    Geometry.getNormals(ground.geometry);

    ground.material = new GouraudMaterial();
    // ground.material = new Material();
    ground.material.diffuseMap = new Texture();

    var img = new Image();
    img.src = 'test.bmp';
    img.onload = function() {
        ground.material.diffuseMap.setData(img);
    };

    // second instance of ground

    var instance = stage.addChild(new Mesh(ground.geometry, ground.material));
    instance.scaleX = instance.scaleY = instance.scaleZ = 0.1;
    instance.y = -50;

    // surface

    surface = stage.addChild(new Mesh());

    surface.geometry = new SurfaceGeometry(60, 5);

    surface.geometry.parametrize(
        Geometry.VERTEX_POSITIONS,
        function(s, t) {
            return [
                (150 + t * Math.cos(s / 2)) * Math.cos(s),
                (150 + t * Math.cos(s / 2)) * Math.sin(s),
                t * Math.sin(s / 2)
            ];
        },
        -Math.PI, Math.PI,
        -50, 50
    );

    surface.geometry.parametrize(
        Geometry.VERTEX_TEXCOORDS,
        function(u, v) { return [u, v]; },
        0, 10,
        0, 1
    );

    Geometry.getNormals(surface.geometry);

    surface.material = new TextureMaterial();
    // surface.material = new GouraudMaterial();
    surface.material.diffuseMap = ground.material.diffuseMap;

    // controls

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

    keyboard.bind(KeyboardControls.ENTER,
        function() { physics = !physics; }
    );

    onresize();
    requestAnimationFrame(enterFrame);
}

onresize = function() {
    context.canvas.width = context.canvas.clientWidth;
    context.canvas.height = context.canvas.clientHeight;
    context.viewport(0, 0, context.canvas.width, context.canvas.height);

    camera.aspectRatio = context.canvas.width / context.canvas.height;
}

onmousedown = function() {
    canvas.webkitRequestPointerLock();
}

document.addEventListener('webkitpointerlockchange', function(event) {
    if (document.webkitPointerLockElement === canvas) {
        addEventListener('mousemove', mouseMove, false);
    } else {
        removeEventListener('mousemove', mouseMove);
    }
});

var lastFrame = 0;

function enterFrame(frame) {
    var delta = frame - lastFrame;
    lastFrame = frame;

    // controls

    var vec = new Vector3D([0, 0, 1]),
        mat = new Matrix3D();

    mat.copyFrom(camera.localToGlobal);
    mat.position.elements.set([0, 0, 0]);

    vec.transform(mat);

    if (physics) {
        camera.y--;
    } else {
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
    }

    surface.rotationY += 0.1 * Math.PI / 180;

    light.x = camera.x;
    light.y = camera.y;
    light.z = camera.z;

    renderer.draw(stage, camera);

    requestAnimationFrame(enterFrame);
}

function mouseMove(event) {
    camera.rotationY -= 0.2 * event.webkitMovementX * Math.PI / 180;
    camera.rotationX -= 0.2 * event.webkitMovementY * Math.PI / 180;

    camera.rotationX = Math.max(-Math.PI / 2, Math.min(camera.rotationX, Math.PI / 2));
}
