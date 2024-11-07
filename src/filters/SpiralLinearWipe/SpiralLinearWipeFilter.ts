import { coerceTexture } from "../../coercion";
import { InvalidTextureError } from "../../errors";
import { ClockDirection, RadialDirection, TextureLike, WipeDirection } from "../../types";
import { TextureWipeFilter } from "../TextureWipe/TextureWipeFilter";


export class SpiralLinearWipeFilter extends TextureWipeFilter {
  constructor(clock: ClockDirection, radial: RadialDirection, direction: WipeDirection, background: TextureLike) {
    const bg = coerceTexture(background);
    if (!(bg instanceof PIXI.Texture)) throw new InvalidTextureError();
    const wipeTexture = PIXI.Texture.from(`/modules/${__MODULE_ID__}/assets/wipes/spiral-linear-${clock}-${direction}-${radial}.webp`);
    if (!(wipeTexture instanceof PIXI.Texture)) throw new InvalidTextureError();

    super(wipeTexture, bg);
  }
}


//     if (!wipe) throw new InvalidDirectionError(`${direction}-${radial}`);

//     const wipeTexture = PIXI.Texture.from(`/modules/${__MODULE_ID__}/assets/wipes/${wipe}.webp`);
//     super(wipeTexture, bg);
//   }
// }
