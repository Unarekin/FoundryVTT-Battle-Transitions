import { FadeTransitionFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { createColorTexture, parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { FadeConfiguration } from "./types";

export class FadeStep extends TransitionStep<FadeConfiguration> {
  // #region Properties (3)

  public readonly template = "fade-config";

  public static DefaultSettings: FadeConfiguration = {
    type: "fade",
    duration: 1000,
    version: "1.1.0",
    bgSizingMode: "stretch"
  }

  public static name = "FADE";

  // #endregion Properties (3)

  // #region Public Static Methods (5)

  public static from(config: FadeConfiguration): FadeStep
  public static from(form: HTMLFormElement): FadeStep
  public static from(form: JQuery<HTMLFormElement>): FadeStep
  public static from(arg: unknown): FadeStep {
    if (arg instanceof HTMLFormElement) return FadeStep.fromFormElement(arg);
    else if (Array.isArray(arg) && arg[0] instanceof HTMLFormElement) return FadeStep.fromFormElement(arg[0]);
    else return new FadeStep(arg as FadeConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): FadeStep {
    const backgroundImage = $(form).find("#backgroundImage").val() as string ?? "";
    const elem = parseConfigurationFormElements($(form) as JQuery<HTMLFormElement>, "id", "duration", "backgroundType", "backgroundColor", "easing");
    return new FadeStep({
      ...FadeStep.DefaultSettings,
      ...elem,
      serializedTexture: backgroundImage
    })
  }

  // #endregion Public Static Methods (5)

  // #region Public Methods (1)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new FadeTransitionFilter(background.baseTexture);
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }

  // #endregion Public Methods (1)
}