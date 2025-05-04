import { coerceTexture } from '../../coercion';
import { InvalidDirectionError, InvalidTextureError } from '../../errors';
import { TextureWipeFilter } from '../TextureWipe/TextureWipeFilter';
import { RadialDirection, ClockDirection } from '../../types';

const textures = {
  clockwise: {
    inside: "spiral-radial-clockwise-inside",
    outside: "spiral-radial-clockwise-outside"
  },
  counterclockwise: {
    inside: "spiral-radial-counterclockwise-inside",
    outside: "spiral-radial-counterclockwise-outside"
  }
}

export class SpiralShutterFilter extends TextureWipeFilter {
  constructor(direction: ClockDirection, radial: RadialDirection, background: PIXI.TextureSource | PIXI.ColorSource, falloff: number) {
    const bg = coerceTexture(background);

    if (!(bg instanceof PIXI.Texture)) throw new InvalidTextureError();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const wipe = (textures as any)[direction]?.[radial];

    if (!wipe) throw new InvalidDirectionError(`${direction}-${radial}`);

    const wipeTexture = PIXI.Texture.from(`/modules/${__MODULE_ID__}/assets/wipes/${wipe}.webp`);
    super(wipeTexture, falloff, bg);
  }
}
