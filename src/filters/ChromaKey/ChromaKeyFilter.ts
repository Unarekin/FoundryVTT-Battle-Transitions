import { coerceTexture } from '../../coercion';
import { TextureLike } from '../../types';
import { createColorTexture } from '../../utils';
import { CustomFilter } from '../CustomFilter';
import frag from "./chromakey.frag";

type ChromaKeyUniforms = {
  keyRGBA: [number, number, number, number],
  keyCC: [number, number],
  range: [number, number],
  uBgSampler: PIXI.Texture
}


function rgbaToCC(r: number, g: number, b: number) {
  const y = 0.299 * r + 0.587 * g + 0.114 * b;
  return [(b - y) * 0.565, (r - y) * 0.713];
}



export class ChromaKeyFilter extends CustomFilter<ChromaKeyUniforms> {

  constructor(keyColor: PIXI.ColorSource = [0.05, 0.63, 0.14, 1], range: [number, number] = [0.11, 0.22], bg: TextureLike = "transparent") {
    const color = new PIXI.Color(keyColor);
    const keyCC = rgbaToCC(color.red, color.green, color.blue) as [number, number];

    const bgSampler = coerceTexture(bg) || createColorTexture("transparent");

    const uniforms: ChromaKeyUniforms = {
      keyRGBA: [color.red, color.green, color.blue, 1],
      keyCC,
      range,
      uBgSampler: bgSampler
    };

    super(undefined, frag, uniforms);
  }
}