import { FadeTransitionFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { createColorTexture } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { FadeConfiguration } from "./types";

export class FadeStep extends TransitionStep<FadeConfiguration> {
  static name = "FADE";
  public readonly template = "fade-config";
  public readonly defaultSettings: Partial<FadeConfiguration> = {
    duration: 1000
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new FadeTransitionFilter(background.baseTexture);
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }
}