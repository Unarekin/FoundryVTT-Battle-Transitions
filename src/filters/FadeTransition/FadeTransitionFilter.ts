import frag from "./fadetransition.frag";
import { CustomFilter } from '../CustomFilter';
import { createColorTexture } from '../../utils';

type FadeTransitionUniforms = {
  progress: number;
  bgColor: PIXI.Texture;
}

export class FadeTransitionFilter extends CustomFilter<FadeTransitionUniforms> {
  constructor(color?: PIXI.ColorSource) {
    const texture = createColorTexture(color ?? "#00000000");
    super(undefined, frag, { bgColor: texture, progress: 0 });
  }
}