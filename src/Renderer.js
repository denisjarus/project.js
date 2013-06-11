function Renderer(context) {
    var gl = null,
        glVertexArrayObject = null,

        stage3D = null,

        lights = [],

        renderList = [],
        updateList = false;

    this.setContext = function(context) {
        if (context instanceof WebGLRenderingContext === false) {
            throw new Error();
        }
        gl = context;

        glVertexArrayObject = gl.getExtension('OES_vertex_array_object');

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

        //render objects

        var viewMatrix = camera.globalToLocal,
            projectionMatrix = camera.projection,
            modelViewMatrix = new Matrix3D(),

            shader = null,
            geometry = null,
            material = null,

            attributes = [],
            uniforms = [];

        for (var i = 0, len = renderList.length; i < len; i++) {
            var object = renderList[i];

            //set program
            if (shader !== object.material.shader) {
                shader = object.material.shader;
                geometry = null;
                material = null;

                var program = getProgram(shader);

                gl.useProgram(program);

                attributes.length = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
                uniforms.length = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

                for (var a = 0; a < attributes.length; a++) {
                    attributes[a] = gl.getActiveAttrib(program, a);
                }
                for (var u = 0; u < uniforms.length; u++) {
                    uniforms[u] = gl.getActiveUniform(program, u);
                }

                //set projection
                if (uniforms.indexOf('projection') > -1) {
                    setUniform();
                }
            }

            //set buffers
            if (geometry !== object.geometry) {
                geometry = object.geometry;

                //glVertexArrayObject.bindVertexArrayOES(getVertexArray(object));

                if (true) {
                    for (a = 0; a < attributes.length; a++) {
                        var attribute = attributes[a],
                            name = attribute.name,
                            size = getSize(attribute),
                            type = getType(attribute);

                        gl.enableVertexAttribArray(a);
                        gl.bindBuffer(gl.ARRAY_BUFFER, getVertexBuffer(geometry, name));
                        gl.vertexAttribPointer(a, size, type, false, geometry.getStride(name), geometry.getOffset(name));
                    }

                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, getIndexBuffer(geometry));
                }
            }

            //set properties and textures
            if (material !== object.material) {
                material = object.material;
            }

            //set uniforms
            modelViewMatrix.copyFrom(object.localToGlobal).append(viewMatrix);
            gl.uniformMatrix4fv(gl.getUniformLocation(program, 'modelView'), false, modelViewMatrix.elements);
            gl.uniformMatrix4fv(gl.getUniformLocation(program, 'projection'), false, projectionMatrix.elements);

            //draw
            gl.drawElements(gl.TRIANGLES, geometry.indices.length, gl.UNSIGNED_SHORT, 0);
        }

        gl.useProgram(null);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        
        glVertexArrayObject.bindVertexArrayOES(null);
        
        //console.log(renderList);
    }

    function sort(a, b) {
        var compare;
        if ((compare = a.material.shader.id - b.material.shader.id) !== 0) {
            return compare;
        }
        if ((compare = a.geometry.id - b.geometry.id) !== 0) {
            return compare;
        }
        if ((compare = a.material.id - b.material.id) !== 0) {
            return compare;
        }
        return 0;
    }

    function setUniform(uniform) {

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

    //objects

    function onAdd(event) {
        addObject(event.target);
    }

    function addObject(object) {
        if (object instanceof Mesh) {
            renderList.push(object);
            updateList = true;
        }
        for (var i = 0, len = object.numChildren; i < len; i++) {
            addObject(object.getChildAt(i), true);
        }
    }

    function onRemove(event) {
        removeObject(event.target);
    }

    function removeObject(object) {
        if (object instanceof Mesh) {
            renderList.splice(renderList.indexOf(object), 1);
        }
        for (var i = 0, len = object.numChildren; i < len; i++) {
            removeObject(object.getChildAt(i), true);
        }
    }

    function onChange(event) {
        updateList = true;
    }

    //programs

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

    //vertex arrays

    var vertexArrays = {};

    function getVertexArray(object) {
        var array = vertexArrays[object.id];
        if (array === undefined) {
            array = vertexArrays[object.id] = glVertexArrayObject.createVertexArrayOES();
        }

        return array;
    }

    //vertex buffers

    var vertexBuffers = {};

    function getVertexBuffer(geometry, attribute) {
        var buffers = vertexBuffers[geometry.id];
        if (buffers === undefined) {
            buffers = vertexBuffers[geometry.id] = {};

            geometry.addEventListener(GeometryEvent.VERTICES_CHANGE, onVerticesChange);
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

    //index buffers

    var indexBuffers = {};

    function getIndexBuffer(geometry) {
        var cache = indexBuffers[geometry.id];
        if (cache === undefined) {
            cache = indexBuffers[geometry.id] = new Cache(gl.createBuffer());

            geometry.addEventListener(GeometryEvent.INDICES_CHANGE, onIndicesChange);
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

    //textures

    var textures = {};

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

    }

    //internal data structures

    function Cache(object) {
        Object.defineProperties(this, {
            object: { value: object },
            update: { value: true, writable: true },
            resize: { value: true, writable: true }
        });
    }

    function Texture2D(texture) {
        Object.defineProperties(this, {
            object: { value: texture },
            update: { value: true, writable: true },
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

    function Uniform() {
        Object.defineProperties(this, {
            location: {}
        });
    }
}