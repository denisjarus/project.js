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

				'uniform mat4 model;',
				'uniform mat4 view;',
				'uniform mat4 projection;',

                'uniform vec3 pointLights[2];',

                'varying vec2 uv;',

                'varying float intensity;',

				'void main(void) {',
                '   vec4 global_position = model * vec4(position, 1.0);',
                '   vec4 global_normal = normalize(vec4(mat3(model) * normal, 0.0));',

                '   uv = texcoord;',

                '   intensity = 0.0;',

                '   for (int i = 0; i < 1; i++) {',
                '       intensity += dot(global_normal, normalize(global_position - vec4(pointLights[i], 0.0)));',
                '   }',

				'	gl_Position = projection * view * global_position;',
				'}'
			].join('\n'),
			[
				'precision mediump float;',

                'uniform sampler2D diffuseMap;',

                'varying vec2 uv;',

                'varying float intensity;',

				'void main(void) {',
				'	gl_FragColor = texture2D(diffuseMap, uv) * vec4(vec3(min(intensity, 1.0)), 1.0);',
				'}'
			].join('\n'),
			function(uniforms, object, camera, lights) {
				uniforms.model = object.localToGlobal.elements;
				uniforms.view = camera.globalToLocal.elements;
				uniforms.projection = camera.projection.elements;

                uniforms.diffuseMap = object.material.diffuseMap;

                uniforms['pointLights[0]'] = lights[0].localToGlobal.position.elements;
			}
		)
	}
});