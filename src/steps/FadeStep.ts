import { FadeTransitionFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { createColorTexture, log, parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { FadeConfiguration } from "./types";
import { FadeConfigApplication } from "../applications";

export class FadeStep extends TransitionStep<FadeConfiguration> {
  // #region Properties (9)

  #filter: FadeTransitionFilter | null = null;

  public static DefaultSettings: FadeConfiguration = Object.freeze({
    id: "",
    type: "fade",
    duration: 1000,
    version: "1.1.6",
    bgSizingMode: "stretch",
    backgroundType: "color",
    backgroundColor: "#00000000",
    easing: "none"
  });

  public static category = "effect";
  public static hidden: boolean = false;
  public static icon = "<i class='bt-icon bt-fade fa-fw fas'></i>"
  public static key = "fade";
  public static name = "FADE";
  public static reversible: boolean = true;
  public static preview = `modules/${__MODULE_ID__}/assets/previews/Fade.webm`;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public static ConfigurationApplication = FadeConfigApplication as any;

  // #endregion Properties (9)

  // #region Public Static Methods (7)

  static getListDescription(config?: FadeConfiguration): string {
    if (config) return game.i18n?.format("BATTLETRANSITIONS.FADE.LABEL", { duration: config.duration, background: config.backgroundType === "image" ? config.backgroundImage : config.backgroundType === "color" ? config.backgroundColor : "overlay" }) ?? "";
    else return "";
  }

  public static from(config: FadeConfiguration): FadeStep
  public static from(form: HTMLFormElement): FadeStep
  public static from(form: JQuery<HTMLFormElement>): FadeStep
  public static from(arg: unknown): FadeStep {
    if (arg instanceof HTMLFormElement) return FadeStep.fromFormElement(arg);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    else if (((arg as any)[0]) instanceof HTMLFormElement) return FadeStep.fromFormElement((arg as any)[0] as HTMLFormElement);
    else return new FadeStep(arg as FadeConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): FadeStep {
    const backgroundImage = $(form).find("#backgroundImage").val() as string ?? "";
    const elem = parseConfigurationFormElements($(form) as JQuery<HTMLFormElement>, "id", "duration", "backgroundType", "backgroundColor", "easing", "label");
    log("Fade parsed:", elem);
    return new FadeStep({
      ...FadeStep.DefaultSettings,
      ...elem,
      backgroundImage
    })
  }

  public static getDuration(config: FadeConfiguration): number { return { ...FadeStep.DefaultSettings, ...config }.duration }

  // #endregion Public Static Methods (7)

  // #region Public Methods (2)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    const config: FadeConfiguration = {
      ...FadeStep.DefaultSettings,
      ...this.config
    }
    const background = config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new FadeTransitionFilter(background.baseTexture);
    this.#filter = filter;
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }

  public async reverse(): Promise<void> {
    if (this.#filter instanceof FadeTransitionFilter) await this.simpleReverse(this.#filter);
  }

  // #endregion Public Methods (2)
}