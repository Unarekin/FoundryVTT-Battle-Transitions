import { RadialWipeFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { Easing } from "../types";
import { createColorTexture, parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { RadialWipeConfiguration } from "./types";

export class RadialWipeStep extends TransitionStep<RadialWipeConfiguration> {
  static name = "RADIALWIPE";
  public readonly template = "radial-wipe-config";

  static DefaultSettings: RadialWipeConfiguration = {
    type: "radialwipe",
    easing: "none",
    radial: "inside",
    duration: 1000
  }

  public readonly defaultSettings: Partial<RadialWipeConfiguration> = {
    duration: 1000,
    easing: "none" as Easing
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new RadialWipeFilter(this.config.radial, background.baseTexture);
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }

  static from(config: RadialWipeConfiguration): RadialWipeStep
  static from(form: HTMLFormElement): RadialWipeStep
  static from(form: JQuery<HTMLFormElement>): RadialWipeStep
  static from(arg: unknown): RadialWipeStep {
    if (arg instanceof HTMLFormElement) return RadialWipeStep.fromFormElement(arg);
    else if (Array.isArray(arg) && arg[0] instanceof HTMLFormElement) return RadialWipeStep.fromFormElement(arg[0]);
    else return new RadialWipeStep(arg as RadialWipeConfiguration);
  }

  static fromFormElement(form: HTMLFormElement): RadialWipeStep {
    const elem = $(form) as JQuery<HTMLFormElement>;
    const serializedTexture = elem.find("#backgroundImage").val() as string ?? "";
    return new RadialWipeStep({
      ...RadialWipeStep.DefaultSettings,
      serializedTexture,
      ...parseConfigurationFormElements(elem, "id", "duration", "radial", "backgroundType", "backgroundColor", "easing")
    });
  }

}