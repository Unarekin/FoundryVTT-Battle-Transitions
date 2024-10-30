import { SpotlightWipeFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { createColorTexture } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { SpotlightWipeConfiguration } from "./types";

export class SpotlightWipeStep extends TransitionStep<SpotlightWipeConfiguration> {
  public readonly template = "spotlight-wipe-config";
  public readonly defaultSettings: Partial<SpotlightWipeConfiguration> = {
    duration: 1000,
    easing: "none"
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new SpotlightWipeFilter(this.config.direction, this.config.radial, background.baseTexture);
    this.addFilter(container, filter);
    await this.simpleTween(filter);
    
  }
}
