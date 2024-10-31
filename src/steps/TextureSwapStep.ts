import { TextureSwapFilter } from "../filters";
import { TransitionSequence } from '../interfaces';
import { createColorTexture, parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { TextureSwapConfiguration } from "./types";

export class TextureSwapStep extends TransitionStep<TextureSwapConfiguration> {
  static name = "TEXTURESWAP";
  public readonly template = "textureswap-config";

  static DefaultSettings: TextureSwapConfiguration = { type: "textureswap" };

  public readonly defaultSettings: Partial<TextureSwapConfiguration> = {};

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public execute(container: PIXI.Container, sequence: TransitionSequence): void {
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new TextureSwapFilter(background.baseTexture);
    this.addFilter(container, filter);
  }

  static from(config: TextureSwapConfiguration): TextureSwapStep
  static from(form: HTMLFormElement): TextureSwapStep
  static from(form: JQuery<HTMLFormElement>): TextureSwapStep
  static from(arg: unknown): TextureSwapStep {
    if (arg instanceof HTMLFormElement) return TextureSwapStep.fromFormElement(arg);
    else if (Array.isArray(arg) && arg[0] instanceof HTMLFormElement) return TextureSwapStep.fromFormElement(arg[0]);
    else return new TextureSwapStep(arg as TextureSwapConfiguration);
  }

  static fromFormElement(form: HTMLFormElement): TextureSwapStep {
    const elem = $(form) as JQuery<HTMLFormElement>;
    const serializedTexture = elem.find("#backgroundImage").val() as string ?? "";

    return new TextureSwapStep({
      ...TextureSwapStep.DefaultSettings,
      serializedTexture,
      ...parseConfigurationFormElements(elem, "id", "backgroundType", "backgroundColor")
    });
  }
}