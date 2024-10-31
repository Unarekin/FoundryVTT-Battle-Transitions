import { LinearWipeFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { createColorTexture, generateEasingSelectOptions, generateLinearDirectionSelectOptions, parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { LinearWipeConfiguration } from "./types";

export class LinearWipeStep extends TransitionStep<LinearWipeConfiguration> {
  // #region Properties (6)

  public readonly defaultSettings: Partial<LinearWipeConfiguration> = {
    duration: 1000
  }

  public static DefaultSettings: LinearWipeConfiguration = {
    type: "linearwipe",
    duration: 1000,
    easing: "none",
    direction: "left",
    version: "1.1.0",
    bgSizingMode: "stretch",
    backgroundType: "color",
    backgroundImage: "",
    backgroundColor: "#00000000"
  }

  public static hidden: boolean = false;
  public static key = "linearwipe";
  public static name = "LINEARWIPE";
  public static template = "linearwipe-config";

  // #endregion Properties (6)

  // #region Public Static Methods (6)

  public static async RenderTemplate(config?: LinearWipeConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${LinearWipeStep.template}.hbs`, {
      id: foundry.utils.randomID(),
      ...LinearWipeStep.DefaultSettings,
      ...(config ? config : {}),
      easingSelect: generateEasingSelectOptions(),
      directionSelect: generateLinearDirectionSelectOptions()
    });
  }

  public static from(config: LinearWipeConfiguration): LinearWipeStep
  public static from(form: JQuery<HTMLFormElement>): LinearWipeStep
  public static from(form: HTMLFormElement): LinearWipeStep
  public static from(arg: unknown): LinearWipeStep {
    if (arg instanceof HTMLFormElement) return LinearWipeStep.fromFormElement(arg);
    if (Array.isArray(arg) && arg[0] instanceof HTMLFormElement) return LinearWipeStep.fromFormElement(arg[0]);
    else return new LinearWipeStep(arg as LinearWipeConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): LinearWipeStep {
    const backgroundImage = $(form).find("#backgroundImage").val() as string ?? "";
    const elem = parseConfigurationFormElements($(form) as JQuery<HTMLFormElement>, "id", "duration", "direction", "easing", "backgroundType", "backgroundColor");
    return new LinearWipeStep({
      ...LinearWipeStep.DefaultSettings,
      ...elem,
      serializedTexture: backgroundImage
    });
  }

  // #endregion Public Static Methods (6)

  // #region Public Methods (1)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence) {
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new LinearWipeFilter(this.config.direction, background.baseTexture);
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }

  // #endregion Public Methods (1)
}