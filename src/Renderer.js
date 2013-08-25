function Renderer(context) {

    'use strict';

    // WebGL context

    var gl = context,
        glVertexArrayObject = gl.getExtension('OES_vertex_array_object'),
        glAnisotropicFilter = gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');

    // context settings

    var magFilter = Renderer.TEXTURE_FILTER_BILINEAR,
        minFilter = Renderer.TEXTURE_FILTER_TRILINEAR,
        maxAnisotropy = glAnisotropicFilter ? 16 : 1;

    // current stage

    var stage = null,
        renderList = [],
        lights = [];

    // state flags

    var updateSettings = true,
        sortRenderList = true;
        
    // temporary matrix

    var matrix = new Matrix3D();

    // public api

    Object.defineProperties(this, {
        render: {
            value: render
        },
        magFilter: {
            get: function() {
                return magFilter;
            },
            set: function(value) {
                if (magFilter !== value) {
                    magFilter = value;
                    updateSettings = true;
                }
            }
        },
        minFilter: {
            get: function() {
                return minFilter;
            },
            set: function(value) {
                if (minFilter !== value) {
                    minFilter = value;
                    updateSettings = true
                }
            }
        },
        maxAnisotropy: {
            get: function() {
                return maxAnisotropy;
            },
            set: function(value) {
                if (maxAnisotropy !== value) {
                    maxAnisotropy = value;
                    updateSettings = true;
                }
            }
        }
    });

    // internal functions

    function render(object, camera, target) {
        if (!(object instanceof Object3D)) {
            throw new TypeError();
        }
        if (!(camera instanceof Camera3D)) {
            throw new TypeError();
        }
        if (target && !(target instanceof Texture)) {
            throw new TypeError();
        }

        if (stage !== object) {
            if (stage) {
                stage.removeEventListener(Event3D.ADDED, onAdd);
                stage.removeEventListener(Event3D.REMOVED, onRemove);
                stage.removeEventListener(Event3D.GEOMETRY_CHANGE, onChange);
                stage.removeEventListener(Event3D.MATERIAL_CHANGE, onChange);

                removeObject(stage);
            }
            stage = object;
            stage.addEventListener(Event3D.ADDED, onAdd);
            stage.addEventListener(Event3D.REMOVED, onRemove);
            stage.addEventListener(Event3D.GEOMETRY_CHANGE, onChange);
            stage.addEventListener(Event3D.MATERIAL_CHANGE, onChange);

            addObject(stage);
        }

        if (sortRenderList) {
            sortRenderList = false;

            renderList.sort(compare);
        }

        if (true) {
            gl.clearColor(0, 0, 0, 1);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        }

        if (updateSettings) {
            updateSettings = false;

            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.enable(gl.DEPTH_TEST);
            // gl.enable(gl.CULL_FACE);
            // gl.cullFace(gl.BACK);
            gl.frontFace(gl.CW);

            for (var id in textures) {
                textures[id].config = true;
            }
        }

        // render objects

        var shader = null,
            geometry = null,
            material = null;

        for (var object, i = 0; object = renderList[i]; i++) {

            // stop rendering when the first unrenderable object reached

            if (!object.geometry || !object.material) {
                break;
            }

            if (shader !== object.material.shader) {
                shader = object.material.shader;
                geometry = null;

                var program = getProgram(shader);

                gl.useProgram(program.object);

                enableAttributes(program.attributes.length);

                // set projection matrix
                // TODO

                // set lights
                // TODO
            }

            if (geometry !== object.geometry) {
                geometry = object.geometry;

                // setVertexArray(object);

                if (true) {
                    var attributes = program.attributes;

                    for (var attribute, j = 0; attribute = attributes[j]; j++) {
                        var name = attribute.name,
                            size = attribute.size,
                            type = attribute.type;

                        gl.bindBuffer(gl.ARRAY_BUFFER, getVertexBuffer(geometry, name));
                        gl.vertexAttribPointer(j, size, type, false, geometry.getStride(name) * 4, geometry.getOffset(name) * 4);
                    }

                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, getIndexBuffer(geometry));
                }
            }

            if (material !== object.material) {
                material = object.material;
                // TODO
            }

            shader.uniform(program.uniforms, object, camera, lights);

            // set object matrices

            matrix.copyFrom(object.localToGlobal);
            // TODO

            matrix.append(camera.globalToLocal);
            // TODO

            matrix.normalMatrix();
            // TODO

            gl.drawElements(gl.TRIANGLES, geometry.indices.length, gl.UNSIGNED_SHORT, 0);
        }

        gl.useProgram(null);

        glVertexArrayObject.bindVertexArrayOES(null);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }

    // render list object comparsion method

    function compare(a, b) {
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

    // stage event handlers

    function onAdd(event) {
        addObject(event.target);
    }

    function addObject(object) {
        var list;

        if (object instanceof Mesh) {
            list = renderList;
            sortRenderList = true;
        } else if (object instanceof Light3D) {
            list = lights;
        }

        if (list) {
            list.push(object);
        }

        for (var child, i = 0; child = object.getChildAt(i); i++) {
            addObject(child);
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
            removeObject(child);
        }
    }

    function onChange() {
        sortRenderList = true;
    }

    // programs

    var programs = {};

    function getProgram(shader) {
        var cache = programs[shader.id];

        if (!cache) {
            cache = programs[shader.id] = {
                object: gl.createProgram(),
                uniforms: {},
                attributes: []
            };

            var program = cache.object

            gl.attachShader(program, createShader(gl.VERTEX_SHADER, shader.vertex));
            gl.attachShader(program, createShader(gl.FRAGMENT_SHADER, shader.fragment));

            gl.linkProgram(program);

            if (gl.getProgramParameter(program, gl.LINK_STATUS) === false) {
                throw new Error(gl.getError());
            }

            for (var i = 0, len = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES); i < len; i++) {
                var info = gl.getActiveAttrib(program, i);

                cache.attributes[i] = {
                    name: info.name,
                    size: getAttributeSize(info),
                    type: getAttributeType(info)
                };
            }

            for (var i = 0, len = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS); i < len; i++) {
                var info = gl.getActiveUniform(program, i);

                cache.uniforms[info.name] = getUniformSetter(program, info);
            }
        }
        
        return cache;
    }

    function createShader(type, code) {
        var shader = gl.createShader(type);

        gl.shaderSource(shader, code);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw new Error(gl.getShaderInfoLog(shader));
        }

        return shader;
    }

    function getAttributeSize(attribute) {
        switch (attribute.type) {
            case gl.FLOAT_VEC2: return 2;
            case gl.FLOAT_VEC3: return 3;
            case gl.FLOAT_VEC4: return 4;
        }
    }

    function getAttributeType(attribute) {
        switch (attribute.type) {
            case gl.FLOAT_VEC2: return gl.FLOAT;
            case gl.FLOAT_VEC3: return gl.FLOAT;
            case gl.FLOAT_VEC4: return gl.FLOAT;
        }
    }

    function getUniformSetter(program, uniform) {
        var location = gl.getUniformLocation(program, uniform.name);

        switch (uniform.type) {

            // vector types

            case gl.FLOAT: return function(value) {
                gl.uniform1f(location, value);
            };

            case gl.FLOAT_VEC2: return function(value) {
                gl.uniform2fv(location, value);
            };

            case gl.FLOAT_VEC3: return function(value) {
                gl.uniform3fv(location, value);
            };

            case gl.FLOAT_VEC4: return function(value) {
                gl.uniform4fv(location, value);
            };

            // matrix types

            case gl.FLOAT_MAT2: return function(matrix) {
                gl.uniformMatrix2fv(location, false, matrix);
            };

            case gl.FLOAT_MAT3: return function(matrix) {
                gl.uniformMatrix3fv(location, false, matrix);
            };

            case gl.FLOAT_MAT4: return function(matrix) {
                gl.uniformMatrix4fv(location, false, matrix);
            };

            // sampler types

            case gl.SAMPLER_2D: return function(texture) {
                gl.activeTexture(gl.TEXTURE0);
                gl.uniform1i(location, 0);

                setTexture(gl.TEXTURE_2D, texture);
            };
        }
    }

    // attributes

    var enabledAttributes = 0;

    function enableAttributes(count) {
        if (count > enabledAttributes) {
            for (var i = enabledAttributes; i < count; i++) {
                gl.enableVertexAttribArray(i);
            }
        } else if (count < enabledAttributes) {
            for (var i = count; i < enabledAttributes; i++) {
                gl.disableVertexAttribArray(i);
            }
        } else {
            return;
        }

        enabledAttributes = count;
    }

    // vertex arrays

    var vertexArrays = {};

    function setVertexArray(object) {
        var cache = vertexArrays[object.id];

        if (!cache) {
            cache = vertexArrays[object.id] = {
                object: glVertexArrayObject.createVertexArrayOES(),
                update: false
            };
        }

        glVertexArrayObject.bindVertexArrayOES(cache.object);

        if (cache.update) {
            cache.update = false;
        }
    }

    // vertex buffers

    var vertexBuffers = {};

    function getVertexBuffer(geometry, attribute) {
        var buffers = vertexBuffers[geometry.id];

        if (!buffers) {
            buffers = vertexBuffers[geometry.id] = {};
        }

        var cache = buffers[attribute];

        if (!cache) {
            cache = buffers[attribute] = {
                object: gl.createBuffer(),
                update: true,
                resize: true
            };

            geometry.addEventListener(GeometryEvent.UPDATE, onVerticesUpdate);
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

    function onVerticesUpdate(event) {
        var cache = vertexBuffers[event.target.id][event.attribute];

        if (cache) {
            cache.update = true;
            cache.resize |= event.resize;
        }
    }

    // index buffers

    var indexBuffers = {};

    function getIndexBuffer(geometry) {
        var cache = indexBuffers[geometry.id];

        if (!cache) {
            cache = indexBuffers[geometry.id] = {
                object: gl.createBuffer(),
                update: true,
                resize: true
            };

            geometry.addEventListener(GeometryEvent.INDICES_UPDATE, onIndicesUpdate);
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

    function onIndicesUpdate(event) {
        var cache = indexBuffers[event.target.id];
        cache.update = true;
        cache.resize |= event.resize;
    }

    // textures

    var textures = {};

    function setTexture(target, texture) {
        var cache = textures[texture.id];

        if (!cache) {
            cache = textures[texture.id] = {
                object: gl.createTexture(),
                update: true,
                resize: true,
                config: true
            };

            texture.addEventListener(TextureEvent.UPDATE, onTextureUpdate);
            texture.addEventListener(TextureEvent.WRAP_CHANGE, onTextureUpdate);
        }

        gl.bindTexture(target, cache.object);

        if (cache.update) {
            if (cache.resize) {
                gl.texImage2D(target, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, texture.getData());
            } else {
                gl.texSubImage2D(target, 0, 0, 0, gl.RGB, gl.UNSIGNED_BYTE, texture.getData());
            }
            if (true) {
                gl.generateMipmap(target);
            }

            cache.update = cache.resize = false;
        }

        if (cache.config) {
            cache.config = false;

            gl.texParameteri(target, gl.TEXTURE_WRAP_S, texture.wrapU);
            gl.texParameteri(target, gl.TEXTURE_WRAP_T, texture.wrapV);
            gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, magFilter);
            gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, minFilter);

            if (glAnisotropicFilter) {
                gl.texParameteri(target, glAnisotropicFilter.TEXTURE_MAX_ANISOTROPY_EXT, maxAnisotropy);
            }
        }
    }

    function onTextureUpdate(event) {
        var cache = textures[event.target.id];

        if (event.type === TextureEvent.UPDATE) {
            cache.update = true;
            cache.resize |= event.resize;
        } else {
            cache.config = true;
        }
    }

    // uniforms

    var uniformBuffers = {};

    function getUniformBuffer(material) {
        var buffer = uniformBuffers[material.id];

        if (!buffer) {
            buffer = uniformBuffers[material.id] = {};
        }
    }
}

Object.defineProperties(Renderer, {
    TEXTURE_FILTER_NEAREST: { value: 0x2600 },
    TEXTURE_FILTER_BILINEAR: { value: 0x2601 },
    TEXTURE_FILTER_TRILINEAR: { value: 0x2703 }
});
