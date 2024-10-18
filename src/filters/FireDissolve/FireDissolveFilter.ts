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

Hooks.once("canvasReady", () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  BattleTransitions.Presets = {
    fireDissolve: () => async function (container: PIXI.DisplayObject) {
      const filter = new FireDissolveFilter();
      container.filters = [filter];
      await TweenMax.to(filter.uniforms, { integrity: 0, duration: 3 });
      filter.destroy();
      container.filters = [];
    },
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    ...BattleTransitions.Presets
  }
})

export class FireDissolveFilter extends CustomFilter<FireDissolveUniforms> {


  constructor(uniforms?: Partial<FireDissolveUniforms>) {
    const noise_texture = createNoiseTexture();
    const burn_texture = createGradient1DTexture(1024, new PIXI.Color("#ff0400"), new PIXI.Color("#ffff01"));


    // logImage(canvas?.app?.renderer.extract.canvas(burn_texture).toDataURL());

    const actualUniforms = {
      noise_texture,
      burn_texture,
      integrity: 1,
      burn_size: 1.5,
      ...uniforms
    };

    super(undefined, fragment, actualUniforms);
  }
}