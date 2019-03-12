#version 300 es
precision highp float;
out vec4 FragColor;
in vec3 frag_coord;
in vec2 frag_uv;
in vec3 frag_normal;
in vec3 frag_color;
uniform sampler2D texture_1;

struct Light {
	vec3 coord;
	vec3 color;
	float strength;
};

void main() {

	Light ambient_light = Light(vec3(0.0), vec3(1.0), 0.0);
	Light array[2];

	array[0] = Light(vec3(2.0, 8.0, -8.0), vec3(1.0, 0.9, 0.8), 0.7);
	array[1] = Light(vec3(-8.0, -2.0, -8.0), vec3(0.0, 0.3, 1.0), 0.2);
	
	vec3 total_light = ambient_light.color*ambient_light.strength;

	for (int n = array.length(); n-- > 0;) {
		Light light = array[n];
		vec3 dir = normalize(light.coord - frag_coord);
		total_light = total_light + max(dot(frag_normal, dir), 0.0)*light.color*light.strength;
	}

 	FragColor = vec4(frag_color*total_light, 1.0);
}