import frag from "./fadetransition.frag";
import { CustomFilter } from '../CustomFilter';
import { createColorTexture } from '../../utils';
import { coerceTexture } from "../../coercion";
import { CUSTOM_HOOKS } from "../../constants";
import { TransitionChain } from "../../TransitionChain";

type FadeTransitionUniforms = {
  progress: number;
  bgColor: PIXI.Texture;
}

Hooks.once(CUSTOM_HOOKS.INITIALIZE, () => {
  BattleTransitions.Presets = {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    fade: (scene: string | Scene, duration: number = 1000) => new TransitionChain(scene as any).fade(duration).execute(),

    ...(BattleTransitions.Presets ?? {})
  }
})

export class FadeTransitionFilter extends CustomFilter<FadeTransitionUniforms> {

  constructor(bg: PIXI.ColorSource | PIXI.TextureSource = "transparent") {
    const bgTexture = coerceTexture(bg) ?? createColorTexture("transparent");
    super(undefined, frag, {
      bgColor: bgTexture,
      progress: 0
    });
  }
}