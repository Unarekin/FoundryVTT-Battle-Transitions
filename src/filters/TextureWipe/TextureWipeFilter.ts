import frag from "./texturewipe.frag";
import { CustomFilter } from '../CustomFilter';
import { createColorTexture } from '../../utils';
import { coerceTexture } from "../../coercion";

type TextureWipeUniforms = {
  progress: number;
  wipeSampler: PIXI.Texture;
  bgSampler: PIXI.Texture;
  falloff: number;
}


const transparentTexture = createColorTexture(new PIXI.Color("#00000000"));

export class TextureWipeFilter extends CustomFilter<TextureWipeUniforms> {

  constructor(wipeSampler: PIXI.Texture)
  constructor(wipeSmapler: PIXI.Texture, falloff: number)
  constructor(wipeSampler: PIXI.Texture, bgSampler: PIXI.Texture)
  constructor(wipeSampler: PIXI.Texture, falloff: number, bgSampler: PIXI.Texture)
  constructor(wipeSampler: PIXI.Texture, ...args: unknown[]) {
    const falloff = typeof args[0] === "number" ? args[0] : 0;
    const bg = typeof args[args.length - 1] !== "number" ? args[args.length - 1] : "transparent";
    const bgSampler = coerceTexture(bg) ?? transparentTexture;
    super(undefined, frag, {
      progress: 0,
      wipeSampler,
      falloff,
      bgSampler
    });
  }
}