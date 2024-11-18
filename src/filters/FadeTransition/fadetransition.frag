#version 300 es
precision highp float;

uniform sampler2D uSampler;
in vec2 vTextureCoord;
out vec4 color;

uniform float progress;
uniform sampler2D bgColor;

void main() {
    color = mix(texture(uSampler, vTextureCoord), texture(bgColor, vTextureCoord), progress);
}