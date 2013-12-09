var canvas,
    target,
    context,

    keyboard,
    renderer,

    stage,
    light,
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

    var loader = new Loader();
    loader.load('stage.json');
    
    stage = new Object3D();

    light = stage.addChild(new Light3D());

    // physicsal camera

    camera = stage.addChild(new Camera3D());
    
    camera.physics = new RigidBody(camera);
    camera.bounds = new BoundBox(new Vector3D([-5, -5, -5]), new Vector3D([5, 5, 5]));

    // ground

    var ground = stage.addChild(new Mesh());
    ground.y = - 200;

    ground.geometry = new SurfaceGeometry(10, 10);

    ground.geometry.parametrize(
        Geometry.POSITION,
        function(x, y) { return [x, 0, y]; },
        500, -500,
        -500, 500
    );

    ground.geometry.parametrize(
        Geometry.TEXCOORD,
        function(u, v) { return [u, v]; },
        0, 10,
        0, 10
    );

    Geometry.getNormals(ground.geometry);
    // ground.geometry.setData('normal', ground.geometry.getData('position'));

    ground.material = new Material();
    ground.material.shader = Shader.gouraudShader;
    ground.material.setProperty('diffuseMap', new Texture());

    var img = new Image();
    img.src = 'diffuseMap.bmp';
    img.onload = function() {
        ground.material.getProperty('diffuseMap').setData(0, img);
        requestAnimationFrame(enterFrame);
    };

    // second instance of ground

    var instance = stage.addChild(new Mesh(ground.geometry, ground.material));
    instance.scaleX = instance.scaleY = instance.scaleZ = 0.1;
    instance.y = -50;
    // instance.physics = new RigidBody(instance);
    instance.bounds = new BoundBox(new Vector3D([-50, -5, -50]), new Vector3D([50, 5, 50]));

    // surface

    surface = stage.addChild(new Mesh());

    surface.geometry = new SurfaceGeometry(60, 5);

    surface.geometry.parametrize(
        Geometry.POSITION,
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
    display.geometry.parametrize(Geometry.POSITION, function(x, y) { return [x, y, 0]; }, -10, 10, -10, 10);
    display.geometry.parametrize(Geometry.TEXCOORD, function(u, v) { return [u, v]; }, 0, 1, 0, 1);
    Geometry.getNormals(display.geometry);

    var displayTexture = new DataTexture(512, 512);
    displayTexture.wrapU = displayTexture.wrapV = Texture.CLAMP;

    display.material = new Material();
    display.material.shader = Shader.gouraudShader;
    display.material.setProperty('diffuseMap', displayTexture);

    display.y = -30;
    display.z = -50;

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
        function() { physics.addForce(camera, new Vector3D([0, 0.01, 0])); }
    );
    keyboard.bind('C'.charCodeAt(0),
        function() { down = true; },
        function() { down = false; }
    );

    keyboard.bind(KeyboardControls.ENTER,
        function() { physics = !physics; }
    );

    onresize();

    // gjk

    var boxOne = new BoundBox(new Vector3D([-20, -10, -20]), new Vector3D([20, 10, 20])),
        boxTwo = new BoundBox(new Vector3D([0, 0, 0]), new Vector3D([40, 20, 40]));

    console.log(getSupport(boxOne, boxTwo, new Vector3D([1, 0, 1])));
    console.log('test:', test(boxOne, boxTwo));
};

function test(a, b) {
    var d = new Vector3D([1, 0, 0]),
        simplex = [getSupport(a, b, d)];

    d.negate();

    for (var i = 0; i < 30; i++) {
        simplex.push(getSupport(a, b, d));

        if (simplex[simplex.length - 1].dot(d) <= 0) {
            return false;
        } else {
            if (hasOrigin(simplex, d)) {
                return true;
            }
        }
    }

    return false;
}

function hasOrigin(simplex, s) {

}

function getSupport(a, b, direction) {
    var point1 = a.getSupport(direction),
        point2 = b.getSupport(direction.clone().negate());

    return point1.subtract(point2);
}

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

    vec.set(camera.localToGlobal.elements, 8).negate().scale(0.0001);

    if (forwards) {
        physics.addForce(camera, vec);
    }
    if (backwards) {
        physics.addForce(camera, vec.negate());
    }

    vec.set(camera.localToGlobal.elements, 0).negate().scale(0.0001);

    if (left) {
        physics.addForce(camera, vec);
    }
    if (right) {
        physics.addForce(camera, vec.negate());
    }

    surface.rotationY += 0.1 * Math.PI / 180;

    light.x = camera.x;
    light.y = camera.y;
    light.z = camera.z;

    //

    physics.simulate(stage, delta);

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

    // var near = camera.unproject(new Vector3D([0, 0, 0])),
    //     far = camera.unproject(new Vector3D([0, 0, 1])),
    //     dir = far.subtract(near);

    // console.log(dir.x, dir.y, dir.z);
}
