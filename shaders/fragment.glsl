#version 300 es
precision highp float;
out vec4 FragColor;
in vec4 vertex_color;
in vec2 vertex_uv;
uniform sampler2D tex;
void main() {
    // FragColor = vertex_color;
    FragColor = texture(tex, vertex_uv);
}