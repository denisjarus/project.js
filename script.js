var canvas,
    target,
    context,

    keyboard,
    renderer,

    stage,
    camera,
    surface,
    display,

    forwards,
    backwards,
    left,
    right,

    physics;

onload = function() {
    canvas = document.getElementById('canvas');
    target = document.getElementById('target');

    if (!(context = canvas.getContext('experimental-webgl'))) {
        console.warn('webgl is not available');
    }
        
    renderer = new Renderer(context);
    physics = new Physics();
    
    stage = new Object3D();

    // physicsal camera

    camera = stage.addChild(new Camera3D());

    camera.collider = new SphereCollider(null, 1);
    camera.collider.mass = 1;

    // point light

    camera.addChild(new PointLight());

    // skydome

    var sky = stage.addChild(new Mesh());

    sky.geometry = new SurfaceGeometry(30, 30);
    sky.geometry.parametrize(
        Geometry.POSITION,
        function(s, t) {
            return [
                1000 * Math.sin(s) * Math.cos(t),
                1000 * Math.cos(s),
                1000 * Math.sin(s) * Math.sin(t)
            ];
        },
        0, Math.PI,
        0, Math.PI * 2
    );

    sky.material = new Material();
    sky.material.shader = Shader.cubeMap;
    sky.material.setProperty('cubeMap', loadTextureCube([
        'img/skyBox1.jpg',
        'img/skyBox2.jpg',
        'img/skyBox3.jpg',
        'img/skyBox4.jpg',
        'img/skyBox5.jpg',
        'img/skyBox6.jpg'
    ]));

    sky.material.depthMask = false;

    // ground

    var ground = stage.addChild(new Mesh());
    ground.y = -50;

    ground.geometry = new SurfaceGeometry(10, 10);

    ground.geometry.parametrize(
        Geometry.POSITION,
        function(x, y) { return [x, 0, y]; },
        100, -100,
        -100, 100
    );

    ground.geometry.parametrize(
        Geometry.TEXCOORD,
        function(u, v) { return [u, v]; },
        0, 10,
        0, 10
    );

    Geometry.getNormals(ground.geometry);

    ground.material = new Material();
    ground.material.shader = Shader.gouraudShader;
    ground.material.setProperty('diffuseMap', loadTexture2D('img/diffuseMap.bmp'));

    // sphere

    var sphere = stage.addChild(new Mesh());
    sphere.geometry = new SurfaceGeometry(30, 30);
    sphere.geometry.parametrize(
        Geometry.POSITION,
        function(s, t) {
            return [
                1 * Math.sin(s) * Math.cos(t),
                1 * Math.cos(s),
                1 * Math.sin(s) * Math.sin(t)
            ];
        },
        0, Math.PI,
        0, Math.PI * 2
    );

    sphere.geometry.parametrize(
        Geometry.TEXCOORD,
        function(u, v) { return [u, v] },
        0, 10,
        0, 10
    );

    Geometry.getNormals(sphere.geometry);

    sphere.material = new Material();
    sphere.material = ground.material;

    sphere.z = -5;

    sphere.collider = new SphereCollider(null, 1);
    sphere.collider.mass = 10;

    // second instance of ground

    var instance = stage.addChild(new Mesh(ground.geometry, ground.material));
    instance.scaleX = instance.scaleY = instance.scaleZ = 0.1;
    instance.y = -10;
    instance.collider = new BoxCollider(new Vector3D([0, -2, 0]), new Vector3D([10, 2, 10]));
    instance.collider.mass = 0;
    // instance.rotationY = Math.PI / 4;

    // surface

    surface = stage.addChild(new Mesh());

    surface.geometry = new SurfaceGeometry(60, 5);

    surface.geometry.parametrize(
        Geometry.POSITION,
        function(s, t) {
            return [
                (30 + t * Math.cos(s / 2)) * Math.cos(s),
                (30 + t * Math.cos(s / 2)) * Math.sin(s),
                t * Math.sin(s / 2)
            ];
        },
        -Math.PI, Math.PI,
        -10, 10
    );

    surface.geometry.parametrize(
        Geometry.TEXCOORD,
        function(u, v) { return [u, v]; },
        0, 10,
        0, 1
    );

    Geometry.getNormals(surface.geometry);

    surface.material = ground.material.clone();

    // display

    display = stage.addChild(new Mesh());

    display.geometry = new SurfaceGeometry(2, 2);
    display.geometry.parametrize(Geometry.POSITION, function(x, y) { return [x, y, 0]; }, -2, 2, -2, 2);
    display.geometry.parametrize(Geometry.TEXCOORD, function(u, v) { return [u, v]; }, 0, 1, 0, 1);
    Geometry.getNormals(display.geometry);

    var displayTexture = new DataTexture(512, 512);
    displayTexture.wrapU = displayTexture.wrapV = Texture.CLAMP;

    display.material = new Material();
    display.material.shader = Shader.gouraudShader;
    display.material.setProperty('diffuseMap', displayTexture);

    display.y = -5;
    display.z = -10;

    // add colored point lights
    var red = stage.addChild(new PointLight([1, 0, 0]));
    red.x = -100;
    red.z = -100;
    red.y = -30;

    var green = stage.addChild(new PointLight([0, 1, 0]));
    green.x = 100;
    green.z = -100;
    green.y = -30;

    var blue = stage.addChild(new PointLight([0, 0, 1]));
    blue.x = 100;
    blue.z = 100;
    blue.y = -30;

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
        function() { physics.addForce(camera, new Vector3D([0, 500, 0])); }
    );
    keyboard.bind('C'.charCodeAt(0),
        function() { down = true; },
        function() { down = false; }
    );

    keyboard.bind(KeyboardControls.ENTER,
        function() { physics = !physics; }
    );

    loadGLTF('gltf/duck/duck.json');

    onresize();

    requestAnimationFrame(enterFrame);
};

onresize = function() {
    context.canvas.width = context.canvas.clientWidth;
    context.canvas.height = context.canvas.clientHeight;
    // context.viewport(0, 0, context.canvas.width, context.canvas.height);

    // camera.aspectRatio = context.canvas.width / context.canvas.height;
};

onmousedown = function() {
    canvas.webkitRequestPointerLock();
};

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

    vec.set(camera.localToGlobal.elements, 8).negate().scale(10);

    if (forwards) {
        physics.addForce(camera, vec);
    }
    if (backwards) {
        physics.addForce(camera, vec.negate());
    }

    vec.set(camera.localToGlobal.elements, 0).negate().scale(10);

    if (left) {
        physics.addForce(camera, vec);
    }
    if (right) {
        physics.addForce(camera, vec.negate());
    }

    surface.rotationY += 0.1 * Math.PI / 180;

    //

    physics.simulate(stage, delta * 0.001);

    // console.clear();
    // console.log(camera.y);

    camera.aspectRatio = 1;
    display.visible = false;
    context.viewport(0, 0, 512, 512);
    renderer.render(stage, camera, display.material.getProperty('diffuseMap'));

    camera.aspectRatio = context.canvas.width / context.canvas.height;
    display.visible = true;
    context.viewport(0, 0, context.canvas.width, context.canvas.height);
    renderer.render(stage, camera);

    requestAnimationFrame(enterFrame);

    // test camera

    // vec.elements.set([0, -50, 0]);
    // camera.project(vec);
    // if (vec.z < 1) {
    //     target.style.display = 'block';
    //     target.style.left = (vec.x + 1) * canvas.width / 2 + 'px';
    //     target.style.top = (-vec.y + 1) * canvas.height / 2 + 'px';
    // } else {
    //     target.style.display = 'none';
    // }
}

function mouseMove(event) {
    camera.rotationY -= 0.2 * event.webkitMovementX * Math.PI / 180;
    camera.rotationX -= 0.2 * event.webkitMovementY * Math.PI / 180;

    camera.rotationX = Math.max(-Math.PI / 2, Math.min(camera.rotationX, Math.PI / 2));
}

function loadTexture2D(url) {
    var texture = new Texture(),
        image = new Image();

    image.src = url;

    image.onload = function() {
        texture.setData(0, image);
    };

    return texture;
}

function loadTextureCube(urls) {
    var texture = new Texture(),
        images = [];

    for (var i = 0; i < 6; i++) {
        var image = images[i] = new Image();

        image.src = urls[i];

        image.onload = function(event) {
            texture.setData(images.indexOf(event.target), event.target);
        };
    }

    return texture;
}

function loadGLTF(url) {
    var request = new XMLHttpRequest();

    request.open('GET', url, true);
    request.send();

    request.addEventListener('load', function(event) {
        var data = JSON.parse(this.responseText);
        console.log(data);
    });
}
