#version 300 es

precision highp float;

uniform sampler2D uSampler;
in vec2 vTextureCoord;
out vec4 color;

uniform float progress;
uniform float[512] offsets;
uniform sampler2D uBackground;

void main() {
    vec2 tex_uv = vTextureCoord;

    float index = tex_uv.x * float(offsets.length());
    tex_uv.y -= progress * offsets[int(index)];

    // float index = tex_uv.x * float(offsets.length());
    // tex_uv.y -= progress * offsets[int(index)];

    color = texture(uSampler, tex_uv);
    if (tex_uv.y < 0.0 || tex_uv.y > 1.0) color = texture(uBackground, vTextureCoord); // texture(uBackground, vTextureCoord);
}
