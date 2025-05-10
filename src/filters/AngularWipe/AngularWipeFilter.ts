import { coerceTexture } from '../../coercion';
import { InvalidTextureError } from '../../errors';
import { TextureWipeFilter } from '../TextureWipe/TextureWipeFilter';

export class AngularWipeFilter extends TextureWipeFilter {
  constructor(background: PIXI.TextureSource | PIXI.ColorSource) {
    const bg = coerceTexture(background);
    if (!(bg instanceof PIXI.Texture)) throw new InvalidTextureError();

    const wipeTexture = PIXI.Texture.from(`/modules/${__MODULE_ID__}/assets/wipes/angular.webp`);
    super(wipeTexture, 0, bg);
  }
}
