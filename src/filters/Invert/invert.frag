#version 300 es

precision highp float;

uniform sampler2D uSampler;
in vec2 vTextureCoord;
out vec4 color;

void main() {
    color = 1.0 - texture(uSampler, vTextureCoord);
    color.a = 1.0;
}