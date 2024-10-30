import { ClockWipeFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { createColorTexture } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { ClockWipeConfiguration } from "./types";

export class ClockWipeStep extends TransitionStep<ClockWipeConfiguration> {

  public readonly template = "clock-wipe-config";
  public readonly defaultSettings: Partial<ClockWipeConfiguration> = {
    type: "clockwipe",
    duration: 1000
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new ClockWipeFilter(this.config.clockDirection, this.config.direction, background.baseTexture);
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }
}
