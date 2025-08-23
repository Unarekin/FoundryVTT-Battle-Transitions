import { DiamondTransitionFilter } from "../filters";
import { createColorTexture, parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { DiamondWipeConfiguration } from "./types";
import { DiamondWipeConfigApplication } from "../applications";

export class DiamondWipeStep extends TransitionStep<DiamondWipeConfiguration> {
  // #region Properties (7)

  public static DefaultSettings: DiamondWipeConfiguration = {
    id: "",
    type: "diamondwipe",
    size: 40,
    duration: 1000,
    easing: "none",
    version: "1.1.6",
    bgSizingMode: "stretch",
    backgroundType: "color",
    backgroundImage: "",
    backgroundColor: "#00000000",
    falloff: 0
  }

  public static category = "wipe";
  public static hidden: boolean = false;
  public static icon = "<i class='bt-icon bt-diamond-wipe fa-fw fas'></i>"
  public static key = "diamondwipe";
  public static name = "DIAMONDWIPE";
  public static template = "diamondwipe-config";
  public static reversible: boolean = true;
  public static preview = `modules/${__MODULE_ID__}/assets/previews/DiamondWipe.webm`;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public static ConfigurationApplication = DiamondWipeConfigApplication as any;

  // #endregion Properties (7)

  // #region Public Static Methods (7)


  static getListDescription(config?: DiamondWipeConfiguration): string {
    if (config) return game.i18n?.format("BATTLETRANSITIONS.DIAMONDWIPE.LABEL", { duration: config.duration, background: config.backgroundType === "image" ? config.backgroundImage : config.backgroundType === "color" ? config.backgroundColor : "overlay" }) ?? "";
    else return "";
  }


  public static from(config: DiamondWipeConfiguration): DiamondWipeStep
  public static from(form: JQuery<HTMLFormElement>): DiamondWipeStep
  public static from(form: HTMLFormElement): DiamondWipeStep
  public static from(arg: unknown): DiamondWipeStep {
    if (arg instanceof HTMLFormElement) return DiamondWipeStep.fromFormElement(arg);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    else if (((arg as any)[0]) instanceof HTMLFormElement) return DiamondWipeStep.fromFormElement((arg as any)[0] as HTMLFormElement);
    else return new DiamondWipeStep(arg as DiamondWipeConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): DiamondWipeStep {
    const backgroundImage = $(form).find("#backgroundImage").val() as string ?? "";
    const elem = parseConfigurationFormElements<DiamondWipeConfiguration>($(form) as JQuery<HTMLFormElement>, "id", "duration", "easing", "backgroundType", "backgroundColor", "label");
    return new DiamondWipeStep({
      ...DiamondWipeStep.DefaultSettings,
      ...elem,
      backgroundImage
    })
  }

  public static getDuration(config: DiamondWipeConfiguration): number { return { ...DiamondWipeStep.DefaultSettings, ...config }.duration }

  // #endregion Public Static Methods (7)

  // #region Public Methods (1)

  #filter: DiamondTransitionFilter | null = null;
  public async reverse(): Promise<void> {
    if (this.#filter instanceof DiamondTransitionFilter) await this.simpleReverse(this.#filter);
  }

  public async execute(container: PIXI.Container): Promise<void> {
    const config: DiamondWipeConfiguration = {
      ...DiamondWipeStep.DefaultSettings,
      ...this.config
    }
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new DiamondTransitionFilter(config.size, background.baseTexture);
    this.#filter = filter;
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }

  // #endregion Public Methods (1)
}