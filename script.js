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

    var loader = new Loader();
    loader.load('stage.json');
    
    stage = new Object3D();

    // physicsal camera

    camera = stage.addChild(new Camera3D());
    
    // camera.collider = new BoxCollider(new Vector3D([0, 0, 0]), new Vector3D([5, 5, 5]));
    camera.collider = new SphereCollider(null, 5);
    camera.collider.mass = 1;

    camera.addChild(new Light3D());

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

    ground.material = new Material();
    ground.material.shader = Shader.gouraudShader;
    ground.material.setProperty('diffuseMap', new Texture());

    var img = new Image();
    img.src = 'diffuseMap.bmp';
    img.onload = function() {
        ground.material.getProperty('diffuseMap').setData(0, img);
        requestAnimationFrame(enterFrame);
    };

    // sphere

    var sphere = stage.addChild(new Mesh());
    sphere.geometry = new SurfaceGeometry();
    sphere.geometry.parametrize(
        Geometry.POSITION,
        function(s, t) {
            return [
                5 * Math.sin(s) * Math.cos(t),
                5 * Math.cos(s),
                5 * Math.sin(s) * Math.sin(t)
            ];
        },
        0, Math.PI,
        0, Math.PI * 2
    );

    sphere.material = new Material();
    sphere.material.shader = Shader.depthShader;

    sphere.y = -20;
    sphere.z = -20;

    sphere.collider = new SphereCollider(null, 5);

    // second instance of ground

    var instance = stage.addChild(new Mesh(ground.geometry, ground.material));
    instance.scaleX = instance.scaleY = instance.scaleZ = 0.1;
    instance.y = -50;
    instance.collider = new BoxCollider(new Vector3D([0, -5, 0]), new Vector3D([50, 5, 50]));
    instance.collider.mass = 0;
    // instance.rotationY = Math.PI / 4;

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
        function() { physics.addForce(camera, new Vector3D([0, 100, 0])); }
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

    boxOne = new BoxCollider(new Vector3D([-20, -10, -20]), new Vector3D([20, 10, 20])),
    boxTwo = new BoxCollider(new Vector3D([0, -10, 0]), new Vector3D([40, 10, 40]));

    console.log(getSupport(boxOne, boxTwo, new Vector3D([-1, 0, 1])));
    console.log('test:', test(boxOne, boxTwo));

    // var vec1 = new Vector3D([10, 0, 0]),
    //     vec2 = new Vector3D([5, 5, 0]),
    //     vec3 = new Vector3D();

    // console.log('vec:', vec3.copyFrom(vec1).scale(vec1.dot(vec2) / vec1.lengthSquared));
};

var ap = new Vector3D(),
    bp = new Vector3D(),
    cp = new Vector3D(),

    ab = new Vector3D(),
    ac = new Vector3D(),
    ad = new Vector3D(),

    origin = new Vector3D(),
    normal = new Vector3D(),

    e = 0.00001;

function test(a, b) {
    var d = new Vector3D(),
        simplex = [
            getSupport(a, b, d.set([1, 0, 0])),
            getSupport(a, b, d.set([0, 1, 0])),
            getSupport(a, b, d.set([0, 0, 1])),
            getSupport(a, b, d.set([0, -1, 0])),
        ];

    console.log('initial', simplex);

    d.set([5, -7, 0]);

    // barycentric(
    //     new Vector3D([0, 0, 0]),
    //     new Vector3D([10, 0, 0]),
    //     new Vector3D([0, 10, 0]),
    //     new Vector3D([0, 0, 10]),
    //     d
    // );
    // console.log('barycentric', d);
    // console.log('lambda 4', 1 - d.x - d.y - d.z);

    // try {
        for (var i = 0; i < 1; i++) {
            updateSimplex(simplex);
            // closestToLine(simplex[0], simplex[2], d);
            // console.log(d);
        }
    // } catch (error) {
    //     console.log(error);
    // }

    return null;
}

function getSupport(a, b, direction) {
    var point1 = a.getSupport(direction),
        point2 = b.getSupport(direction.clone().negate());

    return point1.sub(point2);
}

function closestToLine(a, b, point) {
    var ab = new Vector3D(),
        ao = new Vector3D();

    ab.copyFrom(b).sub(a);
    ao.copyFrom(a).negate();
    point.copyFrom(ab).scale(ab.dot(ao) / ab.lengthSquared).add(a);
}

console.log('point outside', pointOutsideOfPlane(
    new Vector3D([0, 0, 0]),
    new Vector3D([5, 0, -10]),
    new Vector3D([0, 5, -10]),
    new Vector3D([5, 5, -10]),
    new Vector3D([0, 0, -20])
));

function pointOutsideOfPlane(p, a, b, c, d) {
    ap.copyFrom(p).sub(a);
    ab.copyFrom(b).sub(a);
    ac.copyFrom(c).sub(a);
    ad.copyFrom(d).sub(a);
    normal.copyFrom(ab).cross(ac);
    if (normal.dot(ad) < 0) {
        return ap.dot(normal) > -e;
    } else {
        return ap.dot(normal) < -e;
    }
}

function closestPointInTriangle(p, a, b, c, result) {

    // vertex A

    ap.copyFrom(p).sub(a);
    ab.copyFrom(b).sub(a);
    ac.copyFrom(c).sub(a);

    var d1 = ab.dot(ap),
        d2 = ac.dot(ap);

    if (d1 <= 0 && d2 <= 0) {
        console.log('point is a:', a);
        return result.copyFrom(a);
    }

    // vertex B

    bp.copyFrom(p).sub(b);

    var d3 = ab.dot(bp),
        d4 = ac.dot(bp);

    if (d3 >= 0 && d3 >= d4) {
        console.log('point is b:', b);
        return result.copyFrom(b);
    }

    // edge AB

    var vc = d1 * d4 - d3 * d2;

    if (vc <= 0 && d1 >= 0 && d3 <= 0) {
        console.log('point in on ab:', a, b);
        return result.copyFrom(ab).scale(d1 / (d1 - d3)).add(a);
    }

    // vertex C

    cp.copyFrom(p).sub(c);

    var d5 = ab.dot(cp),
        d6 = ac.dot(cp);

    if (d6 >= 0 && d5 >= d6) {
        console.log('point is c:', c);
        return result.copyFrom(c);
    }

    // edge AC

    var vb = d5 * d2 - d1 * d6;

    if (vb <= 0 && d2 >= 0 && d6 <= 0) {
        console.log('point in on ac:', a, c);
        return result.copyFrom(ac).scale(d2 / (d2 - d6)).add(a);
    }

    // edge BC

    var va = d3 * d6 - d5 * d4;

    if (va <= 0 && d4 >= d3 && d5 >= d6) {
        console.log('point in on bc:', b, c);
        bc.copyFrom(c).sub(b);
        return result.copyFrom(bc).scale((d4 - d3) / ((d4 - d3) + (d5 - d6))).add(b);
    }

    // face ABC

    var denom = 1 / (va + vb + vc);

    console.log('point is in abc:', a, b, c);
    return result.copyFrom(a).add(ab.scale(vb * denom)).add(ac.scale(vc * denom));
}

function updateSimplex(simplex) {
    var a = simplex[0],
        b = simplex[1],
        c = simplex[2],
        d = simplex[3],

        planeABC = pointOutsideOfPlane(origin, a, b, c, d),
        planeBCD = pointOutsideOfPlane(origin, b, c, d, a),
        planeCDA = pointOutsideOfPlane(origin, c, d, a, b),
        planeDAB = pointOutsideOfPlane(origin, d, a, b, c),

        tempDistance = 0,
        bestDistance = Number.MAX_VALUE,
        tempResult = new Vector3D(),
        bestResult = new Vector3D();

    if (!planeABC && !planeBCD && !planeCDA && !planeDAB) {
        return true;
    }

    if (planeABC) {
        closestPointInTriangle(origin, a, b, c, tempResult);
        tempDistance = tempResult.distanceSquared(origin);

        if (bestDistance > tempDistance) {
            bestDistance = tempDistance;
            bestResult = tempResult;
        }
    }

    if (planeBCD) {
        closestPointInTriangle(origin, b, c, d, tempResult);
        tempDistance = tempResult.distanceSquared(origin);
        
        if (bestDistance > tempDistance) {
            bestDistance = tempDistance;
            bestResult = tempResult;
        }
    }

    if (planeCDA) {
        closestPointInTriangle(origin, c, d, a, tempResult);
        tempDistance = tempResult.distanceSquared(origin);
        
        if (bestDistance > tempDistance) {
            bestDistance = tempDistance;
            bestResult = tempResult;
        }
    }

    if (planeDAB) {
        closestPointInTriangle(origin, d, a, b, tempResult);
        tempDistance = tempResult.distanceSquared(origin);
        
        if (bestDistance > tempDistance) {
            bestDistance = tempDistance;
            bestResult = tempResult;
        }
    }

    console.log('::iteration::', bestResult);
    // console.log('abc', planeABC);
    // console.log('bcd', planeBCD);
    // console.log('cda', planeCDA);
    // console.log('dab', planeDAB);
}

function updateSimplex2(simplex) {
    var a = simplex[0],
        b = simplex[1],
        c = simplex[2],
        d = simplex[3],

        point = barycentric(a, b, c, d, new Vector3D()),

        ba = point.x,
        bb = point.y,
        bc = point.z,
        bd = 1 - ba - bb - bc;

    console.log('point', ba, bb, bc, bd);

    if (ba > 0 && bb > 0 && bc > 0 && bd > 0) {
        console.log('origin is inside');
    }

    // check vertices

    if (ba <= 0 && bb >= 1 && bc >= 1 && bd >= 1) {
        console.log('vertex a');
        return;
    }

    if (bb <= 0 && ba >= 1 && bc >= 1 && bd >= 1) {
        console.log('vertex b');
        return;
    }

    if (bc <= 0 && ba >= 1 && bb >= 1 && bd >= 1) {
        console.log('vertex c');
        return;
    }

    if (bd <= 0 && ba >= 1 && bb >= 1 && bc >= 1) {
        console.log('vertex d');
        return;
    }

    // check faces
}

function barycentric(a, b, c, d, point) {
    var mat = new Matrix3D(),
        vec = new Vector3D();

    vec.copyFrom(a).sub(d);
    mat.elements.set(vec.elements, 0);

    vec.copyFrom(b).sub(d);
    mat.elements.set(vec.elements, 4);

    vec.copyFrom(c).sub(d);
    mat.elements.set(vec.elements, 8);

    mat.invert();

    point.sub(d).transform(mat);

    return point;
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

    console.log(camera.y);

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
