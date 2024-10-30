import { TextureSwapFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { createColorTexture } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { TextureSwapConfiguration } from "./types";

export class TextureSwapStep extends TransitionStep<TextureSwapConfiguration> {
  public readonly template = "textureswap-config";
  public readonly defaultSettings: Partial<TextureSwapConfiguration> = {};

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public execute(container: PIXI.Container, sequence: TransitionSequence): void {
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new TextureSwapFilter(background.baseTexture);
    this.addFilter(container, filter);
  }
}