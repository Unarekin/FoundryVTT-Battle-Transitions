import { TextureSwapFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { createColorTexture, parseConfigurationFormElements, wait } from '../utils';
import { TransitionStep } from "./TransitionStep";
import { FlashConfiguration } from "./types";


export class FlashStep extends TransitionStep<FlashConfiguration> {
  static name = "FLASH";
  public readonly template = "flash-config";
  static DefaultSettings: FlashConfiguration = {
    type: "flash",
    duration: 250
  }

  static from(config: FlashConfiguration): FlashStep
  static from(form: JQuery<HTMLFormElement>): FlashStep
  static from(form: HTMLFormElement): FlashStep
  static from(arg: unknown): FlashStep {
    if (arg instanceof HTMLFormElement) return FlashStep.fromFormElement(arg);
    else if (Array.isArray(arg) && arg[0] instanceof HTMLFormElement) return FlashStep.fromFormElement(arg);
  }

  static fromFormElement(form: HTMLFormElement): FlashStep {
    const backgroundImage = $(form).find("#backgroundImage").val() as string ?? "";
    const elem = parseConfigurationFormElements($(form) as JQuery<HTMLFormElement>, "id", "duration", "backgroundType", "backgroundColor");
    return new FlashStep({
      ...FlashStep.DefaultSettings,
      ...elem,
      serializedTexture: backgroundImage
    })
  }

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