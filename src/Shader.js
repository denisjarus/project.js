function Shader(properties, vertex, fragment) {
    Object.defineProperties(this, {
        id: { value: Shader._counter++ },
        
        properties: { value: properties || [] },

        vertex: { value: vertex },
        fragment: { value: fragment },
    });

    if (!vertex || !fragment) {
        throw new Error();
    }
}

Object.defineProperties(Shader, {
    _counter: { value: 0, writable: true },

    GOURAUD_SHADING: {
        value: [
            '#ifndef PHONG_SHADING',
            '   #define GOURAUD_SHADING',
            '#endif'

        ].join('\n')
    },
    PHONG_SHADING: {
        value: [
            '#ifndef GOURAUD_SHADING',
            '   #define PHONG_SHADING',
            '#endif'

        ].join('\n')
    },
    DIFFUSE_MAP: {
        value: '#define DIFFUSE_MAP'
    }
});

Shader.depthShader = new Shader(
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

    ].join('\n')
);

Shader.textureShader = new Shader(
    [
        'diffuseMap'
    ],
    [
        'attribute vec3 position;',
        'attribute vec2 texcoord;',

        'uniform mat4 modelViewMatrix;',
        'uniform mat4 projectionMatrix;',

        'varying vec2 uv;',

        'void main(void) {',

        '   uv = texcoord;',

        '   gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',

        '}'

    ].join('\n'),
    [
        'precision mediump float;',

        'uniform sampler2D diffuseMap;',

        'varying vec2 uv;',

        'void main(void) {',

        '   gl_FragColor = texture2D(diffuseMap, uv);',

        '}'

    ].join('\n')
);

Shader.gouraudShader = new Shader(
    [
        'diffuseMap'
    ],
    [
        Shader.GOURAUD_SHADING,
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
        'varying vec3 lightBack;',

        'void main(void) {',
        '   vec4 view_position = modelViewMatrix * vec4(position, 1.0);',
        '   vec4 view_normal = normalize(normalMatrix * vec4(normal, 0.0));',

        '   uv = texcoord;',

        '   lightFront = lightBack = vec3(0.0);',

        '   #ifdef GOURAUD_SHADING',

        '   for (int i = 0; i < NUM_POINT_LIGHTS; i++) {',
        '       vec4 view_light = viewMatrix * vec4(pointLightPositions[i], 1.0);',

        '       float dot = dot(view_normal, normalize(view_light - view_position));',

        '       lightFront += max(dot, 0.0) * pointLightColors[i];',
        '       lightBack += max(-dot, 0.0) * pointLightColors[i];',
        '   }',

        '   #endif',

        '   gl_Position = projectionMatrix * view_position;',
        '}'

    ].join('\n'),
    [
        'precision mediump float;',

        Shader.DIFFUSE_MAP,

        'uniform sampler2D diffuseMap;',

        'varying vec2 uv;',

        'varying vec3 lightFront;',
        'varying vec3 lightBack;',

        'void main(void) {',
        '   vec3 light = gl_FrontFacing ? lightFront : lightBack;',
        '   gl_FragColor = texture2D(diffuseMap, uv) * vec4(light, 1.0);',
        '}'
        
    ].join('\n')
);

// var testShader = new Shader(
//     [
//         'position',
//         'texcoord'
//     ],
//     [
//         'diffuseMap'
//     ]

// );
