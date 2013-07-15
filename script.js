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
    surface.y = -50;
    surface.geometry = new SurfaceGeometry(
        function(x, y) { return x; },
        function() { return 0; },
        function(x, y) { return y; },
        [-100, 100],
        [-100, 100]
    );
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