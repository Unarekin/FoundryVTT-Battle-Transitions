import { MeltFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { createColorTexture, parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { MeltConfiguration } from "./types";
import { generateBackgroundTypeSelectOptions, generateEasingSelectOptions } from './selectOptions';
import { reconcileBackground } from "./functions";

export class MeltStep extends TransitionStep<MeltConfiguration> {
  // #region Properties (9)

  #filter: MeltFilter | null = null;

  public static DefaultSettings: MeltConfiguration = {
    id: "",
    type: "melt",
    duration: 1000,
    version: "1.1.6",
    easing: "none",
    bgSizingMode: "stretch",
    backgroundType: "color",
    backgroundImage: "",
    backgroundColor: "#00000000"
  }

  public static category = "warp";
  public static hidden: boolean = false;
  public static icon = "<i class='bt-icon melt fa-fw fas'></i>"
  public static key = "melt";
  public static name = "MELT";
  public static reversible: boolean = true;
  public static template = "melt-config";

  // #endregion Properties (9)

  // #region Public Static Methods (7)

  public static RenderTemplate(config?: MeltConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${MeltStep.template}.hbs`, {
      ...MeltStep.DefaultSettings,
      id: foundry.utils.randomID(),
      ...(config ? config : {}),
      ...(config ? reconcileBackground(config) : {}),
      easingSelect: generateEasingSelectOptions(),
      bgTypeSelect: generateBackgroundTypeSelectOptions()
    });
  }

  public static from(config: MeltConfiguration): MeltStep
  public static from(form: JQuery<HTMLFormElement>): MeltStep
  public static from(form: HTMLFormElement): MeltStep
  public static from(arg: unknown): MeltStep {
    if (arg instanceof HTMLFormElement) return MeltStep.fromFormElement(arg);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    else if (((arg as any)[0]) instanceof HTMLFormElement) return MeltStep.fromFormElement((arg as any)[0] as HTMLFormElement);
    else return new MeltStep(arg as MeltConfiguration);
  }

  public static fromFormElement(form: HTMLElement): MeltStep {
    const backgroundImage = $(form).find("#backgroudnimage").val() as string ?? "";
    const elem = parseConfigurationFormElements($(form) as JQuery<HTMLFormElement>, "id", "duration", "easing", "backgroundType", "backgroundColor", "label");
    return new MeltStep({
      ...MeltStep.DefaultSettings,
      ...elem,
      backgroundImage
    });
  }

  public static getDuration(config: MeltConfiguration): number { return { ...MeltStep.DefaultSettings, ...config }.duration }

  // #endregion Public Static Methods (7)

  // #region Public Methods (2)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new MeltFilter(background.baseTexture);
    this.#filter = filter;
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }

  public async reverse(): Promise<void> {
    if (this.#filter instanceof MeltFilter) await this.simpleReverse(this.#filter);
  }

  // #endregion Public Methods (2)
}