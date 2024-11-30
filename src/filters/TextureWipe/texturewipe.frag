#version 300 es

precision highp float;

uniform sampler2D uSampler;
in vec2 vTextureCoord;
out vec4 color;

uniform float progress;
uniform sampler2D wipeSampler;
uniform sampler2D bgSampler;

void main() {
    vec4 wipe = texture(wipeSampler, vTextureCoord);

    if (wipe.b <= progress) {
        color = texture(bgSampler, vTextureCoord);
    } else {
        color = texture(uSampler, vTextureCoord);
    }
}