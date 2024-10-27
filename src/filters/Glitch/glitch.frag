#version 300 es

precision highp float;

uniform sampler2D uSampler;
in vec2 vTextureCoord;
out vec4 color;

uniform float progress;
uniform float shake_power;
uniform float shake_block_size;
uniform vec2 direction_r;
uniform vec2 direction_g;
uniform vec2 direction_b;
uniform sampler2D background;

float random(float seed) {
    return fract(543.2543 * sin(dot(vec2(seed, seed), vec2(3525.46, -54.3415))));
}

void main() {
    vec2 fixed_uv = vTextureCoord;
    fixed_uv.x += (
        random(
            (trunc(vTextureCoord.y * shake_block_size) / shake_block_size)
            +	progress) - 0.5) * shake_power * (progress * 12.0);

    color = 
    vec4(
        textureLod(uSampler, fixed_uv + normalize(direction_r) * progress, 0.0).r
        ,	textureLod(uSampler, fixed_uv + normalize(direction_g) * progress, 0.0).g
        ,	textureLod(uSampler, fixed_uv + normalize(direction_b) * progress, 0.0).b
        ,	0.0) * (1.0 - progress);
    // * texture(background, vTextureCoord);
    color.a = 1.0;
}
