import frag from "./fadetransition.frag";
import { CustomFilter } from '../CustomFilter';
import { createColorTexture } from '../../utils';
import { coerceTexture } from "../../coercion";

type FadeTransitionUniforms = {
  progress: number;
  bgColor: PIXI.Texture;
}

export class FadeTransitionFilter extends CustomFilter<FadeTransitionUniforms> {

  constructor(bg?: PIXI.ColorSource | PIXI.TextureSource = "transparent") {
    const bgTexture = coerceTexture(bg) ?? createColorTexture("transparent");
    super(undefined, frag, {
      bgColor: bgTexture,
      progress: 0
    });
  }
}