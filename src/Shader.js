function Shader(attributes, uniforms, vertexShader, fragmentShader) {
    Object.defineProperties(this, {
        id: { value: Shader._counter++ },

        vertexShader: { value: vertexShader },
        fragmentShader: { value: fragmentShader },

        attributes: { value: attributes || [] },
        uniforms: { value: uniforms || [] },
    });

    if (!vertexShader || !fragmentShader) {
        throw new Error();
    }
}

Object.defineProperties(Shader, {
    _counter: { value: 0, writable: true }
});

Shader.depthShader = new Shader(
    [
        'position'
    ],
    null,
    [
        'attribute vec3 position;',

        'uniform mat4 modelViewMatrix;',
        'uniform mat4 projectionMatrix;',

        'void main(void) {',

        '   gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',

        '}'

    ].join('\n'),
    [
        'precision mediump float;',

        'uniform float far;',

        'void main(void) {',

        '   float depth = gl_FragCoord.z / gl_FragCoord.w;',

        '   gl_FragColor = vec4(vec3(1.0 - depth / far), 1.0);',

        '}'

    ].join('\n'),
    {
        position: Geometry.POSITION,
        modelViewMatrix: 'modelViewMatrix',
        projectionMatrix: 'projectionMatrix',
        far: 'far'
    }
);

Shader.gouraudShader = new Shader(
    [
        'position',
        'texcoord',
        'normal'
    ],
    [
        'diffuseMap'
    ],
    [
        '#define TWO_SIDED',
        '#define NUM_POINT_LIGHTS 5',

        'attribute vec3 position;',
        'attribute vec2 texcoord;',
        'attribute vec3 normal;',

        'uniform mat4 modelViewMatrix;',
        'uniform mat4 viewMatrix;',
        'uniform mat4 projectionMatrix;',
        'uniform mat4 normalMatrix;',

        'uniform vec3 pointLightPositions[NUM_POINT_LIGHTS];',
        'uniform vec3 pointLightColors[NUM_POINT_LIGHTS];',

        'varying vec2 uv;',

        'varying vec3 lightFront;',
        
        '#ifdef TWO_SIDED',

            'varying vec3 lightBack;',

        '#endif',

        'void main(void) {',
        '   vec4 view_position = modelViewMatrix * vec4(position, 1.0);',
        '   vec4 view_normal = normalize(normalMatrix * vec4(normal, 0.0));',

        '   uv = texcoord;',

        '   lightFront = vec3(0.0);',

        '   #ifdef TWO_SIDED',

        '       lightBack = vec3(0.0);',

        '   #endif',

        '   for (int i = 0; i < NUM_POINT_LIGHTS; i++) {',
        '       vec4 view_light = viewMatrix * vec4(pointLightPositions[i], 1.0);',

        '       float dot = dot(view_normal, normalize(view_light - view_position));',

        '       lightFront += max(dot, 0.0) * pointLightColors[i];',

        '       #ifdef TWO_SIDED',

        '           lightBack += max(-dot, 0.0) * pointLightColors[i];',

        '       #endif',
        '   }',

        '   gl_Position = projectionMatrix * view_position;',
        '}'

    ].join('\n'),
    [
        '#define TWO_SIDED',

        'precision mediump float;',

        'uniform sampler2D diffuseMap;',

        'varying vec2 uv;',

        'varying vec3 lightFront;',

        '#ifdef TWO_SIDED',

        '   varying vec3 lightBack;',

        '#endif',

        'void main(void) {',

        '   #ifdef TWO_SIDED',

        '       vec3 light = gl_FrontFacing ? lightFront : lightBack;',

        '   #else',

        '       vec3 light = gl_FrontFacing ? lightFront : vec3(0.0);',

        '   #endif',

        '   gl_FragColor = texture2D(diffuseMap, uv) * vec4(light, 1.0);',
        '}'
        
    ].join('\n')
);

Shader.cubeMap = new Shader(
    [
        'position'
    ],
    [
        'cubeMap'
    ],
    [
        'attribute vec3 position;',

        'uniform mat4 modelMatrix;',
        'uniform mat4 modelViewMatrix;',
        'uniform mat4 projectionMatrix;',

        'varying vec3 vPosition;',

        'void main(void) {',

            'vec4 world_position = modelMatrix * vec4(position, 1.0);',

            'vPosition = world_position.xyz;',

            'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',

        '}'

    ].join('\n'),
    [
        'precision mediump float;',

        'varying vec3 vPosition;',

        'uniform samplerCube cubeMap;',

        'void main(void) {',

            'gl_FragColor = textureCube(cubeMap, vPosition);',

        '}'

    ].join('\n')
);
