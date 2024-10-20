import { coerceTexture } from '../../coercion';
import { CUSTOM_HOOKS } from '../../constants';
import { InvalidDirectionError } from '../../errors';
import { TransitionChain } from '../../TransitionChain';
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

function generatePreset(direction: WipeDirection): (scene: string | Scene, duration: number) => Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
  return (scene: string | Scene, duration: number) => new TransitionChain(scene as any).linearWipe(direction, duration).execute();
}

Hooks.once(CUSTOM_HOOKS.INITIALIZE, () => {
  BattleTransitions.Presets = {
    linearLeft: generatePreset("left"),
    linearRight: generatePreset("right"),
    linearTop: generatePreset("top"),
    linearBottom: generatePreset("bottom"),
    linearTopLeft: generatePreset("topleft"),
    linearTopRight: generatePreset("topright"),
    linearBottomLeft: generatePreset("bottomleft"),
    linearBottomRight: generatePreset("bottomright"),

    ...(BattleTransitions.Presets ?? {})
  }
})

export class LinearWipeFilter extends TextureWipeFilter {

  constructor(direction: WipeDirection, bg: PIXI.TextureSource | PIXI.ColorSource) {
    const bgTexture = coerceTexture(bg) ?? createColorTexture("transparent");
    const texture = TextureHash[direction];
    if (!texture) throw new InvalidDirectionError(direction);

    const wipeTexture = PIXI.Texture.from(`/modules/${__MODULE_ID__}/assets/wipes/${texture}`);
    super(wipeTexture, bgTexture);
  }
}