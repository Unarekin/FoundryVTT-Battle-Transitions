import frag from "./glitch.frag";
import { CustomFilter } from '../CustomFilter';
import { coerceTexture } from "../../coercion";
import { createColorTexture } from "../../utils";

type GlitchUniforms = {
  progress: number;
  shake_power: number;
  shake_block_size: number;
  direction_r: [number, number];
  direction_g: [number, number];
  direction_b: [number, number];
  background: PIXI.Texture;
}

export class GlitchFilter extends CustomFilter<GlitchUniforms> {
  constructor(background: PIXI.TextureSource | PIXI.ColorSource = "transparent") {
    const bg = coerceTexture(background) ?? createColorTexture("transparent");

    super(undefined, frag, {
      progress: 0,
      shake_power: 0.03,
      shake_block_size: 30.5,
      direction_r: [1.0, 0.0],
      direction_g: [0.4, 1.0],
      direction_b: [-0.7, -0.3],
      background: bg
    });
  }
}