import { createGradient1DTexture, createNoiseTexture } from "../../utils";
import { CustomFilter } from "../CustomFilter";
import fragment from "./firedissolve.frag";
// import { createGradient1DTexture, createNoiseTexture } from "../../utils"

type FireDissolveUniforms = {
  noise_texture: PIXI.Texture;
  burn_texture: PIXI.Texture;
  integrity: number;
  burn_size: number;
}

export const defaultBurnTexture = createGradient1DTexture(1024, new PIXI.Color("#ff0400"), new PIXI.Color("#ffff01"));

export class FireDissolveFilter extends CustomFilter<FireDissolveUniforms> {

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(background: PIXI.TextureSource | PIXI.ColorSource = "transparent", burnSize: number = 1.3) {
    const noise_texture = createNoiseTexture();
    const uniforms = {
      noise_texture,
      integrity: 1,
      burn_size: burnSize,
      burn_texture: defaultBurnTexture
    }

    super(undefined, fragment, uniforms);
  }

}