import frag from "./texturewipe.frag";
import { CustomFilter } from '../CustomFilter';
import { createColorTexture } from '../../utils';

type TextureWipeUniforms = {
  progress: number;
  wipeSampler: PIXI.Texture;
  bgSampler: PIXI.Texture;
}

const WipePresets: { [x: string]: PIXI.Texture } = {
  linear_horizontal: PIXI.Texture.from(`/modules/${__MODULE_ID__}/assets/wipes/linear-horizontal.webp`),
  linear_vertical: PIXI.Texture.from(`/modules/${__MODULE_ID__}/assets/wipes/linear-vertical.webp`),
  linear_diagonal: PIXI.Texture.from(`/modules/${__MODULE_ID__}/assets/wipes/linear-diagonal.webp`),
  radial: PIXI.Texture.from(`/modules/${__MODULE_ID__}/assets/wipes/radial.webp`),
  bilinear_horizontal: PIXI.Texture.from(`/modules/${__MODULE_ID__}/assets/wipes/bilinear-horizontal.webp`),
  bilinear_vertical: PIXI.Texture.from(`/modules/${__MODULE_ID__}/assets/wipes/bilinear-vertical.webp`)
};

const SamplerPresets: { [x: string]: PIXI.Texture } = {
  transparent: createColorTexture(new PIXI.Color("#00000000")),
  black: createColorTexture(new PIXI.Color("#000000")),
  white: createColorTexture(new PIXI.Color("#FFFFFF"))
}

export class TextureWipeFilter extends CustomFilter<TextureWipeUniforms> {

  static WipePresets = WipePresets;
  static SamplerPresets = SamplerPresets;

  constructor(wipeSampler: PIXI.Texture, bgSampler?: PIXI.Texture) {
    const uniforms: TextureWipeUniforms = {
      progress: 0,
      wipeSampler,
      bgSampler: bgSampler ?? SamplerPresets.transparent
    }

    super(undefined, frag, uniforms);
  }
}