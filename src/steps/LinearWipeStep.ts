import { LinearWipeFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { createColorTexture } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { LinearWipeConfiguration } from "./types";

export class LinearWipeStep extends TransitionStep<LinearWipeConfiguration> {
  static name = "LINEARWIPE";
  public readonly template = "linear-wipe-config";
  public readonly defaultSettings: Partial<LinearWipeConfiguration> = {
    duration: 1000
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence) {
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new LinearWipeFilter(this.config.direction, background.baseTexture);
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }
}