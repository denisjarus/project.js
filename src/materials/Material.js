function Material() {
    
    EventDispatcher.call(this);

    Object.defineProperties(this, {
        id: { value: Material._counter++ }
    });
}

Material.prototype = Object.create(EventDispatcher.prototype, {
    shader: {
        value: new Shader(
            [
                'attribute vec3 position;',

                'uniform mat4 model;',
                'uniform mat4 view;',
                'uniform mat4 projection;',

                'void main(void) {',

                '   gl_Position = projection * view * model * vec4(position, 1.0);',

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
            function(context, program) {
                var model = context.getUniformLocation(program, 'model'),
                    view = context.getUniformLocation(program, 'view'),
                    projection = context.getUniformLocation(program, 'projection'),
                    far = context.getUniformLocation(program, 'far');

                return function(object, camera) {
                    context.uniformMatrix4fv(model, false, object.localToGlobal.elements);
                    context.uniformMatrix4fv(view, false, camera.globalToLocal.elements);
                    context.uniformMatrix4fv(projection, false, camera.projection.elements);

                    context.uniform1f(far, camera.far);
                }
            }
        )
    }
});

Object.defineProperties(Material, {
    _counter: { value: 0, writable: true }
});
