function GouraudMaterial() {

    TextureMaterial.call(this);

    Object.defineProperties(this, {
        specular: { value: new Float32Array(3) },
    });
}

GouraudMaterial.prototype = Object.create(TextureMaterial.prototype, {
    shader: {
        value: new Shader(
            [
                '#define NUM_POINT_LIGHTS 5',
                '#define modelView MODEL_VIEW',

                'attribute vec3 position;',
                'attribute vec2 texcoord;',
                'attribute vec3 normal;',

                'uniform mat4 modelView;',
                'uniform mat4 projection;',

                'uniform mat4 view;',
                'uniform mat4 normalMatrix;',

                'uniform vec3 diffuse;',
                'uniform vec3 specular;',

                'uniform vec3 pointLightPositions[NUM_POINT_LIGHTS];',
                'uniform vec3 pointLightColors[NUM_POINT_LIGHTS];',

                'varying vec2 uv;',

                'varying vec3 lightFront;',
                'varying vec3 lightBack;',

                'void main(void) {',
                '   vec4 view_position = modelView * vec4(position, 1.0);',
                '   vec4 view_normal = normalize(normalMatrix * vec4(normal, 0.0));',

                '   uv = texcoord;',

                '   lightFront = lightBack = vec3(0.0);',

                '   for (int i = 0; i < NUM_POINT_LIGHTS; i++) {',
                '       vec4 view_light = view * vec4(pointLightPositions[i], 1.0);',

                '       float dot = dot(view_normal, normalize(view_light - view_position));',

                '       lightFront += max(dot, 0.0) * pointLightColors[i];',
                '       lightBack += max(-dot, 0.0) * pointLightColors[i];',
                '   }',

                '   gl_Position = projection * view_position;',
                '}'
            ].join('\n'),
            [
                'precision mediump float;',

                'uniform sampler2D diffuseMap;',

                'varying vec2 uv;',

                'varying vec3 lightFront;',
                'varying vec3 lightBack;',

                'void main(void) {',
                '   vec3 light = gl_FrontFacing ? lightFront : lightBack;',
                '   gl_FragColor = texture2D(diffuseMap, uv) * vec4(light, 1.0);',
                '}'
            ].join('\n'),
            (function() {
                var matrix = new Matrix3D(),
                    pointLightPositions,
                    pointLightColors;

                return function(uniforms, object, camera, lights) {
                    // modelView matrix
                    matrix.copyFrom(object.localToGlobal).append(camera.globalToLocal);
                    uniforms.MODEL_VIEW = matrix.elements;

                    uniforms.view = camera.globalToLocal.elements;
                    uniforms.projection = camera.projection.elements;

                    // normal matrix
                    // matrix.invert().transpose();
                    matrix.normalMatrix();
                    uniforms.normalMatrix = matrix.elements;

                    uniforms.diffuseMap = object.material.diffuseMap;

                    uniforms.specular = object.material.specular;

                    if (!pointLightPositions || pointLightPositions.length < lights.length * 3) {
                        pointLightPositions = new Float32Array(lights.length * 3);
                    }
                    if (!pointLightColors || pointLightColors.length < lights.length * 3) {
                        pointLightColors = new Float32Array(lights.length * 3);
                    }

                    for (var light, i = 0; light = lights[i]; i++) {
                        pointLightPositions.set(light.localToGlobal.position.elements, i * 3);
                        pointLightColors.set(light.color, i * 3);
                    }

                    uniforms['pointLightPositions[0]'] = pointLightPositions;
                    uniforms['pointLightColors[0]'] = pointLightColors;
                }
            })(),
            {
                modelView: Shader.MODEL_VIEW,
                view: Shader.VIEW,
            }
        )
    }
});
