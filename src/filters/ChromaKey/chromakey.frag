#version 300 es

precision highp float;

uniform sampler2D uSampler;
in vec2 vTextureCoord;
out vec4 color;
uniform sampler2D uBgSampler;

uniform vec4 keyRGBA;
uniform vec2 keyCC;
uniform vec2 range;
// uniform vec2 iResolution;

vec2 RGBToCC(vec4 rgba) {
    float Y = 0.299 * rgba.r + 0.587 * rgba.g + 0.114 * rgba.b;
    return vec2((rgba.b - Y) * 0.565, (rgba.r - Y) * 0.713);
}

void main() {
    vec4 src1Color = texture(uSampler, vTextureCoord);
    vec2 CC = RGBToCC(src1Color);

    float mask = sqrt(pow(keyCC.x - CC.x, 2.0) + pow(keyCC.y - CC.y, 2.0));
    mask = smoothstep(range.x, range.y, mask);

    if (mask == 0.0) color = texture(uBgSampler, vTextureCoord);
    else if (mask == 1.0) color = src1Color;
    else color = max(src1Color - (1.0 - mask) * keyRGBA, 0.0);
}