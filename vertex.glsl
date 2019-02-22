#version 300 es
precision highp float;
layout (location = 0) in vec3 vertexCoord;
layout (location = 1) in vec3 vertexColor;
layout (location = 2) in vec2 vertexUV;
layout (location = 4) in vec3 vertexNormal;
uniform mat4 projection;
uniform mat4 camera;
uniform mat4 transform;
out vec4 vertex_color;
out vec2 vertex_uv;
void main() {
	vertex_color = vec4(vertexColor, 1.0);
	vertex_uv = vertexUV;
	gl_Position = camera*transform*vec4(vertexCoord, 1.0);
}
