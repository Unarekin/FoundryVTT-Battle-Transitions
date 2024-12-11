import { WaveWipeFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { createColorTexture, parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { WaveWipeConfiguration } from "./types";
import { generateBackgroundTypeSelectOptions, generateEasingSelectOptions, generateRadialDirectionSelectOptions } from './selectOptions';
import { reconcileBackground } from "./functions";

export class WaveWipeStep extends TransitionStep<WaveWipeConfiguration> {
  // #region Properties (7)

  public static DefaultSettings: WaveWipeConfiguration = {
    id: "",
    type: "wavewipe",
    duration: 1000,
    easing: "none",
    direction: "inside",
    version: "1.1.0",
    bgSizingMode: "stretch",
    backgroundType: "color",
    backgroundImage: "",
    backgroundColor: "#00000000"
  }

  public static category = "wipe";
  public static hidden: boolean = false;
  public static icon = "<i class='bt-icon wave-wipe fa-fw fas'></i>"
  public static key = "wavewipe";
  public static name: string = "WAVEWIPE";
  public static template = "wavewipe-config";
  public static reversible: boolean = true;

  // #endregion Properties (7)

  // #region Public Static Methods (7)

  public static async RenderTemplate(config?: WaveWipeConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${WaveWipeStep.template}.hbs`, {
      ...WaveWipeStep.DefaultSettings,
      id: foundry.utils.randomID(),
      ...(config ? config : {}),
      ...(config ? reconcileBackground(config) : {}),
      radialSelect: generateRadialDirectionSelectOptions(),
      bgTypeSelect: generateBackgroundTypeSelectOptions(),
      easingSelect: generateEasingSelectOptions()
    });
  }

  public static from(config: WaveWipeConfiguration): WaveWipeStep
  public static from(form: HTMLFormElement): WaveWipeStep
  public static from(form: JQuery<HTMLFormElement>): WaveWipeStep
  public static from(arg: unknown): WaveWipeStep {
    if (arg instanceof HTMLFormElement) return WaveWipeStep.fromFormElement(arg)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    else if (((arg as any)[0]) instanceof HTMLFormElement) return WaveWipeStep.fromFormElement((arg as any)[0] as HTMLFormElement);
    else return new WaveWipeStep(arg as WaveWipeConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): WaveWipeStep {
    const elem = $(form) as JQuery<HTMLFormElement>;
    const backgroundImage = elem.find("#backgroundImage").val() as string ?? "";

    return new WaveWipeStep({
      ...WaveWipeStep.DefaultSettings,
      backgroundImage,
      ...parseConfigurationFormElements(elem, "id", "label", "duration", "backgroundType", "backgroundColor", "easing", "direction")
    })
  }

  public static getDuration(config: WaveWipeConfiguration): number { return { ...WaveWipeStep.DefaultSettings, ...config }.duration }

  // #endregion Public Static Methods (7)

  // #region Public Methods (1)

  #filter: WaveWipeFilter | null = null;
  public async reverse(): Promise<void> {
    if (this.#filter instanceof WaveWipeFilter) await this.simpleReverse(this.#filter);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    const config: WaveWipeConfiguration = {
      ...WaveWipeStep.DefaultSettings,
      ...this.config
    }
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new WaveWipeFilter(config.direction, background.baseTexture);
    this.#filter = filter;
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }

  // #endregion Public Methods (1)
}