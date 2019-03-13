#version 300 es
precision highp float;
layout (location = 0) in vec3 vertexCoord;
layout (location = 1) in vec3 vertexColor;
layout (location = 2) in vec2 vertexUV;
layout (location = 3) in vec3 vertexNormal;
uniform mat4 projection;
uniform mat4 view;
uniform mat4 transform;
out vec3 frag_coord;
out vec2 frag_uv;
out vec3 frag_normal;
out vec3 frag_color;
out vec3 eye_coord;
void main() {
	vec4 coord = transform*vec4(vertexCoord, 1.0);
	frag_coord = coord.xyz;
	frag_uv = vertexUV;
	frag_normal = (transform*vec4(vertexNormal, 1.0)).xyz;
	frag_color = vertexColor;
	eye_coord = view[3].xyz;
	gl_Position = projection*inverse(view)*coord;
}

/* @vertex */
