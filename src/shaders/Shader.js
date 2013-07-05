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

        'uniform mat4 modelView;',
        'uniform mat4 projection;',

        'uniform vec3 light;',

        'varying float diffuse;',

        'void main(void) {',

        '   vec3 normal = normalize(mat3(modelView) * position);',
        '   diffuse = 1.0;',

        '   gl_Position = projection * modelView * vec4(position, 1.0);',

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
            light = new Vector3D();

        return function(uniforms, object, camera, lights) {
            uniforms.projection = camera.projection.elements;

            uniforms.color = object.material.color;

            light.x = lights[0].x;
            light.y = lights[0].y;
            light.z = lights[0].z;
            uniforms.light = light.elements;

            matrix.copyFrom(object.localToGlobal).append(camera.globalToLocal);
            uniforms.modelView = matrix.elements;
        }
    })()
);