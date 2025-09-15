import { ClockWipeFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { Easing } from "../types";
import { createColorTexture, parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { ClockWipeConfiguration } from "./types";
import { ClockWipeConfigApplication } from "../applications";

export class ClockWipeStep extends TransitionStep<ClockWipeConfiguration> {
  // #region Properties (9)

  #filter: ClockWipeFilter | null = null;

  public static DefaultSettings: ClockWipeConfiguration = Object.freeze({
    id: "",
    type: "clockwipe",
    duration: 1000,
    easing: "none" as Easing,
    clockDirection: "clockwise",
    direction: "top",
    version: "1.1.6",
    bgSizingMode: "stretch",
    backgroundType: "color",
    backgroundImage: "",
    falloff: 0,
    backgroundColor: "#00000000"
  });

  public static category = "wipe";
  public static hidden: boolean = false;
  public static icon = "<i class='bt-icon bt-clock-wipe fa-fw fas'></i>"
  public static key = "clockwipe"
  public static name = "CLOCKWIPE";
  public static reversible: boolean = true;
  public static template = "clockwipe-config";
  public static preview = `modules/${__MODULE_ID__}/assets/previews/ClockWipe.webm`;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public static ConfigurationApplication = ClockWipeConfigApplication as any;

  // #endregion Properties (9)

  // #region Public Static Methods (7)


  static getListDescription(config?: ClockWipeConfiguration): string {
    if (config) return game.i18n?.format("BATTLETRANSITIONS.CLOCKWIPE.LABEL", { duration: config.duration, background: config.backgroundType === "image" ? config.backgroundImage : config.backgroundType === "color" ? config.backgroundColor : "overlay", direction: config.direction, clockDirection: config.clockDirection }) ?? "";
    else return "";
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
    const elem = parseConfigurationFormElements($(form) as JQuery<HTMLFormElement>, "id", "duration", "direction", "clockDirection", "easing", "backgroundType", "backgroundColor", "label", "falloff");

    return new ClockWipeStep({
      ...ClockWipeStep.DefaultSettings,
      ...elem,
      backgroundImage
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
    const filter = new ClockWipeFilter(config.clockDirection, config.direction, background.baseTexture, config.falloff);
    this.#filter = filter;
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }

  public async reverse(): Promise<void> {
    if (this.#filter instanceof ClockWipeFilter) await this.simpleReverse(this.#filter);
  }

  // #endregion Public Methods (2)
}
