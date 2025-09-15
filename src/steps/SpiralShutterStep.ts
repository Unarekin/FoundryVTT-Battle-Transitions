import { TransitionSequence } from "../interfaces";
import { createColorTexture, parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { SpiralShutterConfiguration } from "./types";
import { SpiralShutterFilter } from "../filters";
import { SpiralShutterConfigApplication } from "../applications";


export class SpiralShutterStep extends TransitionStep<SpiralShutterConfiguration> {
  // #region Properties (7)

  public static DefaultSettings: SpiralShutterConfiguration = Object.freeze({
    id: "",
    type: "spiralshutter",
    duration: 1000,
    direction: "clockwise",
    radial: "inside",
    easing: "none",
    bgSizingMode: "stretch",
    version: "1.1.6",
    backgroundType: "color",
    backgroundImage: "",
    falloff: 0,
    backgroundColor: "#00000000"
  });

  public static category = "wipe";
  public static hidden: boolean = false;
  public static icon = "<i class='bt-icon bt-spiral-shutter fa-fw fas'></i>"
  public static key = "spiralshutter";
  public static name = "SPIRALSHUTTER";
  public static reversible: boolean = true;
  public static preview = `modules/${__MODULE_ID__}/assets/previews/SpiralShutterWipe.webm`;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public static ConfigurationApplication = SpiralShutterConfigApplication as any;

  static getListDescription(config?: SpiralShutterConfiguration): string {
    if (config) return game.i18n?.format("BATTLETRANSITIONS.SPIRALSHUTTER.LABEL", { duration: config.duration, direction: config.direction, background: config.backgroundType === "image" ? config.backgroundImage : config.backgroundType === "color" ? config.backgroundColor : "overlay", radial: config.radial }) ?? "";
    else return "";
  }


  // #endregion Properties (7)

  // #region Public Static Methods (7)



  public static from(config: SpiralShutterConfiguration): SpiralShutterStep
  public static from(form: HTMLFormElement): SpiralShutterStep
  public static from(form: JQuery<HTMLFormElement>): SpiralShutterStep
  public static from(arg: unknown): SpiralShutterStep {
    if (arg instanceof HTMLFormElement) return SpiralShutterStep.fromFormElement(arg);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    else if (((arg as any)[0]) instanceof HTMLFormElement) return SpiralShutterStep.fromFormElement((arg as any)[0] as HTMLFormElement);
    else return new SpiralShutterStep(arg as SpiralShutterConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): SpiralShutterStep {
    const elem = $(form) as JQuery<HTMLFormElement>;

    const backgroundImage = elem.find("#backgroundImage").val() as string ?? "";
    return new SpiralShutterStep({
      ...SpiralShutterStep.DefaultSettings,
      backgroundImage,
      ...parseConfigurationFormElements(elem, "id", "duration", "easing", "backgroundType", "backgroundColor", "direction", "radial", "label", "falloff")
    })
  }

  public static getDuration(config: SpiralShutterConfiguration): number { return { ...SpiralShutterStep.DefaultSettings, ...config }.duration }

  // #endregion Public Static Methods (7)

  // #region Public Methods (1)

  #filter: SpiralShutterFilter | null = null;
  public async reverse(): Promise<void> {
    if (this.#filter instanceof SpiralShutterFilter) await this.simpleReverse(this.#filter);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    const config: SpiralShutterConfiguration = {
      ...SpiralShutterStep.DefaultSettings,
      ...this.config
    };
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new SpiralShutterFilter(config.direction, config.radial, background.baseTexture, config.falloff);
    this.#filter = filter;
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }

  // #endregion Public Methods (1)
}