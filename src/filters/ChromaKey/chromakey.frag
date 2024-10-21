precision highp float;

uniform sampler2D uSampler;
in vec2 vTextureCoord;
out vec4 color;

uniform vec4 chromaKey;
uniform vec2 maskRange;
uniform sampler2D bgSampler;
uniform vec2 iResolution;

mat4 RGBtoYUV = mat4(0.257,  0.439, -0.148, 0.0,
                     0.504, -0.368, -0.291, 0.0,
                     0.098, -0.071,  0.439, 0.0,
                     0.0625, 0.500,  0.500, 1.0 );


//compute color distance in the UV (CbCr, PbPr) plane
float colorClose(vec3 yuv, vec3 keyYuv, vec2 tol)
{
    float tmp = sqrt(pow(keyYuv.g - yuv.g, 2.0) + pow(keyYuv.b - yuv.b, 2.0));
    if (tmp < tol.x)
      return 0.0;
   	else if (tmp < tol.y)
      return (tmp - tol.x)/(tol.y - tol.x);
   	else
      return 1.0;
}

void main() {
  vec2 fragPos = vTextureCoord.xy / iResolution.xy;
  vec4 texColor0 = texture(uSampler, fragPos);
  vec4 texColor1 = texture(bgSampler, fragPos);

  vec4 keyYUV = RGBtoYUV * chromaKey;
  vec4 yuv = RGBtoYUV * texColor0;

  float mask = 1.0 - colorClose(yuv.rgb, keyYUV.rgb, maskRange);
  color = max(texColor0 - mask * chromaKey, 0.0) + texColor1 * mask;
}

// precision highp float;

// uniform sampler2D uSampler;
// in vec2 vTextureCoord;
// out vec4 color;

// uniform vec4 keyRGBA;
// uniform vec2 keyCC;
// uniform vec2 range;
// uniform vec2 iResolution;
// uniform sampler2D bgSampler;

// vec2 RGBToCC(vec4 rgba) {
//     float Y = 0.299 * rgba.r + 0.587 * rgba.g + 0.114 * rgba.b;
//     return vec2((rgba.b - Y) * 0.565, (rgba.r - Y) * 0.713);
// }

// void main() {
//     vec4 src1Color = texture(uSampler, vTextureCoord);
//     vec2 CC = RGBToCC(src1Color);
//     float mask = sqrt(pow(keyCC.x - CC.x, 2.0) + pow(keyCC.y - CC.y, 2.0));
//     mask = smoothstep(range.x, range.y, mask);
//     if (mask == 0.0) {
//         color = texture(bgSampler, vTextureCoord);
//     }
//     else if (mask == 1.0) {
//         color = src1Color;
//     }
//     else {
//         color = max(src1Color - (1.0 - mask) * keyRGBA, 0.0);
//     }
// }
