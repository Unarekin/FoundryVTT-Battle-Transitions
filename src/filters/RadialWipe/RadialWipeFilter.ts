import { TextureWipeFilter } from '../TextureWipe/TextureWipeFilter';
import { RadialDirection } from "../../types";
import { coerceTexture } from "../../coercion";
import { createColorTexture } from "../../utils";
import { InvalidDirectionError } from '../../errors';
import { TransitionChain } from '../../TransitionChain';
import { CUSTOM_HOOKS } from '../../constants';

const TextureHash = {
  inside: "radial-inside.webp",
  outside: "radial-outside.webp"
}

function generatePreset(direction: RadialDirection): (scene: string | Scene, duration: number) => Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
  return (scene: string | Scene, duration: number) => new TransitionChain(scene as any).radial(direction, duration).execute();

}

Hooks.once(CUSTOM_HOOKS.INITIALIZE, () => {
  BattleTransitions.Presets = {
    radialInside: generatePreset("inside"),
    radialOutside: generatePreset("outside"),

    ...(BattleTransitions.Presets ?? {})
  }
})


export class RadialWipeFilter extends TextureWipeFilter {
  constructor(direction: RadialDirection, bg: PIXI.TextureSource | PIXI.ColorSource) {
    const bgTexture = coerceTexture(bg) ?? createColorTexture("transparent");
    const texture = TextureHash[direction];
    if (!texture) throw new InvalidDirectionError(direction);
    const wipeTexture = PIXI.Texture.from(`/modules/${__MODULE_ID__}/assets/wipes/${texture}`);
    super(wipeTexture, bgTexture);
  }
}
