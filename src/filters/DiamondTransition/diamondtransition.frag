precision highp float;

uniform sampler2D uSampler;
in vec2 vTextureCoord;
out vec4 color;

uniform float progress;
uniform float size;
uniform vec2 screen_size;
uniform sampler2D bgSampler;

void main() {
    vec2 screenCoord = screen_size * vTextureCoord;
    
    float x = abs(fract(screenCoord.x / size) - 0.5);
    float y = abs(fract(screenCoord.y / size) - 0.5);
    
    if (x + y + vTextureCoord.x > progress * 2.0) {
        color = texture(uSampler, vTextureCoord);
    } else {
        color = texture(bgSampler, vTextureCoord);
    }
}