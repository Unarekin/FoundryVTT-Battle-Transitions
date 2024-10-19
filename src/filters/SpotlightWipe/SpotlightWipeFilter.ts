import { RadialDirection, WipeDirection } from '../../types';
import { createColorTexture } from '../../utils';
import { coerceTexture } from "../../coercion";
import { TextureWipeFilter } from '../TextureWipe/TextureWipeFilter';
import { InvalidDirectionError } from '../../errors';

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

export class SpotlightWipeFilter extends TextureWipeFilter {
  constructor(direction: WipeDirection, radial: RadialDirection, bg: PIXI.TextureSource | PIXI.ColorSource = "transparent") {
    const bgTexture = coerceTexture(bg) ?? createColorTexture("transparent");
    const texture = TextureHash[direction]?.[radial];
    if (!texture) throw new InvalidDirectionError(`${direction}-${radial}`);
    const wipeTexture = PIXI.Texture.from(`/modules/${__MODULE_ID__}/assets/wipes/${texture}`);
    super(wipeTexture, bgTexture);
  }
}
