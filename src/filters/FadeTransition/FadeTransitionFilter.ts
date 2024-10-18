import frag from "./fadetransition.frag";
import { CustomFilter } from '../CustomFilter';
import { createColorTexture } from '../../utils';

type FadeTransitionUniforms = {
  progress: number;
  bgColor: PIXI.Texture;
}

Hooks.once("canvasReady", () => {
  BattleTransitions.Presets = {
    colorFade: (duration: number, color: PIXI.ColorSource) => async (container: PIXI.DisplayObject) => {
      const filter = new FadeTransitionFilter(color);
      container.filters = [filter];
      await TweenMax.to(filter.uniforms, { progress: 1, duration });
      filter.destroy();
      container.filters = [];
    },

    ...BattleTransitions.Presets
  }
})


export class FadeTransitionFilter extends CustomFilter<FadeTransitionUniforms> {
  constructor(color?: PIXI.ColorSource) {
    const texture = createColorTexture(color ?? "#00000000");
    super(undefined, frag, { bgColor: texture, progress: 0 });
  }
}