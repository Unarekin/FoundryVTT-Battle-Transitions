import frag from "./melt.frag";
import { CustomFilter } from '../CustomFilter';
import { coerceTexture } from "../../coercion";
import { InvalidTextureError } from "../../errors";

type MeltUniforms = {
  progress: number;
  offsets: number[];
  uBackground: PIXI.Texture;
}

/*

uniform float progress;
uniform float[64] offsets;
uniform sampler2D uBackground;
*/

export class MeltFilter extends CustomFilter<MeltUniforms> {
  constructor(background: PIXI.TextureSource | PIXI.ColorSource) {

    const texture = coerceTexture(background);
    if (!(texture instanceof PIXI.Texture)) throw new InvalidTextureError();

    super(undefined, frag, {
      progress: 0,
      offsets: new Array(512).fill(0).map(() => Math.random() + 1),
      uBackground: texture
    });
  }
}