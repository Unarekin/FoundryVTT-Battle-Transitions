import { MeltFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { createColorTexture, parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { MeltConfiguration } from "./types";

export class MeltStep extends TransitionStep<MeltConfiguration> {
  static name = "MELT";
  public readonly template = "melt-config";

  static DefaultSettings: MeltConfiguration = {
    type: "melt",
    duration: 1000,
    easing: "none"
  }


  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new MeltFilter(background.baseTexture);
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }

  static from(config: MeltConfiguration): MeltStep
  static from(form: JQuery<HTMLFormElement>): MeltStep
  static from(form: HTMLFormElement): MeltStep
  static from(arg: unknown): MeltStep {
    if (arg instanceof HTMLFormElement) return MeltStep.fromFormElement(arg);
    else if (Array.isArray(arg) && arg[0] instanceof HTMLFormElement) return MeltStep.fromFormElement(arg[0]);
    else return new MeltStep(arg as MeltConfiguration);
  }

  static fromFormElement(form: HTMLElement): MeltStep {
    const backgroundImage = $(form).find("#backgroudnimage").val() as string ?? "";
    const elem = parseConfigurationFormElements($(form) as JQuery<HTMLFormElement>, "id", "duration", "easing", "backgroundType", "backgroundColor");
    return new MeltStep({
      ...MeltStep.DefaultSettings,
      ...elem,
      serializedTexture: backgroundImage
    });
  }

}