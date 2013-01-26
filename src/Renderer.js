function Renderer(context) {
	var gl,

		stage3D,
		stageObjectsAdded,
		stageObjectsRemoved,

		renderObjects,
		numAttributes,

		vertexAttribs,
		vertexBuffers,
		vertexFormats,
		vertexOffsets,
		vertexIndices,

		textures,

		programs,
		uniforms;

	//api
	Object.defineProperties(this, {
		context: {
			get: function() {
				return gl;
			},
			set: function(context) {
				if (context instanceof WebGLRenderingContext == false) {
					throw new Error();
				}
				if (gl != context) {
					gl = context;
				}
				gl.clearColor(0, 0, 0, 1);
				gl.enable(gl.DEPTH_TEST);
				gl.enable(gl.CULL_FACE);
				gl.frontFace(gl.CW);
			}
		},
		draw: {
			value: draw
		}
	});

	this.context = context;

	function draw(stage, camera) {
		if (stage instanceof Object3D == false || camera instanceof Camera3D == false) {
			throw new Error();
		}

		var i, length;

		if (stage3D != stage) {
			if (stage3D) {
				stage3D.removeEventListener(Event3D.ADDED, added);
				stage3D.removeEventListener(Event3D.REMOVED, removed);
			}
			stage3D = stage;
			stage3D.addEventListener(Event3D.ADDED, added)
			stage3D.addEventListener(Event3D.REMOVED, removed);
			
			renderObjects = [];
			numAttributes = [];
			vertexAttribs = [];
			vertexBuffers = [];
			vertexFormats = [];
			vertexOffsets = [];
			vertexIndices = [];
			textures = [];
			programs = [];
			uniforms = [];

			addObject(stage);
		} else {
			for (i = 0, length = stageObjectsRemoved.length; i < length; i++) {
				removeObject(stageObjectsRemoved[i]);
			}
			for (i = 0, length = stageObjectsAdded.length; i < length; i++) {
				addObject(stageObjectsAdded[i]);
			}
		}

		stageObjectsAdded = [];
		stageObjectsRemoved = [];

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			
		for (i = 0, length = renderObjects.length; i < length; i++) {
			var object = renderObjects[i];
		}
	}

	function added(event) {
		if (event.target != stage3D) {
			var index = stageObjectsRemoved.indexOf(event.target);
			if (index < 0) {
				stageObjectsAdded.push(event.target);
			} else {
				stageObjectsRemoved.splice(index, 1);
			}
		}
	}

	function removed(event) {
		if (event.target != stage3D) {
			var index = stageObjectsAdded.indexOf(event.target);
			if (index < 0) {
				stageObjectsRemoved.push(event.target);
			} else {
				stageObjectsAdded.splice(index, 1);
			}
		}
	}

	function addObject(object) {
		//recursively add object's descendants
		for (var i = 0, length = object.numChildren; i < length; i++) {
			addObject(object.getChildAt(i));
		}
	}

	function removeObject(object) {
		//recursuvely remove object's descendants
		for (var i = 0, length = object.numChildren; i < length; i++) {
			removeObject(object.getChildAt(i));
		}
	}
}