import { DiamondTransitionFilter } from "../filters";
import { createColorTexture, parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { DiamondWipeConfiguration } from "./types";

export class DiamondWipeStep extends TransitionStep<DiamondWipeConfiguration> {
  static name = "DIAMONDWIPE";
  public readonly template = "diamond-wipe-config";
  static DefaultSettings: DiamondWipeConfiguration = {
    type: "diamondwipe",
    size: 40,
    duration: 1000,
    easing: "none"
  }

  static from(config: DiamondWipeConfiguration): DiamondWipeStep
  static from(form: JQuery<HTMLFormElement>): DiamondWipeStep
  static from(form: HTMLFormElement): DiamondWipeStep
  static from(arg: unknown): DiamondWipeStep {
    if (arg instanceof HTMLFormElement) return DiamondWipeStep.fromFormElement(arg);
    else if (Array.isArray(arg) && arg[0] instanceof HTMLFormElement) return DiamondWipeStep.fromFormElement(arg[0]);
    else return new DiamondWipeStep(arg as DiamondWipeConfiguration);
  }

  static fromFormElement(form: HTMLFormElement): DiamondWipeStep {
    const backgroundImage = $(form).find("#backgroundImage").val() as string ?? "";
    const elem = parseConfigurationFormElements<DiamondWipeConfiguration>($(form) as JQuery<HTMLFormElement>, "id", "duration", "easing", "backgroundType", "backgroundColor");
    return new DiamondWipeStep({
      ...DiamondWipeStep.DefaultSettings,
      ...elem,
      serializedTexture: backgroundImage
    })
  }

  public async execute(container: PIXI.Container): Promise<void> {
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new DiamondTransitionFilter(this.config.size, background.baseTexture);
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }
}