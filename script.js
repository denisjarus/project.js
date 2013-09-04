var canvas,
    target,
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
    target = document.getElementById('target');

    if (!(context = canvas.getContext('experimental-webgl'))) {
        console.warn('webgl is not available');
    }
        
    renderer = new Renderer(context);
    
    stage = new Stage3D();

    light = stage.addChild(new Light3D());

    // physicsal camera

    camera = stage.addChild(new Camera3D());
    
    camera.physics = new Physics(camera);

    // ground

    var ground = stage.addChild(new Mesh());
    ground.y = - 200;

    ground.geometry = new SurfaceGeometry(10, 10);

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
    ground.material.diffuseMap = new Texture();

    var img = new Image();
    img.src = 'diffuseMap.bmp';
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

    // surface.material = new TextureMaterial();
    surface.material = new GouraudMaterial();
    surface.material.diffuseMap = ground.material.diffuseMap;

    // add colored point lights
    var red = stage.addChild(new Light3D([1, 0, 0]));
    red.x = -500;
    red.z = -500;
    red.y = -150;

    var green = stage.addChild(new Light3D([0, 1, 0]));
    green.x = 500;
    green.z = -500;
    green.y = -150;

    var blue = stage.addChild(new Light3D([0, 0, 1]));
    blue.x = 500;
    blue.z = 500;
    blue.y = -150;

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

    keyboard.bind(KeyboardControls.BACKSPACE,
        function() { camera.lookAt(new Vector3D([0, 0, 0])); }
    );

    // keyboard.bind('1'.charCodeAt(0),
    //     function() { surface.material.diffuseMap.minFilter = context.NEAREST; }
    // );
    // keyboard.bind('2'.charCodeAt(0),
    //     function() { surface.material.diffuseMap.minFilter = context.LINEAR; }
    // );
    // keyboard.bind('3'.charCodeAt(0),
    //     function() { surface.material.diffuseMap.minFilter = context.NEAREST_MIPMAP_NEAREST; }
    // );
    // keyboard.bind('4'.charCodeAt(0),
    //     function() { surface.material.diffuseMap.minFilter = context.NEAREST_MIPMAP_LINEAR; } // trilinear
    // );
    // keyboard.bind('5'.charCodeAt(0),
    //     function() { surface.material.diffuseMap.minFilter = context.LINEAR_MIPMAP_NEAREST; } 
    //     //BILINEAR_MIPMAP
    // );
    // keyboard.bind('6'.charCodeAt(0),
    //     function() { surface.material.diffuseMap.minFilter = context.LINEAR_MIPMAP_LINEAR; } // true trilinear
    //     //TRILINEAR_MIPMAP
    // );

    onresize();
    requestAnimationFrame(enterFrame);

    console.log(stage._objects);
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

    var vec = new Vector3D();

    vec.set(camera.localToGlobal.elements, 8);

    if (physics) {
        if (forwards) {
            camera.x -= vec.x;
            camera.z -= vec.z;
        }
        if (backwards) {
            camera.x += vec.x;
            camera.z += vec.z;
        }
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
    }

    vec.set(camera.localToGlobal.elements, 0);

    if (left) {
        camera.x -= vec.x;
        camera.z -= vec.z;
    }
    if (right) {
        camera.x += vec.x;
        camera.z += vec.z;
    }

    if (up) {
        camera.y++;
    }
    if (down) {
        camera.y--;
    }

    surface.rotationY += 0.1 * Math.PI / 180;

    light.x = camera.x;
    light.y = camera.y;
    light.z = camera.z;

    renderer.render(stage, camera);

    requestAnimationFrame(enterFrame);

    // test camera

    vec.elements.set([0, -50, 0]);
    camera.project(vec);
    if (vec.z < 1) {
        target.style.display = 'block';
        target.style.left = (vec.x + 1) * canvas.width / 2 + 'px';
        target.style.top = (-vec.y + 1) * canvas.height / 2 + 'px';
    } else {
        target.style.display = 'none';
    }
}

function mouseMove(event) {
    camera.rotationY -= 0.2 * event.webkitMovementX * Math.PI / 180;
    camera.rotationX -= 0.2 * event.webkitMovementY * Math.PI / 180;

    camera.rotationX = Math.max(-Math.PI / 2, Math.min(camera.rotationX, Math.PI / 2));

    var near = camera.unproject(new Vector3D([0, 0, 0])),
        far = camera.unproject(new Vector3D([0, 0, 1])),
        dir = far.subtract(near);

    console.log(dir.x, dir.y, dir.z);
}
