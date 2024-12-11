import { ClockWipeFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { Easing } from "../types";
import { createColorTexture, parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { ClockWipeConfiguration } from "./types";
import { generateBackgroundTypeSelectOptions, generateClockDirectionSelectOptions, generateEasingSelectOptions } from './selectOptions';

export class ClockWipeStep extends TransitionStep<ClockWipeConfiguration> {
  // #region Properties (9)

  #filter: ClockWipeFilter | null = null;

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
  public static reversible: boolean = true;
  public static template = "clockwipe-config";

  // #endregion Properties (9)

  // #region Public Static Methods (7)

  public static RenderTemplate(config?: ClockWipeConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${ClockWipeStep.template}.hbs`, {
      ...ClockWipeStep.DefaultSettings,
      id: foundry.utils.randomID(),
      ...(config ? config : {}),
      easingSelect: generateEasingSelectOptions(),
      clockDirectionSelect: generateClockDirectionSelectOptions(),
      bgTypeSelect: generateBackgroundTypeSelectOptions(),
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

  // #region Public Methods (2)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    const config: ClockWipeConfiguration = {
      ...ClockWipeStep.DefaultSettings,
      ...this.config
    }
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new ClockWipeFilter(config.clockDirection, config.direction, background.baseTexture);
    this.#filter = filter;
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }

  public async reverse(): Promise<void> {
    if (this.#filter instanceof ClockWipeFilter) await this.simpleReverse(this.#filter);
  }

  // #endregion Public Methods (2)
}
