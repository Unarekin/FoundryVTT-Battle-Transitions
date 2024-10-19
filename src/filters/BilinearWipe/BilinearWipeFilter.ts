import { coerceTexture } from '../../coercion';
import { InvalidDirectionError } from '../../errors';
import { RadialDirection, WipeDirection } from '../../types';
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

export class BilinearWipeFilter extends TextureWipeFilter {

  constructor(direction: "horizontal" | "vertical" | "topleft" | "bottomleft" | "topright" | "bottomright", radial: RadialDirection, bg: PIXI.TextureSource | PIXI.ColorSource) {
    const bgTexture = coerceTexture(bg) ?? createColorTexture("transparent");
    const texture = TextureHash[direction]?.[radial];
    if (!texture) throw new InvalidDirectionError(`${direction}-${radial}`);

    const wipeTexture = PIXI.Texture.from(`/modules/${__MODULE_ID__}/assets/wipes/${texture}`);
    super(wipeTexture, bgTexture);
  }
}