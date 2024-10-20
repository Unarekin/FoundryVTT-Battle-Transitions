import { coerceTexture } from "../../coercion";
import { CUSTOM_HOOKS } from "../../constants";
import { InvalidDirectionError } from "../../errors";
import { TransitionChain } from "../../TransitionChain";
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

Hooks.once(CUSTOM_HOOKS.INITIALIZE, () => {
  BattleTransitions.Presets = {
    clockwiseTop: generatePreset("clockwise", "top"),
    clockwiseRight: generatePreset("clockwise", "right"),
    clockwiseBottom: generatePreset("clockwise", "bottom"),
    clockwiseLeft: generatePreset("clockwise", "left"),
    counterClockwiseTop: generatePreset("counterclockwise", "top"),
    counterClockwiseRight: generatePreset("counterclockwise", "right"),
    counterClockwiseBottom: generatePreset("counterclockwise", "bottom"),
    counterClockwiseLeft: generatePreset("counterclockwise", "left"),

    ...(BattleTransitions.Presets ?? {})
  }
})

function generatePreset(clockDirection: ClockDirection, direction: WipeDirection): (scene: string | Scene, duration: number) => Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
  return (scene: string | Scene, duration: number = 1000) => new TransitionChain(scene as any).clockWipe(clockDirection, direction, duration).execute();
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
