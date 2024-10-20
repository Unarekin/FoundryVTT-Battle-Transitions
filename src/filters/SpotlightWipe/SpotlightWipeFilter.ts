import { RadialDirection, WipeDirection } from '../../types';
import { createColorTexture } from '../../utils';
import { coerceTexture } from "../../coercion";
import { TextureWipeFilter } from '../TextureWipe/TextureWipeFilter';
import { InvalidDirectionError } from '../../errors';
import { TransitionChain } from '../../TransitionChain';
import { CUSTOM_HOOKS } from '../../constants';

const TextureHash = {
  left: {
    inside: "spotlight-left-inside.webp",
    outside: "spotlight-right-outside.webp"
  },
  top: {
    inside: "spotlight-top-inside.webp",
    outside: "spotlight-top-outside.webp"
  },
  right: {
    inside: "spotlight-right-inside.webp",
    outside: "spotlight-right-outside.webp"
  },
  bottom: {
    inside: "spotlight-bottom-inside.webp",
    outside: "spotlgiht-bottom-outside.webp"
  }
}

function generatePreset(direction: WipeDirection, radial: RadialDirection): (scene: string | Scene, duration: number) => Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
  return (scene: string | Scene, duration: number) => new TransitionChain(scene as any).spotlight(direction, radial, duration).execute();
}

Hooks.once(CUSTOM_HOOKS.INITIALIZE, () => {

  BattleTransitions.Presets = {
    spotlightTopOutside: generatePreset("top", "outside"),
    spotlightRightOutside: generatePreset("right", "outside"),
    spotlightBottomOutside: generatePreset("bottom", "outside"),
    spotlightLeftOutside: generatePreset("left", "outside"),

    spotlightTopInside: generatePreset("top", "inside"),
    spotlightRightInside: generatePreset("right", "inside"),
    spotlightBottomInside: generatePreset("bottom", "inside"),
    spotlightLeftInside: generatePreset("left", "inside"),

    ...(BattleTransitions.Presets ?? {})
  }
})

export class SpotlightWipeFilter extends TextureWipeFilter {
  constructor(direction: WipeDirection, radial: RadialDirection, bg: PIXI.TextureSource | PIXI.ColorSource = "transparent") {
    const bgTexture = coerceTexture(bg) ?? createColorTexture("transparent");
    const texture = TextureHash[direction]?.[radial];
    if (!texture) throw new InvalidDirectionError(`${direction}-${radial}`);
    const wipeTexture = PIXI.Texture.from(`/modules/${__MODULE_ID__}/assets/wipes/${texture}`);
    super(wipeTexture, bgTexture);
  }
}
