function Renderer(context) {

    'use strict';

    Object.defineProperties(this, {
        render: {
            value: render
        }
    });

    // webgl context

    var gl = context,
        glVertexArrayObject = gl.getExtension('OES_vertex_array_object'),
        glAnisotropicFilter = gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');

    var depthTest = false,
        depthMask = false;

    // stage

    var stage = null,
        renderList = [];

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

    var pointLights = [],
        pointLightPositions = new Float32Array(5 * 3),
        pointLightColors = new Float32Array(5 * 3),

        spotLights = [],
        spotLightPositions = new Float32Array(1 * 3),
        spotLightDirections = new Float32Array(1 * 3),
        spotLightColors = new Float32Array(1 * 3);

    // types

    var glSizes = {};

    glSizes[gl.FLOAT] = 1;
    glSizes[gl.FLOAT_VEC2] = 2;
    glSizes[gl.FLOAT_VEC3] = 3;
    glSizes[gl.FLOAT_VEC4] = 4;

    var glTypes = {};

    glTypes[gl.FLOAT] = gl.FLOAT;
    glTypes[gl.FLOAT_VEC2] = gl.FLOAT;
    glTypes[gl.FLOAT_VEC3] = gl.FLOAT;
    glTypes[gl.FLOAT_VEC4] = gl.FLOAT;

    var glUniform = {};

    glUniform[gl.FLOAT] = function(value) {
        gl.uniform1f(this.location, value);
    }

    glUniform[gl.FLOAT_VEC2] = function(elements) {
        gl.uniform2fv(this.location, elements);
    }
    
    glUniform[gl.FLOAT_VEC3] = function(elements) {
        gl.uniform3fv(this.location, elements);
    }
    
    glUniform[gl.FLOAT_VEC4] = function(elements) {
        gl.uniform4fv(this.location, elements);
    }

    glUniform[gl.FLOAT_MAT2] = function(elements) {
        gl.uniformMatrix2fv(this.location, false, elements);
    }

    glUniform[gl.FLOAT_MAT3] = function(elements) {
        gl.uniformMatrix3fv(this.location, false, elements);
    }

    glUniform[gl.FLOAT_MAT4] = function(elements) {
        gl.uniformMatrix4fv(this.location, false, elements);
    }

    glUniform[gl.SAMPLER_2D] = function(texture) {
        addActiveTexture(this.location);
        bindTexture2D(texture);
    }

    glUniform[gl.SAMPLER_CUBE] = function(texture) {
        addActiveTexture(this.location);
        bindTextureCube(texture);
    }

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

        if (updateSettings) {
            // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            // gl.enable(gl.CULL_FACE);
            // gl.cullFace(gl.BACK);
            gl.frontFace(gl.CW);
        }

        // lights

        for (var light, i = 0; light = pointLights[i]; i++) {
            pointLightPositions.set(light.localToGlobal.position, i * 3);
            pointLightColors.set(light.color, i * 3);
        }

        for (var light, i = 0; light = spotLights[i]; i++) {
            spotLightPositions.set(light.localToGlobal.position, i * 3);
            spotLightDirections.set(light.direction, i * 3);
            spotLightColors.set(light.color, i * 3);
        }

        // set frame

        if (target && currentFrame !== target) {
            setFrame(target);
        }

        if (true) {
            gl.clearColor(0, 0, 0, 1);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
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
            bindTexture2D(target);
            generateMipmap(gl.TEXTURE_2D, target);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }

        setDepthTest(true);
        setDepthMask(true);

        gl.useProgram(null);

        glVertexArrayObject.bindVertexArrayOES(null);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

        currentShader = null;
        currentGeometry = null;
        currentMaterial = null;
        currentFrame = null;

        updateSettings = false;
    }


    function setDepthTest(value) {
        if (depthTest !== value) {
            depthTest = value;

            if (depthTest) {
                gl.enable(gl.DEPTH_TEST);
            } else {
                gl.disable(gl.DEPTH_TEST);
            }
        }
    }

    function setDepthMask(value) {
        if (depthMask !== value) {
            depthMask = value;

            gl.depthMask(depthMask);
        }
    }

    // stage management

    function onAdd(event) {
        addObject(event.target);
    }

    function addObject(object) {
        if (object instanceof Mesh) {
            renderList.push(object);

            cacheGeometry(object.geometry);

            sortRenderList = true;

        } else if (object instanceof PointLight) {
            pointLights.push(object);

        } else if (object instanceof SpotLight) {
            spotLights.push(object);
        }

        for (var child, i = 0; child = object.getChildAt(i); i++) {
            addObject(child);
        }
    }

    function onRemove(event) {
        removeObject(event.target);
    }

    function removeObject(object) {
        if (object instanceof Mesh) {
            renderList.splice(renderList.indexOf(object), 1);

        } else if (object instanceof PointLight) {
            pointLights.splice(pointLights.indexOf(object), 1);

        } else if (object instanceof SpotLight) {
            spotLights.splice(spotLights.indexOf(object), 1);
        }

        for (var child, i = 0; child = object.getChildAt(i); i++) {
            removeObject(child);
        }
    }

    function onChange(event) {
        cacheGeometry(event.target.geometry);

        sortRenderList = true;
    }

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
                    size: glSizes[attribute.type],
                    type: glTypes[attribute.type]
                };
            }

            for (var i = 0, len = gl.getProgramParameter(glShader.program, gl.ACTIVE_UNIFORMS); i < len; i++) {
                var uniform = gl.getActiveUniform(glShader.program, i);

                glShader.uniforms[uniform.name] = {
                    location: gl.getUniformLocation(glShader.program, uniform.name),
                    set: glUniform[uniform.type]
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

    // geometries

    function cacheGeometry(geometry) {
        if (geometryCache[geometry.id] === undefined) {
            geometryCache[geometry.id] = {
                vertexArrays: {},
                vertexBuffers: {},
                indexBuffer: createBuffer(gl.ELEMENT_ARRAY_BUFFER, geometry.indices)
            };

            geometry.addEventListener(GeometryEvent.UPDATE, onVerticesUpdate);
            geometry.addEventListener(GeometryEvent.INDICES_UPDATE, onIndicesUpdate);
        }
    }

    function createBuffer(type, data) {
        var glBuffer = gl.createBuffer();

        bufferData(type, glBuffer, data);

        return glBuffer;
    }

    function bufferData(type, glBuffer, data) {
        gl.bindBuffer(type, glBuffer);
        gl.bufferData(type, data, gl.STATIC_DRAW);
        gl.bindBuffer(type, null);
    }

    function setGeometry(geometry) {
        var glGeometry = geometryCache[geometry.id];

        var vertexArray = glGeometry.vertexArrays[currentShader.id];

        if (vertexArray === undefined) {
            vertexArray = glGeometry.vertexArrays[currentShader.id] = glVertexArrayObject.createVertexArrayOES();

            glVertexArrayObject.bindVertexArrayOES(vertexArray);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, glGeometry.indexBuffer);

            for (var attribute, i = 0; attribute = activeAttributes[i]; i++) {
                var vertexBuffer = glGeometry.vertexBuffers[attribute.name];

                if (vertexBuffer === undefined) {
                    vertexBuffer = glGeometry.vertexBuffers[attribute.name] = gl.createBuffer();

                    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, geometry.getData(attribute.name), gl.STATIC_DRAW);

                } else {
                    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
                }

                gl.enableVertexAttribArray(i);
                gl.vertexAttribPointer(i, attribute.size, attribute.type, false, 0, 0);
            }

        } else {
            glVertexArrayObject.bindVertexArrayOES(vertexArray);
        }

        currentGeometry = geometry;
    }

    function onVerticesUpdate(event) {
        gl.bindBuffer(gl.ARRAY_BUFFER, geometryCache[event.target.id].vertexBuffers[event.attribute]);
        gl.bufferData(gl.ARRAY_BUFFER, event.target.getData(event.attribute), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }

    function onIndicesUpdate(event) {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geometryCache[event.target.id].indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, event.target.indices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }

    // materials

    function setMaterial(material) {
        setDepthTest(material.depthTest);
        setDepthMask(material.depthMask);

        for (var uniform, i = 0; uniform = currentShader.uniforms[i]; i++) {
            activeUniforms[uniform].set(material.getProperty(uniform));
        }

        currentMaterial = material;
        activeTextures = 0;
    }

    function addActiveTexture(location) {
        gl.activeTexture(gl.TEXTURE0 + activeTextures);
        gl.uniform1i(location, activeTextures);
        activeTextures++;
    }

    // textures

    function bindTexture2D(texture) {
        var glTexture = textureCache[texture.id];

        if (glTexture === undefined) {
            glTexture = textureCache[texture.id] = gl.createTexture();

            gl.bindTexture(gl.TEXTURE_2D, glTexture);
            textureImage2D(gl.TEXTURE_2D, texture, texture.getData(0));
            textureConfigs(gl.TEXTURE_2D, texture);
            generateMipmap(gl.TEXTURE_2D, texture);

            texture.addEventListener(TextureEvent.UPDATE, onTexture2DUpdate);
            texture.addEventListener(TextureEvent.CONFIG, onTexture2DConfig);

        } else {
            gl.bindTexture(gl.TEXTURE_2D, glTexture);
        }
    }

    function bindTextureCube(texture) {
        var glTexture = textureCache[texture.id];

        if (glTexture === undefined) {
            glTexture = textureCache[texture.id] = gl.createTexture();

            gl.bindTexture(gl.TEXTURE_CUBE_MAP, glTexture);

            for (var i = 0; i < 6; i++) {
                textureImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, texture, texture.getData(i));
            }

            textureConfigs(gl.TEXTURE_CUBE_MAP, texture);
            generateMipmap(gl.TEXTURE_CUBE_MAP, texture);

            texture.addEventListener(TextureEvent.UPDATE, onTextureCubeUpdate);
            texture.addEventListener(TextureEvent.CONFIG, onTextureCubeConfig);

        } else {
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, glTexture);
        }
    }

    function textureImage2D(target, texture, data) {
        if (texture instanceof DataTexture) {
            gl.texImage2D(target, 0, gl.RGB, texture.width, texture.height, 0, gl.RGB, gl.UNSIGNED_BYTE, data);
        } else {
            gl.texImage2D(target, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, data);
        }
    }

    function textureConfigs(target, texture) {
        gl.texParameteri(target, gl.TEXTURE_WRAP_S, texture.wrapU);
        gl.texParameteri(target, gl.TEXTURE_WRAP_T, texture.wrapV);
        gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, texture.magFilter);
        gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, texture.minFilter);

        if (glAnisotropicFilter) {
            gl.texParameteri(target, glAnisotropicFilter.TEXTURE_MAX_ANISOTROPY_EXT, texture.maxAnisotropy);
        }
    }

    function generateMipmap(target, texture) {
        if (texture.minFilter !== gl.NEAREST && texture.minFilter !== gl.LINEAR) {
            gl.generateMipmap(target);
        }
    }

    function onTexture2DUpdate(event) {
        gl.bindTexture(gl.TEXTURE_2D, textureCache[event.target.id]);
        textureImage2D(gl.TEXTURE_2D, event.target, event.target.getData(0));
        generateMipmap(gl.TEXTURE_2D, event.target);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    function onTextureCubeUpdate(event) {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, textureCache[event.target.id]);
        textureImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + event.side, event.target, event.target.getData(event.side));
        generateMipmap(gl.TEXTURE_CUBE_MAP, event.target);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
    }

    function onTexture2DConfig(event) {
        gl.bindTexture(gl.TEXTURE_2D, textureCache[event.target.id]);
        textureConfigs(gl.TEXTURE_2D, event.target);
        generateMipmap(gl.TEXTURE_2D, event.target);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    function onTextureCubeConfig(event) {
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, textureCache[event.target.id]);
        textureConfigs(gl.TEXTURE_CUBE_MAP, event.target);
        generateMipmap(gl.TEXTURE_CUBE_MAP, event.target);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
    }

    // frame buffers

    var depthBuffer = gl.createRenderbuffer();

    function setFrame(texture) {
        var glFrameBuffer = frameCache[texture.id];

        if (glFrameBuffer === undefined) {
            glFrameBuffer = frameCache[texture.id] = gl.createFramebuffer();

            gl.bindFramebuffer(gl.FRAMEBUFFER, glFrameBuffer);

            bindTexture2D(texture);

            gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, texture.width, texture.height);

            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textureCache[texture.id], 0);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

            gl.bindTexture(gl.TEXTURE_2D, null);
            gl.bindRenderbuffer(gl.RENDERBUFFER, null);

        } else {
            gl.bindFramebuffer(gl.FRAMEBUFFER, glFrameBuffer);
        }

        currentFrame = texture;
    }
}
