import { RadialWipeFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { Easing } from "../types";
import { createColorTexture, generateEasingSelectOptions, generateRadialDirectionSelectOptions, parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { RadialWipeConfiguration } from "./types";

export class RadialWipeStep extends TransitionStep<RadialWipeConfiguration> {
  // #region Properties (8)

  public readonly defaultSettings: Partial<RadialWipeConfiguration> = {
    duration: 1000,
    easing: "none" as Easing
  }

  public static DefaultSettings: RadialWipeConfiguration = {
    id: "",
    type: "radialwipe",
    easing: "none",
    radial: "inside",
    duration: 1000,
    bgSizingMode: "stretch",
    version: "1.1.0",
    backgroundType: "color",
    backgroundImage: "",
    backgroundColor: "#00000000"
  }

  public static category = "wipe";
  public static hidden: boolean = false;
  public static icon = "<i class='bt-icon radial-wipe fa-fw fas'></i>"
  public static key = "radialwipe";
  public static name = "RADIALWIPE";
  public static template = "radialwipe-config";
  public static reversible: boolean = true;

  // #endregion Properties (8)

  // #region Public Static Methods (7)

  public static RenderTemplate(config?: RadialWipeConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${RadialWipeStep.template}.hbs`, {
      ...RadialWipeStep.DefaultSettings,
      id: foundry.utils.randomID(),
      ...(config ? config : {}),
      easingSelect: generateEasingSelectOptions(),
      radialSelect: generateRadialDirectionSelectOptions()
    });
  }

  public static from(config: RadialWipeConfiguration): RadialWipeStep
  public static from(form: HTMLFormElement): RadialWipeStep
  public static from(form: JQuery<HTMLFormElement>): RadialWipeStep
  public static from(arg: unknown): RadialWipeStep {
    if (arg instanceof HTMLFormElement) return RadialWipeStep.fromFormElement(arg);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    else if (((arg as any)[0]) instanceof HTMLFormElement) return RadialWipeStep.fromFormElement((arg as any)[0] as HTMLFormElement);
    else return new RadialWipeStep(arg as RadialWipeConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): RadialWipeStep {
    const elem = $(form) as JQuery<HTMLFormElement>;
    const serializedTexture = elem.find("#backgroundImage").val() as string ?? "";
    return new RadialWipeStep({
      ...RadialWipeStep.DefaultSettings,
      serializedTexture,
      ...parseConfigurationFormElements(elem, "id", "duration", "radial", "backgroundType", "backgroundColor", "easing", "label")
    });
  }

  public static getDuration(config: RadialWipeConfiguration): number { return { ...RadialWipeStep.DefaultSettings, ...config }.duration }

  // #endregion Public Static Methods (7)

  // #region Public Methods (1)

  #filter: RadialWipeFilter | null = null;
  public async reverse(): Promise<void> {
    if (this.#filter instanceof RadialWipeFilter) await this.simpleReverse(this.#filter);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    const config: RadialWipeConfiguration = {
      ...RadialWipeStep.DefaultSettings,
      ...this.config
    }
    const background = config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new RadialWipeFilter(config.radial, background.baseTexture);
    this.addFilter(container, filter);
    this.#filter = filter;
    await this.simpleTween(filter);
  }

  // #endregion Public Methods (1)
}