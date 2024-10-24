import { coerceTexture } from '../../coercion';
import { InvalidDirectionError } from '../../errors';
import { WipeDirection } from '../../types';
import { createColorTexture } from '../../utils';
import { TextureWipeFilter } from '../TextureWipe/TextureWipeFilter';

const TextureHash = {
  left: "linear-left.webp",
  right: "linear-right.webp",
  top: "linear-top.webp",
  bottom: "linear-bottom.webp",
  topleft: "linear-top-left.webp",
  topright: "linear-top-right.webp",
  bottomleft: "linear-bottom-left.webp",
  bottomright: "linear-bottom-right.webp"
};


export class LinearWipeFilter extends TextureWipeFilter {

  constructor(direction: WipeDirection, bg: PIXI.TextureSource | PIXI.ColorSource) {
    const bgTexture = coerceTexture(bg) ?? createColorTexture("transparent");
    const texture = TextureHash[direction];
    if (!texture) throw new InvalidDirectionError(direction);

    const wipeTexture = PIXI.Texture.from(`/modules/${__MODULE_ID__}/assets/wipes/${texture}`);
    super(wipeTexture, bgTexture);
  }
}