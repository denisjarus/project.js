function Renderer(context) {
	var gl,

		stage3D,
		stageObjectsAdded,
		stageObjectsRemoved,
		stageObjectsChanged,

		renderables,

		maxUniforms;

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
				gl = context;
				gl.clearColor(0, 0, 0, 1);
				gl.enable(gl.DEPTH_TEST);
				gl.enable(gl.CULL_FACE);
				gl.frontFace(gl.CW);

				maxUniforms = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
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
		if (stage.parent) {
			throw new Error();
		}

		var i, j, length, object;

		if (stage3D != stage) {
			if (stage3D) {
				stage3D.removeEventListener(Event3D.ADDED, onAdded);
				stage3D.removeEventListener(Event3D.REMOVED, onRemoved);
				stageObjectsRemoved = [stage3D];
			} else {
				stageObjectsRemoved = [];
			}
			stage3D = stage;
			stage3D.addEventListener(Event3D.ADDED, onAdded)
			stage3D.addEventListener(Event3D.REMOVED, onRemoved);
			stageObjectsAdded = [stage3D];

			renderables = [];
		}
		//remove objects
		for (i = 0; i < stageObjectsRemoved.length; i++) {
			object = removeObject(stageObjectsRemoved[i]);
			for (j = 0, length = object.numChildren; j < length; j++) {
				stageObjectsRemoved.push(object.getChildAt(j));
			}
		}
		stageObjectsRemoved.length = 0;

		//add objects
		for (i = 0; i < stageObjectsAdded.length; i++) {
			object = addObject(stageObjectsAdded[i]);
			for (j = 0, length = object.numChildren; j < length; j++) {
				stageObjectsAdded.push(object.getChildAt(j));
			}
		}
		stageObjectsAdded.length = 0;

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			
		for (i = 0, length = renderables.length; i < length; i++) {
			object = renderables[i];
		}
	}

	function onAdded(event) {
		var index = stageObjectsRemoved.indexOf(event.target);
		if (index < 0) {
			stageObjectsAdded.push(event.target);
		} else {
			stageObjectsRemoved.splice(index, 0);
		}
	}

	function onRemoved(event) {
		var index = stageObjectsAdded.indexOf(event.target);
		if (index < 0) {
			stageObjectsRemoved.push(event.target);
		} else {
			stageObjectsAdded.splice(index, 0);
		}
	}

	function addObject(object) {
		var renderable;
		if (object instanceof Mesh && object.geometry && object.material) {
			renderable = new Renderable(object);
			//renderables.push(renderable);
		}
		renderables.push(object);
		return object;
	}

	function removeObject(object) {
		if (object instanceof Mesh && object.geometry) {
			
		}
		return object;
	}
}