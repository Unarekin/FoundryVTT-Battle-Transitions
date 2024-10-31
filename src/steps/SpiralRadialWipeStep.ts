import { TransitionSequence } from "../interfaces";
import { createColorTexture } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { SpiralRadialWipeConfiguration } from "./types";
import { SpiralRadialWipeFilter } from "../filters";
import { NotImplementedError } from "../errors";

export class SpiralRadialWipeStep extends TransitionStep<SpiralRadialWipeConfiguration> {
  static name = "SPIRALRADIALWIPE";
  public readonly template = "spiral-wipe-config";

  static DefaultSettings: SpiralRadialWipeConfiguration = {
    type: "spiralradialwipe",
    duration: 1000,
    direction: "clockwise",
    radial: "inside",
    easing: "none"
  }


  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new SpiralRadialWipeFilter(this.config.direction, this.config.radial, background.baseTexture);
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }

  static from(config: SpiralRadialWipeConfiguration): SpiralRadialWipeStep
  static from(form: HTMLFormElement): SpiralRadialWipeStep
  static from(form: JQuery<HTMLFormElement>): SpiralRadialWipeStep
  static from(arg: unknown): SpiralRadialWipeStep {
    if (arg instanceof HTMLFormElement) return SpiralRadialWipeStep.fromFormElement(arg);
    else if (Array.isArray(arg) && arg[0] instanceof HTMLFormElement) return SpiralRadialWipeStep.fromFormElement(arg[0])
    else return new SpiralRadialWipeStep(arg as SpiralRadialWipeConfiguration);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static fromFormElement(form: HTMLFormElement): SpiralRadialWipeStep {
    throw new NotImplementedError();
  }
}