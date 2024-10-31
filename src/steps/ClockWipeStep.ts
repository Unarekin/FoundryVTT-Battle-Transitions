import { ClockWipeFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { Easing } from "../types";
import { createColorTexture, parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { ClockWipeConfiguration } from "./types";

export class ClockWipeStep extends TransitionStep<ClockWipeConfiguration> {
  static name = "CLOCKWIPE";

  public readonly template = "clock-wipe-config";
  static DefaultSettings: ClockWipeConfiguration = {
    type: "clockwipe",
    duration: 1000,
    easing: "none" as Easing,
    clockDirection: "clockwise",
    direction: "top",
    version: "1.1.0",
    bgSizingMode: "stretch"
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new ClockWipeFilter(this.config.clockDirection, this.config.direction, background.baseTexture);
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }

  static from(config: ClockWipeConfiguration): ClockWipeStep
  static from(form: HTMLFormElement): ClockWipeStep
  static from(form: JQuery<HTMLFormElement>): ClockWipeStep
  static from(arg: unknown): ClockWipeStep {
    if (arg instanceof HTMLFormElement) return ClockWipeStep.fromFormElement(arg);
    else if (Array.isArray(arg) && arg[0] instanceof HTMLFormElement) return ClockWipeStep.fromFormElement(arg[0]);
    else return new ClockWipeStep(arg as ClockWipeConfiguration);
  }

  static fromFormElement(form: HTMLFormElement): ClockWipeStep {
    const backgroundImage = $(form).find("#backgroundImage").val() as string ?? "";
    const elem = parseConfigurationFormElements($(form) as JQuery<HTMLFormElement>, "id", "duration", "direction", "clockdirection", "easing", "backgroundType", "backgroundColor");

    return new ClockWipeStep({
      ...ClockWipeStep.DefaultSettings,
      ...elem,
      serializedTexture: backgroundImage
    })

  }
}
