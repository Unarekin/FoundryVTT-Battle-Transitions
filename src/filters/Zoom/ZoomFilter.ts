import frag from "./zoom.frag";
import { CustomFilter } from '../CustomFilter';
import { coerceTexture } from "../../coercion";
import { createColorTexture } from "../../utils";

type ZoomUniforms = {
  center: [number, number],
  clampBounds: boolean,
  amount: number,
  bgSampler: PIXI.Texture
}

export class ZoomFilter extends CustomFilter<ZoomUniforms> {
  constructor(center: [number, number], amount: number = 0, clampBounds: boolean = false, bg: PIXI.TextureSource | PIXI.ColorSource = "transparent") {
    const bgTexture = coerceTexture(bg) ?? createColorTexture("transparent");

    super(undefined, frag, {
      center,
      amount,
      clampBounds,
      bgSampler: bgTexture
    });
  }
}