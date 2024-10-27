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
    if (tex_uv.y < 0.0 || tex_uv.y > 1.0) color = vec4(0.0); // texture(uBackground, vTextureCoord);
}

// precision highp float;

// uniform sampler2D uSampler;
// in vec2 vTextureCoord;
// out vec4 color;

// uniform float progress;
// uniform float meltiness;
// uniform vec2 texture_size;

// float pseudo_rand(float x) {
//     return mod(x * 2048103.0 + cos(x * 1912.0), 1.0);
// }

// void main() {
//     vec2 uv = vec2(vTextureCoord.x, vTextureCoord.y);

//     uv.y -= progress / vTextureCoord.y;
//     uv.y -= progress * meltiness * pseudo_rand(vTextureCoord.x - mod(vTextureCoord.x, texture_size.x));

//     color = texture(uSampler, uv);
//     if (uv.y <= 0.0) {

//     }
// }