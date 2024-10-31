import { LinearWipeFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { createColorTexture, parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { LinearWipeConfiguration } from "./types";

export class LinearWipeStep extends TransitionStep<LinearWipeConfiguration> {
  static name = "LINEARWIPE";
  public readonly template = "linear-wipe-config";
  static DefaultSettings: LinearWipeConfiguration = {
    type: "linearwipe",
    duration: 1000,
    easing: "none",
    direction: "left"
  }
  public readonly defaultSettings: Partial<LinearWipeConfiguration> = {
    duration: 1000
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence) {
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new LinearWipeFilter(this.config.direction, background.baseTexture);
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }

  static from(config: LinearWipeConfiguration): LinearWipeStep
  static from(form: JQuery<HTMLFormElement>): LinearWipeStep
  static from(form: HTMLFormElement): LinearWipeStep
  static from(arg: unknown): LinearWipeStep {
    if (arg instanceof HTMLFormElement) return LinearWipeStep.fromFormElement(arg);
    if (Array.isArray(arg) && arg[0] instanceof HTMLFormElement) return LinearWipeStep.fromFormElement(arg[0]);
    else return new LinearWipeStep(arg as LinearWipeConfiguration);
  }

  static fromFormElement(form: HTMLFormElement): LinearWipeStep {
    const backgroundImage = $(form).find("#backgroundImage").val() as string ?? "";
    const elem = parseConfigurationFormElements($(form) as JQuery<HTMLFormElement>, "id", "duration", "direction", "easing", "backgroundType", "backgroundColor");
    return new LinearWipeStep({
      ...LinearWipeStep.DefaultSettings,
      ...elem,
      serializedTexture: backgroundImage
    });
  }
}