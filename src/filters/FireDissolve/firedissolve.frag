precision highp float;

in vec2 vTextureCoord;
out vec4 color;

uniform sampler2D uSampler;
uniform sampler2D noise_texture;
uniform sampler2D burn_texture;

uniform float integrity;
uniform float burn_size;

float inverse_lerp(float a, float b, float v) {
    return (v - a) / (b - a);
}

void main() {
    float noise = texture(noise_texture, vTextureCoord).r * vTextureCoord.y;
    vec4 base_color = texture(uSampler, vTextureCoord) * step(noise, integrity);
    vec2 burn_uv = vec2(inverse_lerp(integrity, integrity * burn_size, noise), 0.0);
    vec4 burn_color = texture(burn_texture, burn_uv) * step(noise, integrity * burn_size);
    
    color = mix(burn_color, base_color, base_color.a);
    // color = texture(uSampler, vTextureCoord);
}