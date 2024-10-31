import { MeltFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { createColorTexture, parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { MeltConfiguration } from "./types";

export class MeltStep extends TransitionStep<MeltConfiguration> {
  // #region Properties (3)

  public readonly template = "melt-config";

  public static DefaultSettings: MeltConfiguration = {
    type: "melt",
    duration: 1000,
    version: "1.1.0",
    easing: "none",
    bgSizingMode: "stretch"
  }

  public static name = "MELT";

  // #endregion Properties (3)

  // #region Public Static Methods (5)

  public static from(config: MeltConfiguration): MeltStep
  public static from(form: JQuery<HTMLFormElement>): MeltStep
  public static from(form: HTMLFormElement): MeltStep
  public static from(arg: unknown): MeltStep {
    if (arg instanceof HTMLFormElement) return MeltStep.fromFormElement(arg);
    else if (Array.isArray(arg) && arg[0] instanceof HTMLFormElement) return MeltStep.fromFormElement(arg[0]);
    else return new MeltStep(arg as MeltConfiguration);
  }

  public static fromFormElement(form: HTMLElement): MeltStep {
    const backgroundImage = $(form).find("#backgroudnimage").val() as string ?? "";
    const elem = parseConfigurationFormElements($(form) as JQuery<HTMLFormElement>, "id", "duration", "easing", "backgroundType", "backgroundColor");
    return new MeltStep({
      ...MeltStep.DefaultSettings,
      ...elem,
      serializedTexture: backgroundImage
    });
  }

  // #endregion Public Static Methods (5)

  // #region Public Methods (1)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new MeltFilter(background.baseTexture);
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }

  // #endregion Public Methods (1)
}