import { TransitionSequence } from "../interfaces";
import { createColorTexture, parseConfigurationFormElements, renderTemplateFunc } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { SpiralShutterConfiguration } from "./types";
import { SpiralShutterFilter } from "../filters";
import { generateBackgroundTypeSelectOptions, generateClockDirectionSelectOptions, generateEasingSelectOptions, generateRadialDirectionSelectOptions } from './selectOptions';
import { reconcileBackground } from "./functions";


export class SpiralShutterStep extends TransitionStep<SpiralShutterConfiguration> {
  // #region Properties (7)

  public static DefaultSettings: SpiralShutterConfiguration = {
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
  }

  public static category = "wipe";
  public static hidden: boolean = false;
  public static icon = "<i class='bt-icon spiral-shutter fa-fw fas'></i>"
  public static key = "spiralshutter";
  public static name = "SPIRALSHUTTER";
  public static template = "spiralshutter-config";
  public static reversible: boolean = true;

  // #endregion Properties (7)

  // #region Public Static Methods (7)

  public static async RenderTemplate(config?: SpiralShutterConfiguration): Promise<string> {
    return (renderTemplateFunc())(`modules/${__MODULE_ID__}/templates/config/${SpiralShutterStep.template}.hbs`, {
      ...SpiralShutterStep.DefaultSettings,
      id: foundry.utils.randomID(),
      ...(config ? config : {}),
      ...(config ? reconcileBackground(config) : {}),
      easingSelect: generateEasingSelectOptions(),
      bgTypeSelect: generateBackgroundTypeSelectOptions(),
      radialSelect: generateRadialDirectionSelectOptions(),
      directionSelect: generateClockDirectionSelectOptions()
    });
  }

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