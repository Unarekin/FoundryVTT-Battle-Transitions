import frag from "./diamondtransition.frag";
import { CustomFilter } from '../CustomFilter';

type DiamondTransitionUniforms = {
  progress: number;
  size: number;
  fill: boolean; s
  screen_size: { x: number; y: number }
}

Hooks.once("canvasReady", () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  BattleTransitions.Presets = {
    diamondWipe: (duration: number) => {
      return async function (container: PIXI.DisplayObject) {
        const filter = new DiamondTransitionFilter();
        container.filters = [filter];

        await TweenMax.to(filter.uniforms, { progress: 1, duration });
        filter.destroy();
        container.filters = [];
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    ...BattleTransitions.Presets
  }
});

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