function GouraudMaterial() {

    TextureMaterial.call(this);

    Object.defineProperties(this, {

    });
}

GouraudMaterial.prototype = Object.create(TextureMaterial.prototype, {
    shader: {
        value: new Shader(
            [
                'attribute vec3 position;',
                'attribute vec2 texcoord;',
                'attribute vec3 normal;',

                'uniform mat4 modelView;',
                'uniform mat4 projection;',

                'uniform mat4 view;',
                'uniform mat4 normalMatrix;',

                'uniform vec3 pointLights[1];',

                'varying vec2 uv;',

                'varying float lightFront;',
                'varying float lightBack;',

                'void main(void) {',
                '   vec4 view_position = modelView * vec4(position, 1.0);',
                '   vec3 view_normal = mat3(normalMatrix) * normal;',

                '   uv = texcoord;',

                '   lightFront = 0.0;',
                '   lightBack = 0.0;',

                '   for (int i = 0; i < 1; i++) {',
                '       vec4 view_light = view * vec4(pointLights[i], 1.0);',

                '       float dot = dot(view_normal, normalize(view_light.xyz - view_position.xyz));',

                '       lightFront += max(dot, 0.0);',
                '       lightBack += max(-dot, 0.0);',
                '   }',

                '   gl_Position = projection * view_position;',
                '}'
            ].join('\n'),
            [
                'precision mediump float;',

                'uniform sampler2D diffuseMap;',

                'varying vec2 uv;',

                'varying float lightFront;',
                'varying float lightBack;',

                'void main(void) {',
                '   vec3 light = gl_FrontFacing ? vec3(lightFront) : vec3(lightBack);',
                '   gl_FragColor = texture2D(diffuseMap, uv) * vec4(light, 1.0);',
                '}'
            ].join('\n'),
            (function() {
                var matrix = new Matrix3D();
                return function(uniforms, object, camera, lights) {
                    // modelView matrix
                    matrix.copyFrom(object.localToGlobal).append(camera.globalToLocal);
                    uniforms.modelView = matrix.elements;

                    uniforms.view = camera.localToGlobal.elements;
                    uniforms.projection = camera.projection.elements;

                    // normal matrix
                    matrix.invert().transpose();
                    uniforms.normalMatrix = matrix.elements;

                    uniforms.diffuseMap = object.material.diffuseMap;

                    uniforms['pointLights[0]'] = lights[0].localToGlobal.position.elements;
                }
            })()

        )
    }
});
