import { CustomFilter } from "../CustomFilter";
import { coerceTexture } from '../../coercion';
import { InvalidTextureError } from "../../errors";
import frag from "./textureswap.frag";

type TextureSwapUniforms = {
  uTexture: PIXI.Texture,
  uReplace: boolean;
};


export class TextureSwapFilter extends CustomFilter<TextureSwapUniforms> {
  constructor(texture: PIXI.TextureSource | PIXI.ColorSource, replace = true) {
    const actual = coerceTexture(texture);
    if (!actual) throw new InvalidTextureError();

    super(undefined, frag, {
      uTexture: actual,
      uReplace: replace
    });
  }
}