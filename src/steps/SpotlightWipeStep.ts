import { SpotlightWipeFilter } from "../filters";
import { TransitionSequence } from '../interfaces';
import { createColorTexture, localize, parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { SpotlightWipeConfiguration } from "./types";
import { SpotlightWipeConfigApplication } from "../applications";


export class SpotlightWipeStep extends TransitionStep<SpotlightWipeConfiguration> {
  // #region Properties (8)

  public readonly defaultSettings: Partial<SpotlightWipeConfiguration> = {
    duration: 1000,
    easing: "none"
  }

  public static DefaultSettings: SpotlightWipeConfiguration = Object.freeze({
    id: "",
    type: "spotlightwipe",
    duration: 1000,
    easing: "none",
    direction: "top",
    radial: "outside",
    bgSizingMode: "stretch",
    version: "1.1.6",
    backgroundType: "color",
    backgroundImage: "",
    backgroundColor: "#00000000",
    falloff: 0
  });

  public static category = "wipe";
  public static hidden: boolean = false;
  public static icon = "<i class='bt-icon bt-spotlight-wipe fa-fw fas'></i>"
  public static key = "spotlightwipe";
  public static name = "SPOTLIGHTWIPE";
  public static reversible: boolean = true;
  public static preview = `modules/${__MODULE_ID__}/assets/previews/SpotlightWipe.webm`;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public static ConfigurationApplication = SpotlightWipeConfigApplication as any;

  // #endregion Properties (8)

  // #region Public Static Methods (7)
  public static getListDescription(config?: SpotlightWipeConfiguration): string {
    if (config) return localize("BATTLETRANSITIONS.SPOTLIGHTWIPE.LABEL", { direction: config.direction, background: config.backgroundType === "image" ? config.backgroundImage : config.backgroundType === "color" ? config.backgroundColor : "overlay", duration: config.duration });
    else return "";
  }

  public static from(config: SpotlightWipeConfiguration): SpotlightWipeStep
  public static from(form: HTMLFormElement): SpotlightWipeStep
  public static from(form: JQuery<HTMLFormElement>): SpotlightWipeStep
  public static from(arg: unknown): SpotlightWipeStep {
    if (arg instanceof HTMLFormElement) return SpotlightWipeStep.fromFormElement(arg);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    else if (((arg as any)[0]) instanceof HTMLFormElement) return SpotlightWipeStep.fromFormElement((arg as any)[0] as HTMLFormElement);
    else return new SpotlightWipeStep(arg as SpotlightWipeConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): SpotlightWipeStep {
    const elem = $(form) as JQuery<HTMLFormElement>;
    const backgroundImage = elem.find("#backgroundImage").val() as string ?? "";

    return new SpotlightWipeStep({
      ...SpotlightWipeStep.DefaultSettings,
      backgroundImage,
      ...parseConfigurationFormElements(elem, "id", "duration", "direction", "radial", "backgroundType", "backgroundColor", "easing", "label", "falloff")
    });
  }

  public static getDuration(config: SpotlightWipeConfiguration): number { return { ...SpotlightWipeStep.DefaultSettings, ...config }.duration }

  // #endregion Public Static Methods (7)


  // #region Public Methods (1)

  #filter: SpotlightWipeFilter | null = null;
  public async reverse(): Promise<void> {
    if (this.#filter instanceof SpotlightWipeFilter) await this.simpleReverse(this.#filter);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    const config: SpotlightWipeConfiguration = {
      ...SpotlightWipeStep.DefaultSettings,
      ...this.config
    };
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new SpotlightWipeFilter(config.direction, config.radial, background.baseTexture, config.falloff);
    this.#filter = filter;
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }

  // #endregion Public Methods (1)
}
