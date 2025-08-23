import { BilinearWipeConfigApplication } from "../applications";
import { BilinearWipeFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { createColorTexture, parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { BilinearWipeConfiguration } from "./types";

export class BilinearWipeStep extends TransitionStep<BilinearWipeConfiguration> {
  // #region Properties (9)

  #filter: BilinearWipeFilter | null = null;

  public static DefaultSettings: BilinearWipeConfiguration = {
    id: "",
    type: "bilinearwipe",
    duration: 1000,
    easing: "none",
    falloff: 0,
    radial: "inside",
    direction: "vertical",
    version: "1.1.6",
    bgSizingMode: "stretch",
    backgroundType: "color",
    backgroundImage: "",
    backgroundColor: "#00000000"
  }

  public static category = "wipe";
  public static hidden: boolean = false;
  public static icon = `<i class="fas fa-fw fa-arrows-left-right-to-line"></i>`
  public static key = "bilinearwipe";
  public static name = "BILINEARWIPE";
  public static reversible: boolean = true;
  public static preview = `modules/${__MODULE_ID__}/assets/previews/BilinearWipe.webm`;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public static ConfigurationApplication = BilinearWipeConfigApplication as any;

  // #endregion Properties (9)

  // #region Public Static Methods (7)

  public static getRenderContext(config?: BilinearWipeConfiguration): Record<string, unknown> {
    return {
      ...foundry.utils.deepClone(BilinearWipeStep.DefaultSettings),
      ...super.getRenderContext(config)
    }
  }

  static getListDescription(config?: BilinearWipeConfiguration): string {
    if (config) return game.i18n?.format("BATTLETRANSITIONS.BILINEARWIPE.LABEL", { duration: config.duration, background: config.backgroundType === "image" ? config.backgroundImage : config.backgroundType === "color" ? config.backgroundColor : "overlay", direction: config.direction, radial: config.radial }) ?? "";
    else return "";
  }


  public serialize(): BilinearWipeConfiguration | Promise<BilinearWipeConfiguration> {
    const config = super.serialize();
    return config
  }

  public static from(config: BilinearWipeConfiguration): BilinearWipeStep
  public static from(form: JQuery<HTMLFormElement>): BilinearWipeStep
  public static from(form: HTMLFormElement): BilinearWipeStep
  public static from(arg: unknown): BilinearWipeStep {
    if (arg instanceof HTMLFormElement) return BilinearWipeStep.fromFormElement(arg);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    else if (((arg as any)[0]) instanceof HTMLFormElement) return BilinearWipeStep.fromFormElement((arg as any)[0] as HTMLFormElement);
    else return new BilinearWipeStep(arg as BilinearWipeConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): BilinearWipeStep {
    const backgroundImage = $(form).find("#backgroundImage").val() as string ?? "";
    const elem = parseConfigurationFormElements<BilinearWipeConfiguration>($(form) as JQuery<HTMLFormElement>, "id", "duration", "direction", "radial", "easing", "backgroundType", "backgroundColor", "label", "falloff");
    const step = new BilinearWipeStep({
      ...BilinearWipeStep.DefaultSettings,
      ...elem,
      backgroundImage
    });
    return step;
  }

  public static getDuration(config: BilinearWipeConfiguration): number { return { ...BilinearWipeStep.DefaultSettings, ...config }.duration }

  // #endregion Public Static Methods (7)

  // #region Public Methods (2)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, _sequence: TransitionSequence): Promise<void> {
    const config: BilinearWipeConfiguration = {
      ...BilinearWipeStep.DefaultSettings,
      ...this.config
    }
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new BilinearWipeFilter(config.direction, config.radial, background.baseTexture, config.falloff);
    this.#filter = filter;
    this.addFilter(container, filter);
    await this.simpleTween(filter)
  }

  public async reverse(): Promise<void> {
    if (this.#filter instanceof BilinearWipeFilter) await this.simpleReverse(this.#filter);
  }

  // #endregion Public Methods (2)
}