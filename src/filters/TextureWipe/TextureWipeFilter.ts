/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import frag from "./texturewipe.frag";
import { CustomFilter } from '../CustomFilter';
import { createColorTexture } from '../../utils';

type TextureWipeUniforms = {
  progress: number;
  wipeSampler: PIXI.Texture;
  bgSampler: PIXI.Texture;
}


const transparentTexture = createColorTexture(new PIXI.Color("#00000000"));

export class TextureWipeFilter extends CustomFilter<TextureWipeUniforms> {

  constructor(wipeSampler: PIXI.Texture, bgSampler?: PIXI.Texture) {
    const uniforms: TextureWipeUniforms = {
      progress: 0,
      wipeSampler,
      bgSampler: bgSampler ?? transparentTexture
    }

    super(undefined, frag, uniforms);
  }
}