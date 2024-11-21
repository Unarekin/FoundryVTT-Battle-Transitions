#version 300 es

precision highp float;

uniform sampler2D uSampler;
in vec2 vTextureCoord;
out vec4 color;

uniform vec2 center;
uniform float amount;

uniform bool clampBounds;
uniform sampler2D bgSampler;

void main() {
    // color = texture(uSampler, vTextureCoord);

    vec2 zoomed_uv = (vTextureCoord - center) * amount + center;
    // Clamp to boundaries
    if (clampBounds) {
        zoomed_uv = clamp(zoomed_uv, vec2(0.0), vec2(1.0));
    }

    if (zoomed_uv.x < 0.0 || zoomed_uv.x > 1.0 || zoomed_uv.y < 0.0 || zoomed_uv.y > 1.0) {
        color = texture(bgSampler, zoomed_uv);
    } else {
        // vec2 tex_uv = vec2(zoomed_uv.x, 1.0 - zoomed_uv.y)
        color = texture(uSampler, zoomed_uv);
    }
}