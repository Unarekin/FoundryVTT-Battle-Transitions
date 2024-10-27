import { coerceTexture } from '../../coercion';
import { InvalidTextureError } from '../../errors';
import { TextureWipeFilter } from '../TextureWipe/TextureWipeFilter';
import { RadialDirection } from '../../types';

export class SawWipeFilter extends TextureWipeFilter {
  constructor(direction: RadialDirection, background: PIXI.TextureSource | PIXI.ColorSource) {
    const bg = coerceTexture(background);
    if (!(bg instanceof PIXI.Texture)) throw new InvalidTextureError();

    const wipeTexture = PIXI.Texture.from(`/modules/${__MODULE_ID__}/assets/wipes/saw-${direction === "inside" ? "inside" : "outside"}.webp`);
    super(wipeTexture, bg);
  }
}
