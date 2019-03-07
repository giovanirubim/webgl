#version 300 es
precision highp float;
out vec4 FragColor;
in vec2 vertex_uv;
in vec3 vertex_normal;
in vec3 light_pos;
uniform sampler2D texture_1;
uniform sampler2D texture_2;
void main() {
    float x = sin(gl_FragCoord.x*0.5)*0.5 + 0.5;
    float y = sin(gl_FragCoord.y*0.5)*0.5 + 0.5;
    float z = sin(gl_FragCoord.z*0.5)*0.5 + 0.5;
    FragColor = vec4(x, y, z, 1.0);
}