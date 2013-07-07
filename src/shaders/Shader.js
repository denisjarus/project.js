function Shader(vertex, fragment, uniform) {
    Object.defineProperties(this, {
        id: { value: Shader._counter++ },

        vertex: { value: vertex },

        fragment: { value: fragment },

        uniform: { value: uniform }
    });
}

Object.defineProperties(Shader, {
    _counter: { value: 0, writable: true },
});

const BASIC_SHADER = new Shader(
    [
        'attribute vec3 position;',
        'attribute vec3 normal;',

        'uniform mat4 modelView;',
        'uniform mat4 projection;',

        'uniform vec3 light;',

        'varying float diffuse;',

        'void main(void) {',

        '   vec4 position = modelView * vec4(position, 1.0);',
        '   vec4 normal = normalize(vec4(mat3(modelView) * normal, 1.0));',

        '   diffuse = max(dot(normal, normalize(vec4(light, 1.0) - position)), 0.0);',

        '   gl_Position = projection * position;',

        '}'

    ].join('\n'),
    [
        'precision mediump float;',

        'uniform vec3 color;',

        'varying float diffuse;',

        'void main(void) {',

        '   gl_FragColor = vec4(color * diffuse, 1.0);',

        '}'

    ].join('\n'),
    (function() {
        var matrix = new Matrix3D(),
            vector = new Vector3D();

        return function(uniforms, object, camera, lights) {
            uniforms.projection = camera.projection.elements;

            uniforms.color = object.material.color;

            vector.copyFrom(lights[0].localToGlobal.position).transform(camera.globalToLocal);
            uniforms.light = vector.elements;

            matrix.copyFrom(object.localToGlobal).append(camera.globalToLocal);
            uniforms.modelView = matrix.elements;
        }
    })()
);