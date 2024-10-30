import { TransitionSequence } from "../interfaces";
import { createColorTexture } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { SpiralRadialWipeConfiguration } from "./types";
import { SpiralRadialWipeFilter } from "../filters";

export class SpiralRadialWipeStep extends TransitionStep<SpiralRadialWipeConfiguration> {
  static name = "SPIRALRADIALWIPE";
  public readonly template = "spiral-wipe-config";
  public readonly defaultSettings: Partial<SpiralRadialWipeConfiguration> = {
    duration: 1000,
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new SpiralRadialWipeFilter(this.config.direction, this.config.radial, background.baseTexture);
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }
}