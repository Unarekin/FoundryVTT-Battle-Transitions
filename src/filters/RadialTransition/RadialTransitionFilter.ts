import { TextureWipeFilter } from '../TextureWipe/TextureWipeFilter';
import { RadialDirection } from "../../types";
import { coerceTexture } from "../../coercion";
import { createColorTexture } from "../../utils";
import { InvalidDirectionError } from '../../errors';

const TextureHash = {
  inside: "radial-inside.webp",
  outside: "radial-outside.webp"
}

export class RadialTransitionFilter extends TextureWipeFilter {
  constructor(direction: RadialDirection, bg: PIXI.TextureSource | PIXI.ColorSource) {
    const bgTexture = coerceTexture(bg) ?? createColorTexture("transparent");
    const texture = TextureHash[direction];
    if (!texture) throw new InvalidDirectionError(direction);
    const wipeTexture = PIXI.Texture.from(`/modules/${__MODULE_ID__}/assets/wipes/${texture}`);
    super(wipeTexture, bgTexture);
  }
}
