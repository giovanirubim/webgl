#version 300 es
precision highp float;
out vec4 FragColor;
in vec4 vertex_color;
in vec2 vertex_uv;
uniform sampler2D texture_1;
void main() {
    vec4 a = texture(texture_1, vertex_uv);
    vec4 b = vertex_color;
    FragColor = mix(a, b, 0.8);
}