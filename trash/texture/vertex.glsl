#version 300 es
precision highp float;
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aColor1;
out vec3 aColor2;
uniform mat4 model;
void main() {
	aColor2 = aColor1;
	float m = 1.0/(aPos.z*0.001 + 1.0);
	gl_Position = model*vec4(aPos.x*m, aPos.y*m, aPos.z, 1.0);
}