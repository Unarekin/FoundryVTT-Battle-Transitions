import { DiamondTransitionFilter } from "../filters";
import { createColorTexture } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { DiamondWipeConfiguration } from "./types";

export class DiamondWipeStep extends TransitionStep<DiamondWipeConfiguration> {
  public readonly template = "diamond-wipe-config";
  public readonly defaultSettings: Partial<DiamondWipeConfiguration> = {
    type: "diamodnwipe",
    size: 40,
    duration: 1000
  }

  public async execute(container: PIXI.Container): Promise<void> {
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new DiamondTransitionFilter(this.config.size, background.baseTexture);
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }
}