import { RadialWipeFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { Easing } from "../types";
import { createColorTexture, parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { RadialWipeConfiguration } from "./types";

export class RadialWipeStep extends TransitionStep<RadialWipeConfiguration> {
  // #region Properties (4)

  public readonly defaultSettings: Partial<RadialWipeConfiguration> = {
    duration: 1000,
    easing: "none" as Easing
  }

  public readonly template = "radial-wipe-config";

  public static DefaultSettings: RadialWipeConfiguration = {
    type: "radialwipe",
    easing: "none",
    radial: "inside",
    duration: 1000,
    bgSizingMode: "stretch",
    version: "1.1.0"
  }

  public static name = "RADIALWIPE";

  // #endregion Properties (4)

  // #region Public Static Methods (5)

  public static from(config: RadialWipeConfiguration): RadialWipeStep
  public static from(form: HTMLFormElement): RadialWipeStep
  public static from(form: JQuery<HTMLFormElement>): RadialWipeStep
  public static from(arg: unknown): RadialWipeStep {
    if (arg instanceof HTMLFormElement) return RadialWipeStep.fromFormElement(arg);
    else if (Array.isArray(arg) && arg[0] instanceof HTMLFormElement) return RadialWipeStep.fromFormElement(arg[0]);
    else return new RadialWipeStep(arg as RadialWipeConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): RadialWipeStep {
    const elem = $(form) as JQuery<HTMLFormElement>;
    const serializedTexture = elem.find("#backgroundImage").val() as string ?? "";
    return new RadialWipeStep({
      ...RadialWipeStep.DefaultSettings,
      serializedTexture,
      ...parseConfigurationFormElements(elem, "id", "duration", "radial", "backgroundType", "backgroundColor", "easing")
    });
  }

  // #endregion Public Static Methods (5)

  // #region Public Methods (1)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new RadialWipeFilter(this.config.radial, background.baseTexture);
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }

  // #endregion Public Methods (1)
}