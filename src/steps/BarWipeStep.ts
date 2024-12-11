import { BarWipeFilter } from "../filters";
import { PreparedTransitionHash, TransitionSequence } from "../interfaces";
import { createColorTexture, parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { BarWipeConfiguration } from "./types";
import { generateBackgroundTypeSelectOptions, generateEasingSelectOptions } from './selectOptions';
import { reconcileBackground } from "./functions";

export class BarWipeStep extends TransitionStep<BarWipeConfiguration> {
  // #region Properties (9)

  #filter: BarWipeFilter | null = null;

  public static DefaultSettings: BarWipeConfiguration = {
    id: "",
    type: "barwipe",
    duration: 1000,
    easing: "none",
    direction: "horizontal",
    version: "1.1.0",
    backgroundType: "color",
    backgroundColor: "#00000000",
    backgroundImage: "",
    bgSizingMode: "stretch",
    bars: 4
  }

  public static category: string = "wipe";
  public static hidden: boolean = false;
  public static icon: string = `<i class="fas fa-fw fa-bars"></i>`;
  public static key: string = "barwipe";
  public static name: string = "BARWIPE";
  public static reversible: boolean = true;
  public static template: string = "barwipe-config";

  // #endregion Properties (9)

  // #region Public Static Methods (7)

  public static RenderTemplate(config?: BarWipeConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${BarWipeStep.template}.hbs`, {
      ...BarWipeStep.DefaultSettings,
      id: foundry.utils.randomID(),
      ...(config ? config : {}),
      ...(config ? reconcileBackground(config) : {}),
      easingSelect: generateEasingSelectOptions(),
      bgTypeSelect: generateBackgroundTypeSelectOptions(),
      directionSelect: {
        horizontal: "BATTLETRANSITIONS.DIRECTIONS.HORIZONTAL",
        vertical: "BATTLETRANSITIONS.DIRECTIONS.VERTICAL"
      }
    })
  }

  public static from(config: BarWipeConfiguration): BarWipeStep
  public static from(form: HTMLFormElement): BarWipeStep
  public static from(form: JQuery<HTMLFormElement>): BarWipeStep
  public static from(arg: unknown): BarWipeStep {
    if (arg instanceof HTMLFormElement) return BarWipeStep.fromFormElement(arg);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    else if ((arg as any)[0] instanceof HTMLFormElement) return BarWipeStep.fromFormElement((arg as any)[0] as HTMLFormElement);
    else return new BarWipeStep(arg as BarWipeConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): BarWipeStep {
    const elem = $(form) as JQuery<HTMLFormElement>;
    const backgroundImage = elem.find("#backgroundImage").val() as string ?? "";
    return new BarWipeStep({
      ...BarWipeStep.DefaultSettings,
      ...parseConfigurationFormElements(elem, "id", "duration", "bars", "direction", "easing", "backgroundType", "backgroundColor", "label"),
      backgroundImage
    })
  }

  public static getDuration(config: BarWipeConfiguration): number { return { ...BarWipeStep.DefaultSettings, ...config }.duration }

  // #endregion Public Static Methods (7)

  // #region Public Methods (2)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence, preparedSequence: PreparedTransitionHash): Promise<void> {
    const config: BarWipeConfiguration = {
      ...BarWipeStep.DefaultSettings,
      ...this.config
    }

    const background = config.deserializedTexture ?? createColorTexture("transparent");

    const filter = new BarWipeFilter(config.direction, config.bars, background.baseTexture);
    this.#filter = filter;
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }

  public async reverse(): Promise<void> {
    if (this.#filter instanceof BarWipeFilter) await this.simpleReverse(this.#filter);
  }

  // #endregion Public Methods (2)
}