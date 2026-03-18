precision highp float;

uniform sampler2D uSampler;
in vec2 vTextureCoord;
out vec4 color;

uniform sampler2D uTexture;
uniform bool uReplace;

void main() {
    if (uReplace) {
        color = texture(uTexture, vTextureCoord);
    } else {
        vec4 next = texture(uTexture, vTextureCoord);
        color = mix(texture(uSampler, vTextureCoord), next, next.a);
    }
}