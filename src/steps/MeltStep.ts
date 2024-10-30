import { MeltFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { createColorTexture } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { MeltConfiguration } from "./types";

export class MeltStep extends TransitionStep<MeltConfiguration> {
  static name = "MELT";
  public readonly template = "melt-config";
  public readonly defaultSettings: Partial<MeltConfiguration> = {
    duration: 1000
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new MeltFilter(background.baseTexture);
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }

}