import frag from "./texturewipe.frag";
import { CustomFilter } from '../CustomFilter';

type TextureWipeUniforms = {
  progress: number;
  wipeSampler: PIXI.Texture;
  bgSampler: PIXI.Texture;
  falloff: number;
}


// const transparentTexture = createColorTexture(new PIXI.Color("#00000000"));

export class TextureWipeFilter extends CustomFilter<TextureWipeUniforms> {

  constructor(wipeSampler: PIXI.Texture, falloff: number, bg: PIXI.Texture) {
    super(undefined, frag, {
      progress: 0,
      wipeSampler,
      falloff,
      bgSampler: bg
    });
  }
}