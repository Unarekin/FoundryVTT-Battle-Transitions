import { TextureSwapFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { createColorTexture, wait } from '../utils';
import { TransitionStep } from "./TransitionStep";
import { FlashConfiguration } from "./types";


export class FlashStep extends TransitionStep<FlashConfiguration> {
  public readonly template = "flash-config";
  public readonly defaultSettings: Partial<FlashConfiguration> = {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    const background = this.config.deserializedTexture ?? createColorTexture("tranparent");

    const filter = new TextureSwapFilter(background.baseTexture);
    this.addFilter(container, filter);
    await wait(this.config.duration);
    this.removeFilter(container, filter);
    filter.destroy();
  }

}