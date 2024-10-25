precision highp float;

uniform sampler2D uSampler;
in vec2 vTextureCoord;
out vec4 color;

uniform sampler2D uTexture;

void main() {
    color = texture(uTexture, vTextureCoord);
}