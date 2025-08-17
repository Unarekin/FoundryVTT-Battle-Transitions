import { AngularWipeConfiguration } from './types';
import { TransitionStep } from './TransitionStep';
import { createColorTexture, parseConfigurationFormElements } from '../utils';
import { AngularWipeFilter } from '../filters';
import { generateBackgroundTypeSelectOptions, generateEasingSelectOptions } from './selectOptions';
import { AngularWipeConfigApplication } from '../applications';

export class AngularWipeStep extends TransitionStep<AngularWipeConfiguration> {
  // #region Properties (9)

  #filter: AngularWipeFilter | null = null;

  public static DefaultSettings: AngularWipeConfiguration = {
    id: "",
    type: "angularwipe",
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
  public static icon = "<i class='bt-icon angular-wipe fa-fw fas'></i>"
  public static key = "angularwipe";
  public static name = "ANGULARWIPE";
  public static reversible = true;
  public static preview = `modules/${__MODULE_ID__}/assets/previews/AngularWipe.webm`;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public static ConfigurationApplication = AngularWipeConfigApplication as any;

  // #endregion Properties (9)

  // #region Public Static Methods (7)

  public static getRenderContext(config?: AngularWipeConfiguration): Record<string, unknown> {
    return {
      ...super.getRenderContext(config),
      easingSelect: generateEasingSelectOptions(),
      bgTypeSelect: generateBackgroundTypeSelectOptions()
    }
  }

  static getListDescription(config?: AngularWipeConfiguration): string {
    if (config) return game.i18n?.format("BATTLETRANSITIONS.ANGULARWIPE.LABEL", { duration: config.duration, background: config.backgroundType === "image" ? config.backgroundImage : config.backgroundType === "color" ? config.backgroundColor : "overlay" }) ?? "";
    else return "";
  }

  public static from(config: AngularWipeConfiguration): AngularWipeStep
  public static from(form: HTMLFormElement): AngularWipeStep
  public static from(form: JQuery<HTMLFormElement>): AngularWipeStep
  public static from(arg: unknown): AngularWipeStep {
    if (arg instanceof HTMLFormElement) return AngularWipeStep.fromFormElement(arg);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    else if (((arg as any)[0]) instanceof HTMLFormElement) return AngularWipeStep.fromFormElement((arg as any)[0] as HTMLFormElement);
    return new AngularWipeStep(arg as AngularWipeConfiguration);
  }

  public static fromFormElement(formElement: HTMLFormElement): AngularWipeStep {
    const backgroundImage = $(formElement).find("#backgroundImage").val() as string ?? "";
    const elem = parseConfigurationFormElements($(formElement) as JQuery<HTMLFormElement>, "id", "duration", "easing", "backgroundType", "backgroundColor", "label");
    return new AngularWipeStep({
      ...AngularWipeStep.DefaultSettings,
      ...elem,
      backgroundImage
    });
  }

  public static getDuration(config: AngularWipeConfiguration): number { return { ...AngularWipeStep.DefaultSettings, ...config }.duration }

  // #endregion Public Static Methods (7)

  // #region Public Methods (2)

  public async execute(container: PIXI.Container): Promise<void> {
    const config = {
      ...AngularWipeStep.DefaultSettings,
      ...this.config
    }
    const background = config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new AngularWipeFilter(background.baseTexture);
    this.#filter = filter;
    this.addFilter(container, filter);

    await this.simpleTween(filter);
  }

  public async reverse(): Promise<void> {
    if (this.#filter instanceof AngularWipeFilter) await this.simpleReverse(this.#filter);
  }

  // #endregion Public Methods (2)
}
