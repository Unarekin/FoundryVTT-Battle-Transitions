import { BilinearWipeFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { createColorTexture } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { BilinearWipeConfiguration } from "./types";

export class BilinearWipeStep extends TransitionStep<BilinearWipeConfiguration> {
  public readonly template = "bilinear-wipe-config";

  public readonly defaultSettings: Partial<BilinearWipeConfiguration> = {
    type: "bilinearwipe",
    duration: 1000
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, _sequence: TransitionSequence): Promise<void> {
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new BilinearWipeFilter(this.config.direction, this.config.radial, background.baseTexture);
    this.addFilter(container, filter);
    await this.simpleTween(filter)
  }



}