var context,
    renderer,
    stage,
    camera,
    surface;

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

    // surface

    surface = stage.addChild(new Mesh());
    surface.geometry = new SurfaceGeometry(35, 5);

    surface.geometry.set(
        function(s, t) { return (150 + t * Math.cos(s / 2)) * Math.cos(s); },
        function(s, t) { return (150 + t * Math.cos(s / 2)) * Math.sin(s); },
        function(s, t) { return t * Math.sin(s / 2); },
        -Math.PI, Math.PI,
        -50, 50
    );

    /*
    //CYLINDER

    surface.geometry.set(
        function(y, r) { return 100 * Math.cos(r); },
        function(y, r) { return y; },
        function(y, r) { return 100 * Math.sin(r); },
        100, -100,
        0, 2 * Math.PI
    );

    */

    /*
    //SPHERE

    surface.geometry.set(
        function(u, v) { return 200 * Math.sin(u) * Math.cos(v); },
        function(u, v) { return 200 * Math.cos(u); },
        function(u, v) { return 200 * Math.sin(u) * Math.sin(v); },
        Math.PI / 4, Math.PI * 3/4,
        0, 2 * Math.PI
    );
    */

    /*
    //PLANE

    surface.geometry.set(
        function(x, y) { return x; },
        function() { return 0; },
        function(x, y) { return y; },
        -100, 100,
        100, -100
    );

    */
    surface.material = new Material();
    surface.material.texture = new Texture();
    
    var image = new Image();
    image.src = 'test.bmp';
    image.onload = function() {
        surface.material.texture.setData(image);
    }

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
    surface.rotationY += 0.2;

    renderer.draw(stage, camera);

    window.requestAnimationFrame(enterFrame);
}
