function Renderer(context) {
	var gl = null,

		stage3D = null,

		lights = [],

		renderList = [];

	this.setContext = function(context) {
		if (context instanceof WebGLRenderingContext === false) {
			throw new Error();
		}
		gl = context;

		gl.clearColor(0, 0, 0, 1);

		gl.enable(gl.DEPTH_TEST);

		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);
		gl.frontFace(gl.CW);
	}

	this.setContext(context);

	this.draw = function(stage, camera) {
		if (stage instanceof Object3D === false || camera instanceof Camera3D === false) {
			throw new Error();
		}
		if (stage.parent) {
			throw new Error();
		}
		if (stage3D !== stage) {
			if (stage3D) {
				stage3D.removeEventListener(Event3D.ADDED, onAdd);
				stage3D.removeEventListener(Event3D.REMOVED, onRemove);
				stage3D.removeEventListener(Event3D.GEOMETRY_CHANGE, onChange);
				stage3D.removeEventListener(Event3D.MATERIAL_CHANGE, onChange);

				removeObject(stage3D, true);
			}
			stage3D = stage;
			stage3D.addEventListener(Event3D.ADDED, onAdd);
			stage3D.addEventListener(Event3D.REMOVED, onRemove);
			stage3D.addEventListener(Event3D.GEOMETRY_CHANGE, onChange);
			stage3D.addEventListener(Event3D.MATERIAL_CHANGE, onChange);

			addObject(stage3D, true);
		}

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		//render objects

		var viewMatrix = camera.globalToLocal,
			projectionMatrix = camera.projection,
			modelViewMatrix = new Matrix3D(),

			currentShader = null,
			currentGeometry = null,
			currentMaterial = null,

			attributes = [],
			uniforms = [];

		for (var i = 0, len = renderList.length; i < len; i++) {
			var object = renderList[i];

			//set program
			if (currentShader !== object.material.shader) {
				currentShader = object.material.shader;

				var program = getProgram(currentShader);

				gl.useProgram(program);

				var numAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
				attributes.length = numAttributes;

				var numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
				uniforms.length = numUniforms;

				for (var a = 0; a < numAttributes; a++) {
					var attribute = gl.getActiveAttrib(program, a);
					attributes[a] = new Attribute(attribute.name, getSize(attribute.type), getType(attribute.type));
				}
				for (var u = 0; u < numUniforms; u++) {
					//var uniform = gl.getActiveUniform(program, u);
					//uniforms[u] = new Uniform()
					uniforms[u] = gl.getActiveUniform(program, u);
				}
			}

			gl.enableVertexAttribArray(0);

			//set buffers
			if (currentGeometry !== object.geometry) {
				currentGeometry = object.geometry;

				setVertexBuffers(currentGeometry, attributes);

				if (currentGeometry.indices) {
					setIndexBuffer(currentGeometry);
				}
			}

			//set properties and textures
			if (currentMaterial !== object.material) {
				currentMaterial = object.material;
			}

			//set uniforms
			modelViewMatrix.copyFrom(object.localToGlobal).append(viewMatrix);
			gl.uniformMatrix4fv(gl.getUniformLocation(program, 'modelView'), false, modelViewMatrix.elements);
			gl.uniformMatrix4fv(gl.getUniformLocation(program, 'projection'), false, projectionMatrix.elements);

			//draw
			gl.drawElements(gl.TRIANGLES, currentGeometry.indices.length, gl.UNSIGNED_SHORT, 0);
		}
		gl.useProgram(null);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
		
		console.log(renderList.length, uniforms);
	}

	function getSize(type) {
		switch (type) {
			case gl.FLOAT_VEC2: return 2;
			case gl.FLOAT_VEC3: return 3;
			case gl.FLOAT_VEC4: return 4;
		}
	}

	function getType(type) {
		switch (type) {
			case gl.FLOAT_VEC2: return gl.FLOAT;
			case gl.FLOAT_VEC3: return gl.FLOAT;
			case gl.FLOAT_VEC4: return gl.FLOAT;
		}
	}

	//objects

	function onAdd(event) {
		addObject(event.target, true);
	}

	function addObject(object, recursive) {
		if (object instanceof Mesh) {
			renderList.push(object);
		}
		if (recursive) {
			for (var i = 0, len = object.numChildren; i < len; i++) {
				addObject(object.getChildAt(i), true);
			}
		}
	}

	function onRemove(event) {
		removeObject(event.target, true);
	}

	function removeObject(object, recursive) {
		if (object instanceof Mesh) {
			renderList.splice(renderList.indexOf(object), 1);
		}
		if (recursive) {
			for (var i = 0, len = object.numChildren; i < len; i++) {
				removeObject(object.getChildAt(i), true);
			}
		}
	}

	function onChange(event) {
		removeObject(event.target, false);
		addObject(event.target, false);
	}

	//programs

	var programs = [];

	function getProgram(shader) {
		var program = programs[shader.id];

		if (program === undefined) {
			program = programs[shader.id] = gl.createProgram();

			gl.attachShader(program, createShader(gl.VERTEX_SHADER, shader.vertex));
			gl.attachShader(program, createShader(gl.FRAGMENT_SHADER, shader.fragment));

			gl.linkProgram(program);

			if (gl.getProgramParameter(program, gl.LINK_STATUS) === false) {
				throw new Error(gl.getError());
			}
		}
		return program;
	}

	function createShader(type, code) {
		var shader = gl.createShader(type);

		gl.shaderSource(shader, code);
		gl.compileShader(shader);

		if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) === false) {
			throw new Error(gl.getShaderInfoLog(shader));
		}
		return shader;
	}

	//vertices

	var vertexBuffers = [];

	function setVertexBuffers(geometry, attributes) {
		var buffers = vertexBuffers[geometry.id];

		if (buffers === undefined) {
			buffers = vertexBuffers[geometry.id] = {};

			geometry.addEventListener(GeometryEvent.VERTICES_CHANGE, onVerticesChange);
		}
		for (var i = 0, len = attributes.length; i < len; i++) {
			var attrib = attributes[i],
				buffer = buffers[attrib.name];

			if (buffer === undefined) {
				buffer = buffers[attrib.name] = new Buffer(gl.createBuffer());
			}

			gl.bindBuffer(gl.ARRAY_BUFFER, buffer.object);
			gl.vertexAttribPointer(i, attrib.size, attrib.type, false, 0, 0);

			if (buffer.update) {
				buffer.update = false;

				var data =  geometry.getData(attrib.name);

				if (buffer.length !== data.length) {
					buffer.length = data.length;
					gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
				} else {
					gl.bufferSubData(gl.ARRAY_BUFFER, 0, data);
				}
			}
		}
	}

	function onVerticesChange(event) {
		var buffers = vertexBuffers[event.target.id];
		if (buffers !== undefined) {
			var buffer = buffers[event.attribute];
			if (buffer !== undefined) {
				buffer.update = true;
			}
		}
	}

	//indices

	var indexBuffers = [];

	function setIndexBuffer(geometry) {
		var buffer = indexBuffers[geometry.id];

		if (buffer === undefined) {
			buffer = indexBuffers[geometry.id] = new Buffer(gl.createBuffer());

			geometry.addEventListener(GeometryEvent.INDICES_CHANGE, onIndicesChange);
		}

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.object);

		if (buffer.update) {
			buffer.update = false;

			var data = new Uint16Array(geometry.indices);

			if (buffer.length !== data.length) {
				buffer.length = data.length;
				gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
			} else {
				gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, data);
			}
		}
	}

	function onIndicesChange(event) {
		var buffer = indexBuffers[event.target.id];
		if (buffer !== undefined) {
			buffer.update = true;
		}
	}

	//textures

	var textures = [];

	function setTexture2D(index, texture) {
		var texture2D = textures[texture.id];
		
		if (texture2D === undefined) {
			texture2D = textures[texture.id] = new Texture2D(gl.createTexture());

			texture.addEventListener('some', onTextureChange);
		}

		gl.activeTexture(gl.TEXTURE0 + index);
		gl.bindTexture(gl.TEXTURE_2D, texture2D);

		if (texture2D.update) {
			texture2D.update = false;

			var data = texture.getData(Texture.TEXTURE_2D);

			if (true) {
				texture2D.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_INT, data);
			}
		}
	}

	function setTextureCube(index, texture) {

	}

	function onTextureChange(event) {
		var texture = textures[event.target.id];
		if (texture !== undefined) {
			texture.update = true;
			if (texture instanceof TextureCube) {
				return;
			}
		}
	}

	//internal data structures

	function Buffer(buffer) {
		Object.defineProperties(this, {
			object: { value: buffer },
			update: { value: true, writable: true },
			length: { value: 0, writable: true }
		});
	}

	function Texture2D(texture) {
		Object.defineProperties(this, {
			object: { value: texture },
			update: { value: true, writable: true },
			sizeX: { value: 0, writable: true },
			sizeY: { value: 0, writable: true }
		})
	}

	function TextureCube(texture) {
		Object.defineProperties(this, {
			object: { value: texture },
			update: { value: true, writable: true },

			updatePositiveX: { value: true, writable: true },
			updateNegativeX: { value: true, writable: true },

			updatePositiveY: { value: true, writable: true },
			updateNegativeY: { value: true, writable: true },

			updatePositiveZ: { value: true, writable: true },
			updateNegativeZ: { value: true, writable: true }
		});
	}

	function Attribute(name, size, type) {
		Object.defineProperties(this, {
			name: { value: name },
			size: { value: size },
			type: { value: type }
		});
	}

	function Uniform() {
		Object.defineProperties(this, {
			location: {}
		});
	}
}