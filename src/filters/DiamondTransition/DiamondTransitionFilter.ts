import frag from "./diamondtransition.frag";
import { CustomFilter } from '../CustomFilter';
import { coerceTexture } from "../../coercion";
import { createColorTexture } from "../../utils";

type DiamondTransitionUniforms = {
  progress: number;
  size: number;
  screen_size: { x: number; y: number },
  bgSampler: PIXI.Texture
}

export class DiamondTransitionFilter extends CustomFilter<DiamondTransitionUniforms> {

  constructor(size: number, bg: PIXI.TextureSource | PIXI.ColorSource = "transparent") {
    const bgTexture = coerceTexture(bg) ?? createColorTexture("transparent");
    super(undefined, frag, {
      progress: 0,
      size,
      bgSampler: bgTexture,
      screen_size: { x: window.innerWidth, y: window.innerHeight }
    })
  }
}

// export class DiamondTransitionFilter extends CustomFilter<DiamondTransitionUniforms> {
//   constructor(uniforms?: Partial<DiamondTransitionUniforms>) {
//     const actual: DiamondTransitionUniforms = {
//       progress: 0,
//       size: 40,
//       fill: true,
//       screen_size: {
//         x: window.innerWidth,
//         y: window.innerHeight
//       },
//       ...uniforms
//     };

//     super(undefined, frag, actual);
//   }
// }