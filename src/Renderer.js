function Renderer(context) {

    'use strict';

    // webgl context

    var gl = context,
        glVertexArrayObject = gl.getExtension('OES_vertex_array_object'),
        glAnisotropicFilter = gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');

    // context settings

    var magFilter = Renderer.TEXTURE_FILTER_BILINEAR,
        minFilter = Renderer.TEXTURE_FILTER_TRILINEAR,
        maxAnisotropy = glAnisotropicFilter ? 16 : 1;

    // stage

    var stage = null,
        renderList = [],
        lights = [];

    // current state

    var currentShader = null,
        currentAttributes = null,
        currentUniforms = null,
        currentGeometry = null,
        currentMaterial = null;

    // cached webgl objects

    var cachedPrograms = {},
        cachedArrays = {},
        cachedBuffers = {},
        cachedTextures = {};

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

            for (var id in cachedTextures) {
                cachedTextures[id].config = true;
            }
        }

        // render objects

        for (var object, i = 0; object = renderList[i]; i++) {

            // set program

            if (currentShader !== object.material.shader) {
                setShader(object.material.shader);

                // set projection matrix
                // TODO

                // set lights
                // TODO
            }

            // set buffers

            if (currentGeometry !== object.geometry) {
                currentGeometry = object.geometry;

                setGeometry(object);
            }

            // set material

            if (currentMaterial !== object.material) {
                setMaterial(object.material);
            }

            currentShader.uniform(currentUniforms, object, camera, lights);

            // set object matrices

            matrix.copyFrom(object.localToGlobal);
            // TODO

            matrix.append(camera.globalToLocal);
            // TODO

            matrix.normalMatrix();
            // TODO

            gl.drawElements(gl.TRIANGLES, currentGeometry.indices.length, gl.UNSIGNED_SHORT, 0);
        }

        gl.useProgram(null);

        glVertexArrayObject.bindVertexArrayOES(null);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        currentShader = null;
        currentGeometry = null;
        currentMaterial = null;
    }

    // render list object comparsion method

    function compare(a, b) {
        var order;

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

    // stage management

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

    function setShader(shader) {
        var cache = cachedPrograms[shader.id];

        if (!cache) {
            cache = cachedPrograms[shader.id] = {
                object: gl.createProgram(),
                attributes: [],
                uniforms: []
            };

            var program = cache.object

            gl.attachShader(program, createShader(gl.VERTEX_SHADER, shader.vertex));
            gl.attachShader(program, createShader(gl.FRAGMENT_SHADER, shader.fragment));

            gl.linkProgram(program);

            if (gl.getProgramParameter(program, gl.LINK_STATUS) === false) {
                throw new Error(gl.getError());
            }

            for (var i = 0, len = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES); i < len; i++) {
                var attribute = gl.getActiveAttrib(program, i);

                cache.attributes[i] = {
                    name: attribute.name,
                    size: getAttributeSize(attribute),
                    type: getAttributeType(attribute)
                };
            }

            for (var i = 0, len = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS); i < len; i++) {
                var uniform = gl.getActiveUniform(program, i);

                cache.uniforms[i] = {
                    name: uniform.name,
                    location: gl.getUniformLocation(program, uniform.name),
                    setValue: getUniformFunction(uniform)
                }
            }
        }

        if (!glVertexArrayObject) {
            enableAttributes(cache.attributes.length);
        }
        
        gl.useProgram(cache.object);

        currentShader = shader;
        currentAttributes = cache.attributes;
        currentUniforms = cache.uniforms;
        currentGeometry = null;
        currentMaterial = null;
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

    function getUniformFunction(uniform) {
        switch (uniform.type) {
            case gl.FLOAT: return uniformFloat;

            case gl.FLOAT_VEC2: return uniformVector2;
            case gl.FLOAT_VEC3: return uniformVector3;
            case gl.FLOAT_VEC4: return uniformVector4;

            case gl.FLOAT_MAT2: return uniformMatrix2;
            case gl.FLOAT_MAT3: return uniformMatrix3;
            case gl.FLOAT_MAT4: return uniformMatrix4;

            case gl.SAMPLER_2D: return uniformTexture2D;
            case gl.SAMPLER_CUBE: return uniformTextureCube;
        }
    }

    function uniformFloat(value) {
        gl.uniform1f(this.location, value);
    }

    function uniformVector2(value) {
        gl.uniform2fv(this.location, value);
    }
    
    function uniformVector3(value) {
        gl.uniform3fv(this.location, value);
    }
    
    function uniformVector4(value) {
        gl.uniform4fv(this.location, value);
    }

    function uniformMatrix2(value) {
        gl.uniformMatrix2fv(this.location, false, value);
    }

    function uniformMatrix3(value) {
        gl.uniformMatrix3fv(this.location, false, value);
    }

    function uniformMatrix4(value) {
        gl.uniformMatrix4fv(this.location, false, value);
    }

    function uniformTexture2D(texture) {
        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(location, 0);

        bindTexture(gl.TEXTURE_2D, texture);
    }

    function uniformTextureCube(texture) {

    }

    function enableAttributes(count) {
        if (count > currentAttributes.length) {
            for (var i = currentAttributes.length; i < count; i++) {
                gl.enableVertexAttribArray(i);
            }
        } else if (count < currentAttributes.length) {
            for (var i = count; i < currentAttributes.length; i++) {
                gl.disableVertexAttribArray(i);
            }
        }
    }

    // geometry

    function setGeometry(object) {
        var cache = cachedArrays[object.id];

        if (!cache) {
            cache = cachedArrays[object.id] = {
                object: glVertexArrayObject.createVertexArrayOES(),
                update: true
            };
        }

        glVertexArrayObject.bindVertexArrayOES(cache.object);

        if (cache.update) {
            cache.update = false;

            for (var attribute, i = 0; attribute = currentAttributes[i]; i++) {
                var stride = currentGeometry.getStride(attribute.name) * 4,
                    offset = currentGeometry.getOffset(attribute.name) * 4;

                bindBuffer(currentGeometry, attribute.name);

                gl.enableVertexAttribArray(i);
                gl.vertexAttribPointer(i, attribute.size, attribute.type, false, stride, offset);
            }

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, getIndexBuffer(currentGeometry));
        }

        // currentGeometry = geometry;
    }

    // buffers

    function bindBuffer(geometry, attribute) {
        var buffers = cachedBuffers[geometry.id];

        if (!buffers) {
            buffers = cachedBuffers[geometry.id] = {};
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

        gl.bindBuffer(gl.ARRAY_BUFFER, cache.object);

        if (cache.update) {
            if (cache.resize) {
                gl.bufferData(gl.ARRAY_BUFFER, geometry.getData(attribute), gl.STATIC_DRAW);
            } else {
                gl.bufferSubData(gl.ARRAY_BUFFER, 0, geometry.getData(attribute));
            }

            cache.update = cache.resize = false;
        }
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

    // materials

    function setMaterial(material) {
        for (var uniform, i = 0; uniform = currentUniforms[i]; i++) {
            uniform.setValue(material[uniform.name]);
        }

        currentMaterial = material;
    }

    function bindTexture(target, texture) {
        var cache = cachedTextures[texture.id];

        if (!cache) {
            cache = cachedTextures[texture.id] = {
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
}

Object.defineProperties(Renderer, {
    TEXTURE_FILTER_NEAREST: { value: 0x2600 },
    TEXTURE_FILTER_BILINEAR: { value: 0x2601 },
    TEXTURE_FILTER_TRILINEAR: { value: 0x2703 }
});
