import { coerceTexture } from '../../coercion';
import { CUSTOM_HOOKS } from '../../constants';
import { InvalidDirectionError } from '../../errors';
import { TransitionChain } from '../../TransitionChain';
import { BilinearDirection, RadialDirection, WipeDirection } from '../../types';
import { createColorTexture } from '../../utils';
import { TextureWipeFilter } from '../TextureWipe/TextureWipeFilter';

const TextureHash = {
  horizontal: {
    inside: "bilinear-horizontal-inside.webp",
    outside: "bilinear-horizontal-outside.webp"
  },
  vertical: {
    inside: "bilinear-vertical-inside.webp",
    outside: "bilinear-vertical-outside.webp"
  },
  topleft: {
    inside: "bilinear-top-left-inside.webp",
    outside: "bilinear-top-right-outside.webp"
  },
  topright: {
    inside: "bilinear-top-right-inside.webp",
    outside: "bilinear-top-right-outside.webp"
  },
  bottomleft: {
    inside: "bilinear-top-right-inside.webp",
    outside: "bilinear-top-right-outside.webp"
  },
  bottomright: {
    inside: "bilinear-top-left-inside.webp",
    outside: "bilinear-top-right-outside.webp"
  }
}

Hooks.once(CUSTOM_HOOKS.INITIALIZE, () => {
  BattleTransitions.Presets = {
    bilinearHorizontalInside: generatePreset("horizontal", "inside"),
    bilinearHorizontalOutside: generatePreset("horizontal", "outside"),
    bilinearVerticalInside: generatePreset("vertical", "inside"),
    bilinearVerticalOutside: generatePreset("vertical", "outside"),
    bilinearTopLeftInisde: generatePreset("topleft", "inside"),
    bilinearTopLeftOutside: generatePreset("topleft", "outside"),
    bilinearTopRightInside: generatePreset("topright", "inside"),
    bilinearTopRightOUtside: generatePreset("topright", "outside"),

    ...(BattleTransitions.Presets ?? {})
  }
});

function generatePreset(direction: BilinearDirection, radial: RadialDirection): (scene: string | Scene, duration: number) => Promise<void> {
  return (scene: string | Scene, duration: number = 1000) => new TransitionChain(scene as any).bilinearWipe(direction, radial, duration).execute();
}

export class BilinearWipeFilter extends TextureWipeFilter {

  constructor(direction: BilinearDirection, radial: RadialDirection, bg: PIXI.TextureSource | PIXI.ColorSource) {
    const bgTexture = coerceTexture(bg) ?? createColorTexture("transparent");
    const texture = TextureHash[direction]?.[radial];
    if (!texture) throw new InvalidDirectionError(`${direction}-${radial}`);

    const wipeTexture = PIXI.Texture.from(`/modules/${__MODULE_ID__}/assets/wipes/${texture}`);
    super(wipeTexture, bgTexture);
  }
}