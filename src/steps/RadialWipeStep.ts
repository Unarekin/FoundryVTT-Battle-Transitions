import { RadialWipeFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { Easing } from "../types";
import { createColorTexture } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { RadialWipeConfiguration } from "./types";

export class RadialWipeStep extends TransitionStep<RadialWipeConfiguration> {
  public readonly template = "radial-wipe-config";
  public readonly defaultSettings: Partial<RadialWipeConfiguration> = {
    duration: 1000,
    easing: "none" as Easing
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new RadialWipeFilter(this.config.radial, background.baseTexture);
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }

}