var context,
	renderer,
	stage,
	light,
	camera;

var objects,
	program,
	aPosition, aObjectId, uMatrix, uCamera, uColor, uLight, uAmbient,
	indices, indexData,
	vertices, vertexData,
	ids, idData,
	matrix;

window.onload = function() {
	if (! (context = document.getElementById('canvas').getContext('experimental-webgl'))) {
		console.warn('webgl is not available');
	}

	renderer = new Renderer(context);
	
	stage = new Object3D();

	light = new Light3D();

	camera = stage.addChild(new Camera3D());
	camera.z = 500;

	context.getExtension('OES_element_index_uint');
	context.getExtension('OES_texture_float');

	//test stuff

	program = context.createProgram();

	var shader;

	shader = context.createShader(context.VERTEX_SHADER);
	context.shaderSource(shader, VERTEX_SHADER_CODE);
	context.compileShader(shader);
	context.attachShader(program, shader);

	shader = context.createShader(context.FRAGMENT_SHADER);
	context.shaderSource(shader, FRAGMENT_SHADER_CODE);
	context.compileShader(shader);
	context.attachShader(program, shader);

	context.linkProgram(program);
	context.useProgram(program);

	aPosition = context.getAttribLocation(program, 'a_position');
	aObjectId = context.getAttribLocation(program, 'a_objectid');
	context.enableVertexAttribArray(aPosition);
	context.enableVertexAttribArray(aObjectId);

	uMatrix = context.getUniformLocation(program, 'u_matrix');
	uCamera = context.getUniformLocation(program, 'u_camera');

	uColor = context.getUniformLocation(program, 'u_color');
	uLight = context.getUniformLocation(program, 'u_light');
	uAmbient = context.getUniformLocation(program, 'u_ambient');

	context.uniform3f(uLight, 0.0, 1.0, 0.0);
	context.uniform4f(uAmbient, 0.2, 0.2, 0.2, 1.0);

	//creation
	var segments = 50,
		radius = 5;

	//vertices
	var sphereVertices = [];

	for (var i = 0; i <= segments; i++) {
		var phi = i * Math.PI / segments,
			sinPhi = Math.sin(phi),
			cosPhi = Math.cos(phi);

		for (var j = 0; j <= segments; j++) {
			var lambda = j * Math.PI * 2 / segments;
			sphereVertices.push(
				radius * Math.cos(lambda) * sinPhi,
				radius * cosPhi,
				radius * Math.sin(lambda) * sinPhi
				);
		}
	}

	vertexData = [];

	//indices
	var sphereIndices = [];

	for (i = 0; i < segments; i++) {
		for (j = 0; j < segments; j++) {
			var a = i * (segments + 1) + j,
				b = a + segments + 1;
			sphereIndices.push(
				a, b, a + 1,
				b, b + 1, a + 1
				);
		}
	}

	indexData = [];

	//objects
	var numObjects = 1000,
		distance = 10;

	objects = [new Mesh()];

	idData = [];

	for (i = 0; i < numObjects; ++i) {
		var object = objects[i].addChild(new Mesh());
		object.x = Math.random() * distance - distance;
		object.y = Math.random() * distance - distance;
		object.z = Math.random() * distance - distance;
		object.rotationX = Math.random() * 360;
		object.rotationY = Math.random() * 360;
		object.rotationZ = Math.random() * 360;
		objects.push(object);

		//buffer data
		for (j = 0; j < sphereVertices.length; j++) {
			vertexData.push(sphereVertices[j]);
			idData.push(i);
		}
		for (j = 0; j < sphereIndices.length; j++) {
			indexData.push(sphereIndices[j] + (sphereVertices.length / 3) * i);
		}
	}

	console.log(sphereVertices.length, vertexData.length);
	console.log(sphereIndices.length, indexData.length);

	//buffers
	vertices = context.createBuffer();
	context.bindBuffer(context.ARRAY_BUFFER, vertices);
	context.bufferData(context.ARRAY_BUFFER, new Float32Array(vertexData), context.STATIC_DRAW);
	context.vertexAttribPointer(aPosition, 3, context.FLOAT, false, 0, 0);

	id = context.createBuffer();
	context.bindBuffer(context.ARRAY_BUFFER, id);
	context.bufferData(context.ARRAY_BUFFER, new Float32Array(idData), context.STATIC_DRAW);
	context.vertexAttribPointer(aObjectId, 1, context.FLOAT, false, 0, 0);

	indices = context.createBuffer();
	context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, indices);
	context.bufferData(context.ELEMENT_ARRAY_BUFFER, new Uint32Array(indexData), context.STATIC_DRAW);

	console.log('vertices:', (vertexData.length / 3));

	window.onresize();
	window.webkitRequestAnimationFrame(enterFrame);
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
	renderer.draw(stage, camera);
	//test stuff
	var matrices = [];

	for (var i = 0, numObjects = objects.length; i < numObjects; i++) {
		var object = objects[i];

		object.rotationY += 0.1;
		matrix = object.localToGlobal.elements;
		for (var j = 0; j < matrix.length; j++) {
			matrices.push(matrix[j]);
		}
	}
	context.uniformMatrix4fv(uMatrix, false, new Float32Array(matrices));

	matrix = camera.globalToLocal.clone();
	matrix.append(camera.projection);
	context.uniformMatrix4fv(uCamera, false, matrix.elements);

	context.uniform4f(uColor, 1.0, 0.0, 0.0, 1.0);

	context.drawElements(context.TRIANGLES, indexData.length, context.UNSIGNED_INT, 0);

	window.webkitRequestAnimationFrame(enterFrame);
}

const VERTEX_SHADER_CODE = [
	'attribute vec3 a_position;',
	'attribute float a_objectid;',

	'uniform mat4 u_camera;',
	'uniform vec3 u_light;',

	'uniform mat4 u_matrix[50];',

	'varying float v_diffuse;',

	'mat4 getMatrix(float i) {',
		'return u_matrix[int(i)];',
	'}',

	'void main(void) {',

		'vec3 normal = normalize(mat3(getMatrix(a_objectid)) * a_position);',
		'v_diffuse = max(dot(normal, u_light), 0.0);',

		'gl_Position = u_camera * getMatrix(a_objectid) * vec4(a_position, 1.0);',

	'}'
].join('\n');

const FRAGMENT_SHADER_CODE = [
	'precision mediump float;',

	'uniform vec4 u_color;',
	'uniform vec4 u_ambient;',

	'varying float v_diffuse;',

	'void main(void) {',

		'gl_FragColor = u_color * (vec4(v_diffuse) + u_ambient);',

	'}'
].join('\n');