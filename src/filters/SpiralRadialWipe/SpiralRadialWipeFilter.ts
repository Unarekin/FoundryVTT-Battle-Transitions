import { coerceTexture } from '../../coercion';
import { InvalidDirectionError, InvalidTextureError } from '../../errors';
import { TextureWipeFilter } from '../TextureWipe/TextureWipeFilter';
import { RadialDirection, ClockDirection } from '../../types';

const textures = {
  clockwise: {
    inside: "spiral-clockwise-inside",
    outside: "spiral-clockwise-outside"
  },
  counterclockwise: {
    inside: "spiral-counterclockwise-inside",
    outside: "spiral-counterclockwise-outside"
  }
}

export class SpiralRadialWipeFilter extends TextureWipeFilter {
  constructor(direction: ClockDirection, radial: RadialDirection, background: PIXI.TextureSource | PIXI.ColorSource) {
    const bg = coerceTexture(background);

    if (!(bg instanceof PIXI.Texture)) throw new InvalidTextureError();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const wipe = (textures as any)[direction]?.[radial];

    if (!wipe) throw new InvalidDirectionError(`${direction}-${radial}`);

    const wipeTexture = PIXI.Texture.from(`/modules/${__MODULE_ID__}/assets/wipes/${wipe}.webp`);
    super(wipeTexture, bg);
  }
}
