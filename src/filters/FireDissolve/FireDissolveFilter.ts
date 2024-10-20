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

const defaultBurnTexture = createGradient1DTexture(1024, new PIXI.Color("#ff0400"), new PIXI.Color("#ffff01"));

export class FireDissolveFilter extends CustomFilter<FireDissolveUniforms> {

  constructor(burnTexture?: PIXI.TextureSource) {
    const noise_texture = createNoiseTexture();
    const uniforms = {
      noise_texture,
      integrity: 1,
      burn_size: 1.3,
      burn_texture: burnTexture ? PIXI.Texture.from(burnTexture) : defaultBurnTexture
    }

    super(undefined, fragment, uniforms);
  }

}