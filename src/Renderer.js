function Renderer(context) {

    'use strict';

    // webgl context

    var gl = context,
        glVertexArrayObject = gl.getExtension('OES_vertex_array_object'),
        glAnisotropicFilter = gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');

    // stage

    var stage = null,
        renderList = [],
        lights = [];

    // current state

    var currentShader = null,
        currentGeometry = null,
        currentMaterial = null,
        currentFrame = null;

    var activeAttributes = [],
        activeUniforms = null,
        activeTextures = 0;

    // cached webgl objects

    var shaderCache = {},
        geometryCache = {},
        materialCache = {},  // for v2.0
        textureCache = {},
        frameCache = {};

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

            renderList.sort(sort);
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

        // set frame

        if (target && currentFrame !== target) {
            setFrame(target);
        }

        // render objects

        for (var object, i = 0; object = renderList[i]; i++) {
            if (!object.visible) {
                continue;
            }

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
                setGeometry(object.geometry);
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

            // render object

            gl.drawElements(gl.TRIANGLES, currentGeometry.indices.length, gl.UNSIGNED_SHORT, 0);
        }

        if (target) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
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

    // render list object comparison method

    function sort(a, b) {
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

    // shaders

    function setShader(shader) {
        var glShader = shaderCache[shader.id];

        if (glShader === undefined) {
            glShader = shaderCache[shader.id] = {
                program: gl.createProgram(),
                attributes: [],
                uniforms: {}
            };

            gl.attachShader(glShader.program, createShader(gl.VERTEX_SHADER, shader.vertexShader));
            gl.attachShader(glShader.program, createShader(gl.FRAGMENT_SHADER, shader.fragmentShader));

            gl.linkProgram(glShader.program);

            if (gl.getProgramParameter(glShader.program, gl.LINK_STATUS) === false) {
                throw new Error(gl.getError());
            }

            for (var i = 0, len = gl.getProgramParameter(glShader.program, gl.ACTIVE_ATTRIBUTES); i < len; i++) {
                var attribute = gl.getActiveAttrib(glShader.program, i);

                glShader.attributes[i] = {
                    name: attribute.name,
                    size: getAttributeSize(attribute),
                    type: getAttributeType(attribute)
                };
            }

            for (var i = 0, len = gl.getProgramParameter(glShader.program, gl.ACTIVE_UNIFORMS); i < len; i++) {
                var uniform = gl.getActiveUniform(glShader.program, i);

                glShader.uniforms[uniform.name] = {
                    location: gl.getUniformLocation(glShader.program, uniform.name),
                    set: getUniformFunction(uniform)
                };
            }
        }

        if (!glVertexArrayObject) {
            enableAttributes(glShader.attributes.length);
        }
        
        gl.useProgram(glShader.program);

        currentShader = shader;
        currentGeometry = null;
        currentMaterial = null;

        activeAttributes = glShader.attributes;
        activeUniforms = glShader.uniforms;
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
            case gl.FLOAT: return 1;
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
        addActiveTexture(this.location);
        setTexture2D(texture);
    }

    function uniformTextureCube(texture) {
        addActiveTexture(this.location);
        setTextureCube(texture);
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

    function addActiveTexture(location) {
        gl.activeTexture(gl.TEXTURE0 + activeTextures);
        gl.uniform1i(location, activeTextures);
        activeTextures++;
    }

    // geometries

    function setGeometry(geometry) {
        var glGeometry = geometryCache[geometry.id];

        if (glGeometry === undefined) {
            glGeometry = geometryCache[geometry.id] = {
                vertexArrays: {},
                vertexBuffers: {},
                indexBuffer: gl.createBuffer()
            };

            glVertexArrayObject.bindVertexArrayOES(null);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, glGeometry.indexBuffer);
            updateBuffer(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, true);

            geometry.addEventListener(GeometryEvent.UPDATE, onVerticesUpdate);
            geometry.addEventListener(GeometryEvent.INDICES_UPDATE, onIndicesUpdate);
        }

        // bind vertex array

        var vertexArray = glGeometry.vertexArrays[currentShader.id];

        if (vertexArray !== undefined) {
            glVertexArrayObject.bindVertexArrayOES(vertexArray);
        } else {
            vertexArray = glGeometry.vertexArrays[currentShader.id] = glVertexArrayObject.createVertexArrayOES();

            glVertexArrayObject.bindVertexArrayOES(vertexArray);

            // bind vertex buffers

            for (var attribute, i = 0; attribute = activeAttributes[i]; i++) {
                var vertexBuffer = glGeometry.vertexBuffers[attribute.name];

                if (vertexBuffer !== undefined) {
                    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
                } else {
                    vertexBuffer = glGeometry.vertexBuffers[attribute.name] = gl.createBuffer();

                    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
                    updateBuffer(gl.ARRAY_BUFFER, geometry.getData(attribute.name), true);
                }

                gl.enableVertexAttribArray(i);
                gl.vertexAttribPointer(i, attribute.size, attribute.type, false, 0, 0);
            }

            // bind index buffer

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, glGeometry.indexBuffer);
        }

        currentGeometry = geometry;
    }

    function updateBuffer(target, data, resize) {
        if (resize) {
            gl.bufferData(target, data, gl.STATIC_DRAW);
        } else {
            gl.bufferSubData(target, 0, data);
        }
    }

    function onVerticesUpdate(event) {
        gl.bindBuffer(gl.ARRAY_BUFFER, geometryCache[event.target.id].vertexBuffers[event.attribute]);
        updateBuffer(gl.ARRAY_BUFFER, geometry.getData(attribute), event.resize);
    }

    function onIndicesUpdate(event) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geometryCache[event.target.id].indexBuffer);
        updateBuffer(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, event.resize);
    }

    // materials

    function setMaterial(material) {
        for (var property, i = 0; property = currentShader.properties[i]; i++) {
            activeUniforms[property].set(material.getProperty(property));
        }

        currentMaterial = material;
        activeTextures = 0;
    }

    // textures

    function setTexture2D(texture) {
        var glTexture = textureCache[texture.id];

        if (glTexture !== undefined) {
            gl.bindTexture(gl.TEXTURE_2D, glTexture);
        } else {
            glTexture = textureCache[texture.id] = gl.createTexture();

            gl.bindTexture(gl.TEXTURE_2D, glTexture);

            updateTexture(gl.TEXTURE_2D, texture.getData(0), true);
            configTexture(gl.TEXTURE_2D, texture);

            texture.addEventListener(TextureEvent.UPDATE, onTexture2DUpdate);
            texture.addEventListener(TextureEvent.CONFIG, onTexture2DConfig);
        }
    }

    function setTextureCube(texture) {
        var glTexture = textureCache[texture.id];

        if (glTexture !== undefined) {
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, glTexture);
        } else {
            glTexture = textureCache[texture.id] = gl.createTexture();

            gl.bindTexture(gl.TEXTURE_CUBE_MAP, glTexture);

            for (var i = 0; i < 6; i++) {
                updateTexture(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, texture.getData(i), true);
            }

            configTexture(gl.TEXTURE_CUBE_MAP, texture);

            texture.addEventListener(TextureEvent.UPDATE, onTextureCubeUpdate);
            texture.addEventListener(TextureEvent.CONFIG, onTextureCubeConfig);
        }
    }

    function updateTexture(target, data, resize) {
        if (resize) {
            gl.texImage2D(target, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, data);
        } else {
            gl.texSubImage2D(target, 0, 0, 0, gl.RGB, gl.UNSIGNED_BYTE, data);
        }

        if (true) {
            gl.generateMipmap(target);
        }
    }

    function configTexture(target, texture) {
        gl.texParameteri(target, gl.TEXTURE_WRAP_S, texture.wrapU);
        gl.texParameteri(target, gl.TEXTURE_WRAP_T, texture.wrapV);
        gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, texture.magFilter);
        gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, texture.minFilter);

        if (glAnisotropicFilter) {
            gl.texParameteri(target, glAnisotropicFilter.TEXTURE_MAX_ANISOTROPY_EXT, texture.maxAnisotropy);
        }
    }

    function onTexture2DUpdate(event) {
        gl.bindTexture(gl.TEXTURE_2D, textureCache[event.target.id]);
        updateTexture(gl.TEXTURE_2D, event.target.getData(0), event.resize);
    }

    function onTextureCubeUpdate(event) {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, textureCache[event.target.id]);
        updateTexture(gl.TEXTURE_CUBE_MAP_POSITIVE_X + event.side, event.target.getData(event.side), event.resize);
    }

    function onTexture2DConfig(event) {
        gl.bindTexture(gl.TEXTURE_2D, textureCache[event.target.id]);
        configTexture(gl.TEXTURE_2D, event.target);
    }

    function onTextureCubeConfig(event) {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, textureCache[event.target.id]);
        configTexture(gl.TEXTURE_CUBE_MAP, event.target);
    }

    // frame buffers

    function setFrame(texture) {
        var glFrameBuffer = frameCache[texture.id];

        if (glFrameBuffer !== undefined) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, glFrameBuffer);
        } else {
            glFrameBuffer = frameCache[texture.id] = gl.createFramebuffer();

            gl.bindFramebuffer(gl.FRAMEBUFFER, glFrameBuffer);
        }

        currentFrame = texture;
    }
}
