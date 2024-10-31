import { BilinearWipeFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { createColorTexture, parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { BilinearWipeConfiguration } from "./types";

export class BilinearWipeStep extends TransitionStep<BilinearWipeConfiguration> {
  // #region Properties (3)

  public readonly template = "bilinear-wipe-config";

  public static DefaultSettings: BilinearWipeConfiguration = {
    type: "bilinearwipe",
    duration: 1000,
    easing: "none",
    radial: "inside",
    direction: "vertical",
    version: "1.1.0",
    bgSizingMode: "stretch"
  }

  public static name = "BILINEARWIPE";

  // #endregion Properties (3)

  // #region Public Static Methods (5)

  public static from(config: BilinearWipeConfiguration): BilinearWipeStep
  public static from(form: JQuery<HTMLFormElement>): BilinearWipeStep
  public static from(form: HTMLFormElement): BilinearWipeStep
  public static from(arg: unknown): BilinearWipeStep {
    if (arg instanceof HTMLFormElement) return BilinearWipeStep.fromFormElement(arg);
    else if (Array.isArray(arg) && arg[0] instanceof HTMLFormElement) return BilinearWipeStep.fromFormElement(arg[0]);
    else return new BilinearWipeStep(arg as BilinearWipeConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): BilinearWipeStep {
    const backgroundImage = $(form).find("#backgroundImage").val() as string ?? "";
    const elem = parseConfigurationFormElements<BilinearWipeConfiguration>($(form) as JQuery<HTMLFormElement>, "id", "duration", "radial", "easing", "backgroundType", "backgroundColor")
    return new BilinearWipeStep({
      ...BilinearWipeStep.DefaultSettings,
      ...elem,
      serializedTexture: backgroundImage
    });
  }

  // #endregion Public Static Methods (5)

  // #region Public Methods (1)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, _sequence: TransitionSequence): Promise<void> {
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new BilinearWipeFilter(this.config.direction, this.config.radial, background.baseTexture);
    this.addFilter(container, filter);
    await this.simpleTween(filter)
  }

  // #endregion Public Methods (1)
}