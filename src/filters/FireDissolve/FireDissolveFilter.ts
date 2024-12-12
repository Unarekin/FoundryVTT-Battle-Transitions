import { createGradient1DTexture, createNoiseTexture } from "../../utils";
import { CustomFilter } from "../CustomFilter";
import fragment from "./firedissolve.frag";
// import { createGradient1DTexture, createNoiseTexture } from "../../utils"

type FireDissolveUniforms = {
  noise_texture: PIXI.Texture;
  burn_texture: PIXI.Texture;
  progress: number;
  burn_size: number;
}

export const defaultBurnTexture = createGradient1DTexture(window.innerWidth, new PIXI.Color("#FF0000"), new PIXI.Color("#ffff00"));

export class FireDissolveFilter extends CustomFilter<FireDissolveUniforms> {

  constructor(burnSize: number = 1.3) {
    const noise_texture = createNoiseTexture();
    const uniforms = {
      noise_texture,
      progress: 0,
      burn_size: burnSize,
      burn_texture: defaultBurnTexture
    };

    super(undefined, fragment, uniforms);
  }

}