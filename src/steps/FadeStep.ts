import { FadeTransitionFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { createColorTexture, parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { FadeConfiguration } from "./types";

export class FadeStep extends TransitionStep<FadeConfiguration> {
  static name = "FADE";
  public readonly template = "fade-config";
  static DefaultSettings: FadeConfiguration = {
    type: "fade",
    duration: 1000
  }


  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new FadeTransitionFilter(background.baseTexture);
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }

  static from(config: FadeConfiguration): FadeStep
  static from(form: HTMLFormElement): FadeStep
  static from(form: JQuery<HTMLFormElement>): FadeStep
  static from(arg: unknown): FadeStep {
    if (arg instanceof HTMLFormElement) return FadeStep.fromFormElement(arg);
    else if (Array.isArray(arg) && arg[0] instanceof HTMLFormElement) return FadeStep.fromFormElement(arg[0]);
    else return new FadeStep(arg as FadeConfiguration);
  }

  static fromFormElement(form: HTMLFormElement): FadeStep {
    const backgroundImage = $(form).find("#backgroundImage").val() as string ?? "";
    const elem = parseConfigurationFormElements($(form) as JQuery<HTMLFormElement>, "id", "duration", "backgroundType", "backgroundColor", "easing");
    return new FadeStep({
      ...FadeStep.DefaultSettings,
      ...elem,
      serializedTexture: backgroundImage
    })
  }

}