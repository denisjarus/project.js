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
        currentGeometry = null,
        currentMaterial = null;

    var activeAttributes = [],
        activeUniforms = null,
        activeTextures = [];

    // cached webgl objects

    var glPrograms = {},
        glVertexArrays = {},
        glVertexBuffers = {},
        glTextures = {};

    // state flags

    var updateSettings = true,
        sortRenderList = true;
        
    // temporary matrix

    var matrix = new Matrix3D();

    // lights

    var pointLightPositions = new Float32Array(0),
        pointLightColors = new Float32Array(0);

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
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.enable(gl.DEPTH_TEST);
            // gl.enable(gl.CULL_FACE);
            // gl.cullFace(gl.BACK);
            gl.frontFace(gl.CW);
        }

        // lights

        if (pointLightPositions.length !== lights.length * 3) {
            pointLightPositions = new Float32Array(lights.length * 3);
            pointLightColors = new Float32Array(lights.length * 3);
        }

        for (var light, i = 0; light = lights[i]; i++) {
            pointLightPositions.set(light.localToGlobal.position, i * 3);
            pointLightColors.set(light.color, i * 3);
        }

        // render objects

        for (var object, i = 0; object = renderList[i]; i++) {

            // set program

            if (currentShader !== object.material.shader) {
                setShader(object.material.shader);

                // set view and projection matrices

                if (activeUniforms.viewMatrix) {
                    activeUniforms.viewMatrix.set(camera.globalToLocal.elements);
                }

                if (activeUniforms.projectionMatrix) {
                    activeUniforms.projectionMatrix.set(camera.projection.elements);
                }

                if (activeUniforms.far) {
                    activeUniforms.far.set(camera.far);
                }

                // set lights

                if (activeUniforms['pointLightPositions[0]']) {
                    activeUniforms['pointLightPositions[0]'].set(pointLightPositions);
                }

                if (activeUniforms['pointLightColors[0]']) {
                    activeUniforms['pointLightColors[0]'].set(pointLightColors);
                }
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

            // set object matrices

            matrix.copyFrom(object.localToGlobal);

            if (activeUniforms.modelMatrix) {
                activeUniforms.modelMatrix.set(matrix.elements);
            }

            matrix.append(camera.globalToLocal);
            
            if (activeUniforms.modelViewMatrix) {
                activeUniforms.modelViewMatrix.set(matrix.elements);
            }

            matrix.normalMatrix();
            
            if (activeUniforms.normalMatrix) {
                activeUniforms.normalMatrix.set(matrix.elements);
            }

            gl.drawElements(gl.TRIANGLES, currentGeometry.indices.length, gl.UNSIGNED_SHORT, 0);
        }

        gl.useProgram(null);

        glVertexArrayObject.bindVertexArrayOES(null);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        currentShader = null;
        currentGeometry = null;
        currentMaterial = null;

        updateSettings = false;
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
        var cache = glPrograms[shader.id];

        if (!cache) {
            cache = glPrograms[shader.id] = {
                object: gl.createProgram(),
                attributes: [],
                uniforms: {}
            };

            var program = cache.object

            gl.attachShader(program, createShader(gl.VERTEX_SHADER, shader.vertexShader));
            gl.attachShader(program, createShader(gl.FRAGMENT_SHADER, shader.fragmentShader));

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

                cache.uniforms[uniform.name] = {
                    location: gl.getUniformLocation(program, uniform.name),
                    set: getUniformFunction(uniform)
                };
            }
        }

        if (!glVertexArrayObject) {
            enableAttributes(cache.attributes.length);
        }
        
        gl.useProgram(cache.object);

        currentShader = shader;
        activeAttributes = cache.attributes;
        activeUniforms = cache.uniforms;
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
            case gl,FLOAT: return 1;
            case gl.FLOAT_VEC2: return 2;
            case gl.FLOAT_VEC3: return 3;
            case gl.FLOAT_VEC4: return 4;
        }
    }

    function getAttributeType(attribute) {
        switch (attribute.type) {
            case gl.FLOAT: return gl.FLOAT;
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

    function uniformVector2(elements) {
        gl.uniform2fv(this.location, elements);
    }
    
    function uniformVector3(elements) {
        gl.uniform3fv(this.location, elements);
    }
    
    function uniformVector4(elements) {
        gl.uniform4fv(this.location, elements);
    }

    function uniformMatrix2(elements) {
        gl.uniformMatrix2fv(this.location, false, elements);
    }

    function uniformMatrix3(elements) {
        gl.uniformMatrix3fv(this.location, false, elements);
    }

    function uniformMatrix4(elements) {
        gl.uniformMatrix4fv(this.location, false, elements);
    }

    function uniformTexture2D(texture) {
        gl.activeTexture(gl.TEXTURE0);
        gl.uniform1i(this.location, 0);

        bindTexture(gl.TEXTURE_2D, texture);
    }

    function uniformTextureCube(texture) {

    }

    function enableAttributes(count) {
        if (count > activeAttributes.length) {
            for (var i = activeAttributes.length; i < count; i++) {
                gl.enableVertexAttribArray(i);
            }
        } else if (count < activeAttributes.length) {
            for (var i = count; i < activeAttributes.length; i++) {
                gl.disableVertexAttribArray(i);
            }
        }
    }

    // geometry

    function setGeometry(object) {
        var cache = glVertexArrays[object.id];

        if (!cache) {
            cache = glVertexArrays[object.id] = {
                object: glVertexArrayObject.createVertexArrayOES(),
                update: true
            };
        }

        glVertexArrayObject.bindVertexArrayOES(cache.object);

        if (cache.update) {
            cache.update = false;

            for (var attribute, i = 0; attribute = activeAttributes[i]; i++) {
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
        var buffers = glVertexBuffers[geometry.id];

        if (!buffers) {
            buffers = glVertexBuffers[geometry.id] = {};
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
        var cache = glVertexBuffers[event.target.id][event.attribute];

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
        for (var property, i = 0; property = currentShader.properties[i]; i++) {
            activeUniforms[property].set(material.getProperty(property));
        }

        currentMaterial = material;
    }

    function bindTexture(target, texture) {
        var cache = glTextures[texture.id];

        if (!cache) {
            cache = glTextures[texture.id] = {
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

        if (cache.config || updateSettings) {
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
        var cache = glTextures[event.target.id];

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
