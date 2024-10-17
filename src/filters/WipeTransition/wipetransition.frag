precision highp float;

uniform sampler2D uSampler;
in vec2 vTextureCoord;
out vec4 color;

uniform float percentage;
uniform float masked_alpha;
uniform float unmasked_alpha;

uniform bool horizontal;
uniform bool invert;

void main() {
    color = texture(uSampler, vTextureCoord);
    
    float uvPOS=vTextureCoord.y;
    float step_value=unmasked_alpha+step(uvPOS,percentage);
    
    if (horizontal) {
        uvPOS=vTextureCoord.x;
    }
    if (invert) {
        step_value = unmasked_alpha+1.0-step(uvPOS, percentage);
    }
    
    color = color * step_value * masked_alpha;
    
    // color.a = (color.a) * step_value * masked_alpha;
}
