#version 300 es
precision highp float;
out vec4 FragColor;
in vec3 frag_coord;
in vec2 frag_uv;
in vec3 frag_normal;
in vec3 frag_color;
in vec3 eye_coord;
uniform sampler2D texture_1;

struct Light {
	vec3 coord;
	vec3 color;
	float strength;
};

void main() {

	// Light ambient_light = Light(vec3(0.0), vec3(1.0), 0.2);
	// Light array[2];

	// array[0] = Light(vec3(5.0, 5.0, -5.0), vec3(1.0, 1.0, 1.0), 1.0);
	// array[1] = Light(vec3(-8.0, -2.0, -8.0), vec3(0.0, 0.3, 1.0), 0.2);
	
	// vec3 total_light = ambient_light.color*ambient_light.strength;
	// vec3 view_dir = normalize(eye_coord - frag_coord);

	// for (int n = array.length(); n-- > 0;) {
	// 	Light light = array[n];
	// 	vec3 dir = normalize(frag_coord - light.coord);
	// 	vec3 reflection_dir = reflect(dir, -frag_normal);
	// 	float difuse = max(dot(-frag_normal, dir), 0.0);
	// 	float specular = pow(max(dot(view_dir, reflection_dir), 0.0), 32.0);
	// 	total_light += (difuse + specular)*light.strength;
	// }

	// FragColor = vec4(total_light, 1.0)*texture(texture_1, frag_uv);

	FragColor = vec4(0.0, 0.5, 1.0, 1.0);

}

/* @fragment */
