import { BilinearWipeFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { createColorTexture, parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { BilinearWipeConfiguration } from "./types";

export class BilinearWipeStep extends TransitionStep<BilinearWipeConfiguration> {
  static name = "BILINEARWIPE";
  public readonly template = "bilinear-wipe-config";

  static DefaultSettings: BilinearWipeConfiguration = {
    type: "bilinearwipe",
    duration: 1000,
    easing: "none",
    radial: "inside",
    direction: "vertical"
  }

  static from(config: BilinearWipeConfiguration): BilinearWipeStep
  static from(form: JQuery<HTMLFormElement>): BilinearWipeStep
  static from(form: HTMLFormElement): BilinearWipeStep
  static from(arg: unknown): BilinearWipeStep {
    if (arg instanceof HTMLFormElement) return BilinearWipeStep.fromFormElement(arg);
    else if (Array.isArray(arg) && arg[0] instanceof HTMLFormElement) return BilinearWipeStep.fromFormElement(arg[0]);
    else return new BilinearWipeStep(arg as BilinearWipeConfiguration);
  }

  static fromFormElement(form: HTMLFormElement): BilinearWipeStep {
    const backgroundImage = $(form).find("#backgroundImage").val() as string ?? "";
    const elem = parseConfigurationFormElements<BilinearWipeConfiguration>($(form) as JQuery<HTMLFormElement>, "id", "duration", "radial", "easing", "backgroundType", "backgroundColor")
    return new BilinearWipeStep({
      ...BilinearWipeStep.DefaultSettings,
      ...elem,
      serializedTexture: backgroundImage
    });
  }


  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, _sequence: TransitionSequence): Promise<void> {
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new BilinearWipeFilter(this.config.direction, this.config.radial, background.baseTexture);
    this.addFilter(container, filter);
    await this.simpleTween(filter)
  }



}