var gl,
	stage;

function init() {
	try {
		gl = document.getElementById('canvas').getContext('experimental-webgl');

		gl.enable(gl.DEPTH_TEST);
		gl.clearColor(0, 0, 0, 1);

		stage = new Object3D();
		
	} catch (error) {
		console.error(error.message);
	}
	if (! gl) {
		alert('WebGL context is not available');
	}
}

function enterFrame() {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	window.webkitRequestAnimationFrame(enterFrame);
}

function resize() {
	if (gl) {
		gl.canvas.width = gl.canvas.clientWidth;
		gl.canvas.height = gl.canvas.clientHeight;
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	}
}