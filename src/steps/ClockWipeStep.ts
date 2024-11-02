import { ClockWipeFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { Easing } from "../types";
import { createColorTexture, generateClockDirectionSelectOptions, generateEasingSelectOptions, parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { ClockWipeConfiguration } from "./types";

export class ClockWipeStep extends TransitionStep<ClockWipeConfiguration> {
  // #region Properties (5)

  public static DefaultSettings: ClockWipeConfiguration = {
    type: "clockwipe",
    duration: 1000,
    easing: "none" as Easing,
    clockDirection: "clockwise",
    direction: "top",
    version: "1.1.0",
    bgSizingMode: "stretch",
    backgroundType: "color",
    backgroundImage: "",
    backgroundColor: "#00000000"
  }

  public static hidden: boolean = false;
  public static key = "clockwipe"
  public static name = "CLOCKWIPE";
  public static template = "clockwipe-config";

  // #endregion Properties (5)

  // #region Public Static Methods (6)

  public static RenderTemplate(config?: ClockWipeConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${ClockWipeStep.template}.hbs`, {
      id: foundry.utils.randomID(),
      ...ClockWipeStep.DefaultSettings,
      ...(config ? config : {}),
      easingSelect: generateEasingSelectOptions(),
      clockDirectionSelect: generateClockDirectionSelectOptions(),
      directionSelect: {
        top: "BATTLETRANSITIONS.DIRECTIONS.TOP",
        left: "BATTLETRANSITIONS.DIRECTIONS.LEFT",
        right: "BATTLETRANSITIONS.DIRECTIONS.RIGHT",
        bottom: "BATTLETRANSITIONS.DIRECTIONS.BOTTOM"
      }
    });
  }

  public static from(config: ClockWipeConfiguration): ClockWipeStep
  public static from(form: HTMLFormElement): ClockWipeStep
  public static from(form: JQuery<HTMLFormElement>): ClockWipeStep
  public static from(arg: unknown): ClockWipeStep {
    if (arg instanceof HTMLFormElement) return ClockWipeStep.fromFormElement(arg);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    else if (((arg as any)[0]) instanceof HTMLFormElement) return ClockWipeStep.fromFormElement((arg as any)[0] as HTMLFormElement);
    else return new ClockWipeStep(arg as ClockWipeConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): ClockWipeStep {
    const backgroundImage = $(form).find("#backgroundImage").val() as string ?? "";
    const elem = parseConfigurationFormElements($(form) as JQuery<HTMLFormElement>, "id", "duration", "direction", "clockdirection", "easing", "backgroundType", "backgroundColor");

    return new ClockWipeStep({
      ...ClockWipeStep.DefaultSettings,
      ...elem,
      serializedTexture: backgroundImage
    })
  }

  // #endregion Public Static Methods (6)

  // #region Public Methods (1)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new ClockWipeFilter(this.config.clockDirection, this.config.direction, background.baseTexture);
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }

  // #endregion Public Methods (1)
}
