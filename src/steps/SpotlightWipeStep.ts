import { SpotlightWipeFilter } from "../filters";
import { TransitionSequence } from '../interfaces';
import { createColorTexture, parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { SpotlightWipeConfiguration } from "./types";

export class SpotlightWipeStep extends TransitionStep<SpotlightWipeConfiguration> {
  // #region Properties (4)

  public readonly defaultSettings: Partial<SpotlightWipeConfiguration> = {
    duration: 1000,
    easing: "none"
  }

  public readonly template = "spotlight-wipe-config";

  public static DefaultSettings: SpotlightWipeConfiguration = {
    type: "spotlightwipe",
    duration: 1000,
    easing: "none",
    direction: "top",
    radial: "outside",
    bgSizingMode: "stretch",
    version: "1.1.0"
  }

  public static name = "SPOTLIGHTWIPE";

  // #endregion Properties (4)

  // #region Public Static Methods (5)

  public static from(config: SpotlightWipeConfiguration): SpotlightWipeStep
  public static from(form: HTMLFormElement): SpotlightWipeStep
  public static from(form: JQuery<HTMLFormElement>): SpotlightWipeStep
  public static from(arg: unknown): SpotlightWipeStep {
    if (arg instanceof HTMLFormElement) return SpotlightWipeStep.fromFormElement(arg);
    else if (Array.isArray(arg) && arg[0] instanceof HTMLFormElement) return SpotlightWipeStep.from(arg[0]);
    else return new SpotlightWipeStep(arg as SpotlightWipeConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): SpotlightWipeStep {
    const elem = $(form) as JQuery<HTMLFormElement>;
    const serializedTexture = elem.find("#backgroundImage").val() as string ?? "";

    return new SpotlightWipeStep({
      ...SpotlightWipeStep.DefaultSettings,
      serializedTexture,
      ...parseConfigurationFormElements(elem, "id", "duration", "direction", "radial", "backgroundType", "backgroundColor", "easing")
    });
  }

  // #endregion Public Static Methods (5)

  // #region Public Methods (1)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new SpotlightWipeFilter(this.config.direction, this.config.radial, background.baseTexture);
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }

  // #endregion Public Methods (1)
}
