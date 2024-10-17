precision highp float;

uniform sampler2D uSampler;
in vec2 vTextureCoord;
out vec4 color;

uniform float progress;
uniform float size;
uniform bool fill;
uniform vec2 screen_size;

void main() {
    color = texture(uSampler, vTextureCoord);
    
    vec2 screenCoord = screen_size * vTextureCoord;
    
    float x = abs(fract(screenCoord.x / size) - 0.5);
    float y = abs(fract(screenCoord.y / size) - 0.5);
    
    if (x + y + vTextureCoord.x > progress * 2.0) {
        if (!fill) {
            color = vec4(0.0);
        }
    } else if (fill) {
        color = vec4(0.0);
    }
}