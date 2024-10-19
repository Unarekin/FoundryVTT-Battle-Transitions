import { coerceTexture } from "../../coercion";
import { InvalidDirectionError } from "../../errors";
import { ClockDirection, WipeDirection } from "../../types";
import { createColorTexture } from "../../utils";
import { TextureWipeFilter } from "../TextureWipe/TextureWipeFilter";

const TextureHash = {
  clockwise: {
    top: "clockwise-top.webp",
    left: "clockwise-left.webp",
    right: "clockwise-right.webp",
    bottom: "clockwise-bottom.webp"
  },
  counterclockwise: {
    top: "anticlockwise-top.webp",
    left: "anticlockwise-left.webp",
    right: "anticlockwise-right.webp",
    bottom: "anticlockwise-bottom.webp"
  }
}

export class ClockWipeFilter extends TextureWipeFilter {

  constructor(clockDirection: ClockDirection, direction: WipeDirection, bg: PIXI.ColorSource | PIXI.TextureSource) {
    const bgTexture = coerceTexture(bg) ?? createColorTexture("transparent");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const texture = TextureHash[clockDirection]?.[direction];
    if (!texture) throw new InvalidDirectionError(`${clockDirection}-${direction}`);
    const wipeTexture = PIXI.Texture.from(`/modules/${__MODULE_ID__}/assets/wipes/${texture}`);
    super(wipeTexture, bgTexture);
  }
}
