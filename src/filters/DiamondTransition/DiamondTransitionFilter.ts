import frag from "./diamondtransition.frag";
import { CustomFilter } from '../CustomFilter';

type DiamondTransitionUniforms = {
  progress: number;
  size: number;
  fill: boolean;
  screen_size: { x: number; y: number }
}

export class DiamondTransitionFilter extends CustomFilter<DiamondTransitionUniforms> {
  constructor(uniforms?: Partial<DiamondTransitionUniforms>) {
    const actual: DiamondTransitionUniforms = {
      progress: 0,
      size: 40,
      fill: true,
      screen_size: {
        x: window.innerWidth,
        y: window.innerHeight
      },
      ...uniforms
    };

    super(undefined, frag, actual);
  }
}