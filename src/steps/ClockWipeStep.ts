import { ClockWipeFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { Easing } from "../types";
import { createColorTexture, generateClockDirectionSelectOptions, generateEasingSelectOptions, parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { ClockWipeConfiguration } from "./types";

export class ClockWipeStep extends TransitionStep<ClockWipeConfiguration> {
  // #region Properties (7)

  public static DefaultSettings: ClockWipeConfiguration = {
    id: "",
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

  public static category = "wipe";
  public static hidden: boolean = false;
  public static icon = "<i class='bt-icon clock-wipe fa-fw fas'></i>"
  public static key = "clockwipe"
  public static name = "CLOCKWIPE";
  public static template = "clockwipe-config";

  // #endregion Properties (7)

  // #region Public Static Methods (7)

  public static RenderTemplate(config?: ClockWipeConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${ClockWipeStep.template}.hbs`, {
      ...ClockWipeStep.DefaultSettings,
      id: foundry.utils.randomID(),
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
    const elem = parseConfigurationFormElements($(form) as JQuery<HTMLFormElement>, "id", "duration", "direction", "clockdirection", "easing", "backgroundType", "backgroundColor", "label");

    return new ClockWipeStep({
      ...ClockWipeStep.DefaultSettings,
      ...elem,
      serializedTexture: backgroundImage
    })
  }

  public static getDuration(config: ClockWipeConfiguration): number { return { ...ClockWipeStep.DefaultSettings, ...config }.duration }

  // #endregion Public Static Methods (7)

  // #region Public Methods (1)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    const config: ClockWipeConfiguration = {
      ...ClockWipeStep.DefaultSettings,
      ...this.config
    }
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new ClockWipeFilter(config.clockDirection, config.direction, background.baseTexture);
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }

  // #endregion Public Methods (1)
}