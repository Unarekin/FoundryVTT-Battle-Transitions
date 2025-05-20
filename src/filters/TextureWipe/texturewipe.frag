#version 300 es

precision highp float;

uniform sampler2D uSampler;
in vec2 vTextureCoord;
out vec4 color;

uniform float progress;
uniform sampler2D wipeSampler;
uniform sampler2D bgSampler;
uniform float falloff;

void main() {
    vec4 wipe = texture(wipeSampler, vTextureCoord);
    float val = wipe.b;

    if (val <= progress) {
        color = texture(bgSampler, vTextureCoord);
    } else if (val <= progress + falloff) {
        float amt = smoothstep(progress, progress+falloff, val);
        color = mix(texture(bgSampler, vTextureCoord), texture(uSampler, vTextureCoord), amt);
    } else {
        color = texture(uSampler, vTextureCoord);
    }
}