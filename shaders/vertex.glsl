#version 300 es
precision highp float;
layout (location = 0) in vec3 vertexCoord;
layout (location = 1) in vec3 vertexColor;
layout (location = 2) in vec2 vertexUV;
layout (location = 4) in vec3 vertexNormal;
uniform mat4 projection;
uniform mat4 view;
uniform mat4 transform;
out vec2 vertex_uv;
out vec3 vertex_normal;
out vec3 frag_coord;
void main() {
	vertex_uv = vertexUV;
	vertex_normal = vertexNormal;
	frag_coord = (transform*vec4(vertexCoord, 1.0)).xyz;
	gl_Position = projection*inverse(view)*vec4(frag_coord, 1.0);
}
