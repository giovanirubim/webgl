#version 300 es
precision highp float;
out vec4 FragColor;
in vec2 vertex_uv;
in vec3 vertex_normal;
in vec3 vertex_color;
in vec3 light_pos;
uniform sampler2D texture_1;
uniform sampler2D texture_2;
void main() {
    FragColor = vec4(vertex_color, 1.0);
}