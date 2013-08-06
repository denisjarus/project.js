function Renderer(context) {
    var gl = null,
        glVertexArrayObject = null,

        stage3D = null,

        lights = [],

        renderList = [],
        updateList = false;

    this.setContext = function(context) {
        if (context instanceof WebGLRenderingContext === false) {
            throw new TypeError();
        }
        gl = context;

        glVertexArrayObject = gl.getExtension('OES_vertex_array_object');

        gl.clearColor(0, 0, 0, 1);

        gl.enable(gl.DEPTH_TEST);

        // gl.enable(gl.CULL_FACE);
        // gl.cullFace(gl.BACK);
        // gl.frontFace(gl.CW);
    };

    this.setContext(context);

    this.draw = function(stage, camera, target) {
        if (stage instanceof Object3D === false) {
            throw new TypeError();
        }
        if (camera instanceof Camera3D === false) {
            throw new TypeError();
        }
        if (target && target instanceof Texture === false) {
            throw new TypeError();
        }
        if (stage.parent) {
            throw new Error();
        }
        if (!stage.contains(camera)) {
            throw new Error();
        }

        if (stage3D !== stage) {
            if (stage3D) {
                stage3D.removeEventListener(Event3D.ADDED, onAdd);
                stage3D.removeEventListener(Event3D.REMOVED, onRemove);
                stage3D.removeEventListener(Event3D.GEOMETRY_CHANGE, onChange);
                stage3D.removeEventListener(Event3D.MATERIAL_CHANGE, onChange);

                removeObject(stage3D);
            }
            stage3D = stage;
            stage3D.addEventListener(Event3D.ADDED, onAdd);
            stage3D.addEventListener(Event3D.REMOVED, onRemove);
            stage3D.addEventListener(Event3D.GEOMETRY_CHANGE, onChange);
            stage3D.addEventListener(Event3D.MATERIAL_CHANGE, onChange);

            addObject(stage3D);
        }
        if (updateList === true) {
            updateList = false;
            renderList.sort(sort);
        }

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // render objects

        var shader = null,
            geometry = null,
            material = null;

        for (var object, i = 0; object = renderList[i]; i++) {

            // stop rendering when the first unrenderable object reached

            if (!object.geometry || !object.material) {
                break;
            }

            material = object.material;

            if (shader !== material.shader) {
                shader = material.shader;
                geometry = null;

                var program = getProgram(shader);

                gl.useProgram(program);
            }

            if (geometry !== object.geometry) {
                geometry = object.geometry;

                glVertexArrayObject.bindVertexArrayOES(getVertexArray(object));

                if (true) {
                    var attributes = program.attributes;

                    for (var attribute, j = 0; attribute = attributes[j]; j++) {
                        var name = attribute.name,
                            size = getSize(attribute),
                            type = getType(attribute);

                        gl.enableVertexAttribArray(j);
                        gl.bindBuffer(gl.ARRAY_BUFFER, getVertexBuffer(geometry, name));
                        gl.vertexAttribPointer(j, size, type, false, geometry.getStride(name) * 4, geometry.getOffset(name) * 4);
                    }

                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, getIndexBuffer(geometry));
                }
            }

            shader.uniform(program.uniforms, object, camera, lights);

            // program.pass(object, camera, lights);

            gl.drawElements(gl.TRIANGLES, geometry.indices.length, gl.UNSIGNED_SHORT, 0);
        }

        gl.useProgram(null);

        glVertexArrayObject.bindVertexArrayOES(null);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    };

    function sort(a, b) {
        var order;

        // move meshes with no geometry and/or no material to the end of the list

        if (!(a.geometry && a.material)) {
            return 1;
        }
        if (!(b.geometry && b.material)) {
            return 0;
        }

        // group meshes by shader, geometry and material

        if ((order = a.material.shader.id - b.material.shader.id) !== 0) {
            return order;
        }
        if ((order = a.geometry.id - b.geometry.id) !== 0) {
            return order;
        }
        if ((order = a.material.id - b.material.id) !== 0) {
            return order;
        }
        
        return 0;
    }

    function getSize(attribute) {
        switch (attribute.type) {
            case gl.FLOAT_VEC2: return 2;
            case gl.FLOAT_VEC3: return 3;
            case gl.FLOAT_VEC4: return 4;
        }
    }

    function getType(attribute) {
        switch (attribute.type) {
            case gl.FLOAT_VEC2: return gl.FLOAT;
            case gl.FLOAT_VEC3: return gl.FLOAT;
            case gl.FLOAT_VEC4: return gl.FLOAT;
        }
    }

    // objects

    function onAdd(event) {
        addObject(event.target);
    }

    function addObject(object) {
        var list;
        if (object instanceof Mesh) {
            list = renderList;
            updateList = true;
        } else if (object instanceof Light3D) {
            list = lights;
        }
        if (list) {
            list.push(object);
        }
        for (var child, i = 0; child = object.getChildAt(i); i++) {
            addObject(child, true);
        }
    }

    function onRemove(event) {
        removeObject(event.target);
    }

    function removeObject(object) {
        var list;
        if (object instanceof Mesh) {
            list = renderList;
        } else if (object instanceof Light3D) {
            list = lights;
        }
        if (list) {
            list.splice(list.indexOf(object), 1);
        }
        for (var child, i = 0; child = object.getChildAt(i); i++) {
            removeObject(child, true);
        }
    }

    function onChange() {
        updateList = true;
    }

    // programs

    var programs = {};

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

            var attributes = new Array(gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES));

            for (var attribute, i = 0, len = attributes.length; i < len; i++) {
                attributes[i] = gl.getActiveAttrib(program, i);
            }

            program.attributes = attributes;

            var uniforms = {};

            for (var uniform, i = 0, len = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS); i < len; i++) {
                uniform = gl.getActiveUniform(program, i);

                Object.defineProperty(uniforms, uniform.name, createUniform(program, uniform));
            }

            program.uniforms = uniforms;

            // program.pass = shader.uniform(gl, program);
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

    function createUniform(program, uniform) {
        var location = gl.getUniformLocation(program, uniform.name),
            setter = null,
            getter = null;

        switch (uniform.type) {

            // vector types

            case gl.FLOAT:
                setter = function(value) {
                    gl.uniform1f(location, value);
                };
                break;

            case gl.FLOAT_VEC2:
                setter = function(value) {
                    gl.uniform2fv(location, value);
                };
                break;

            case gl.FLOAT_VEC3:
                setter = function(value) {
                    gl.uniform3fv(location, value);
                };
                break;

            case gl.FLOAT_VEC4:
                setter = function(value) {
                    gl.uniform4fv(location, value);
                };
                break;

            // matrix types

            case gl.FLOAT_MAT2:
                setter = function(matrix) {
                    gl.uniformMatrix2fv(location, false, matrix);
                };
                break;

            case gl.FLOAT_MAT3:
                setter = function(matrix) {
                    gl.uniformMatrix3fv(location, false, matrix);
                };
                break;

            case gl.FLOAT_MAT4:
                setter = function(matrix) {
                    gl.uniformMatrix4fv(location, false, matrix);
                };
                break;

            // sampler types

            case gl.SAMPLER_2D:
                setter = function(texture) {
                    gl.bindTexture(gl.TEXTURE_2D, getTexture2D(texture));
                    gl.activeTexture(gl.TEXTURE0);
                    gl.uniform1i(location, 0);
                };
                break;
        }

        return {
            set: setter
        }
    }

    // vertex arrays

    var vertexArrays = {};

    function getVertexArray(object) {
        var array = vertexArrays[object.id];
        if (array === undefined) {
            array = vertexArrays[object.id] = glVertexArrayObject.createVertexArrayOES();
        }

        return array;
    }

    // vertex buffers

    var vertexBuffers = {};

    function getVertexBuffer(geometry, attribute) {
        var buffers = vertexBuffers[geometry.id];
        if (buffers === undefined) {
            buffers = vertexBuffers[geometry.id] = {};

            geometry.addEventListener(DataEvent.VERTICES_CHANGE, onVerticesChange);
        }

        var cache = buffers[attribute];
        if (cache === undefined) {
            cache = buffers[attribute] = new Cache(gl.createBuffer());
        }

        if (cache.update) {

            gl.bindBuffer(gl.ARRAY_BUFFER, cache.object);

            if (cache.resize) {
                gl.bufferData(gl.ARRAY_BUFFER, geometry.getData(attribute), gl.STATIC_DRAW);
            } else {
                gl.bufferSubData(gl.ARRAY_BUFFER, 0, geometry.getData(attribute));
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, null);

            cache.update = cache.resize = false;
        }

        return cache.object;
    }

    function onVerticesChange(event) {
        var cache = vertexBuffers[event.target.id][event.attribute];
        if (cache) {
            cache.update = true;
            cache.resize = event.resize;
        }
    }

    // index buffers

    var indexBuffers = {};

    function getIndexBuffer(geometry) {
        var cache = indexBuffers[geometry.id];
        if (cache === undefined) {
            cache = indexBuffers[geometry.id] = new Cache(gl.createBuffer());

            geometry.addEventListener(DataEvent.INDICES_CHANGE, onIndicesChange);
        }

        if (cache.update) {

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cache.object);

            if (cache.resize) {
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW);
            } else {
                gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, geometry.indices);
            }

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

            cache.update = cache.resize = false;
        }

        return cache.object;
    }

    function onIndicesChange(event) {
        var cache = indexBuffers[event.target.id];
        cache.update = true;
        cache.resize = event.resize;
    }

    // textures

    var textures = {};

    function getTexture2D(texture) {
        var cache = textures[texture.id];
        if (cache === undefined) {
            cache = textures[texture.id] = new Cache(gl.createTexture());

            texture.addEventListener(DataEvent.TEXTURE_CHANGE, onTextureChange);
        }

        if (cache.update) {

            gl.bindTexture(gl.TEXTURE_2D, cache.object);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

            if (cache.resize) {
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.getData());
            } else {
                gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, texture.getData());
            }

            gl.generateMipmap(gl.TEXTURE_2D);

            gl.bindTexture(gl.TEXTURE_2D, null);

            cache.update = cache.resize = false;
        }

        return cache.object;
    }

    function getTextureCube(texture) {

    }

    function onTextureChange(event) {
        var cache = textures[event.target.id];
        cache.update = true;
        cache.resize = event.resize;
    }

    // cache constructor

    function Cache(object) {
        Object.defineProperties(this, {
            object: { value: object },
            update: { value: true, writable: true },
            resize: { value: true, writable: true }
        });
    }
}