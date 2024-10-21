import { coerceTexture } from '../../coercion';
import { createColorTexture } from '../../utils';
import { CustomFilter } from '../CustomFilter';
import frag from "./chromakey.frag";

// type ChromaKeyUniforms = {
//   keyRGBA: [number, number, number, number],
//   keyCC: [number, number],
//   range: [number, number],
//   iResolution: [number, number],
//   bgSampler: PIXI.Texture
// }

/*
uniform vec4 chromaKey;
uniform vec2 maskRange;
uniform sampler2D bgSampler;
uniform vec2 iResolution;
*/

type ChromaKeyUniforms = {
  chromaKey: [number, number, number, number];
  maskRange: [number, number];
  bgSampler: PIXI.Texture;
  iResolution: [number, number];
}


function RGBAToCC(r: number, g: number, b: number): [number, number] {
  const y = 0.299 * r + 0.587 * g + 0.114 * b;
  return [(b - y) * 0.565, (r - y) * 0.713];
}



export class ChromaKeyFilter extends CustomFilter<ChromaKeyUniforms> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(keyColor: PIXI.ColorSource = [0.05, 0.63, 0.14, 1], bg: PIXI.TextureSource | PIXI.ColorSource = "transparent") {
    const color = new PIXI.Color(keyColor);
    const bgSampler = coerceTexture(bg) ?? createColorTexture("transparent");

    const uniforms: ChromaKeyUniforms = {
      // chromaKey: [color.red, color.green, color.blue, 1],
      chromaKey: [color.red, color.green, color.blue, 1],
      bgSampler,
      maskRange: [.005, .26],
      iResolution: [1, 1]
    };

    // const uniforms: ChromaKeyUniforms = {
    //   // range: [0.11, 0.22],
    //   range: [.11, .15],
    //   keyRGBA: [color.red, color.green, color.blue, 1],
    //   keyCC: RGBAToCC(color.red, color.green, color.blue),
    //   iResolution: [window.innerWidth, window.innerHeight],
    //   bgSampler
    // };

    super(undefined, frag, uniforms);
  }
}