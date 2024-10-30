import { WaveWipeFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { createColorTexture } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { WaveWipeConfiguration } from "./types";

export class WaveWipeStep extends TransitionStep<WaveWipeConfiguration> {
  public readonly template = "wave-wipe-config";
  public readonly defaultSettings: Partial<WaveWipeConfiguration> = {
    duration: 1000
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new WaveWipeFilter(this.config.direction, background.baseTexture);
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }
}