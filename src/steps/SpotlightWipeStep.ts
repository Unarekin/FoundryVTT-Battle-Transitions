import { SpotlightWipeFilter } from "../filters";
import { TransitionSequence } from '../interfaces';
import { createColorTexture, log, parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { SpotlightWipeConfiguration } from "./types";
import { generateBackgroundTypeSelectOptions, generateEasingSelectOptions, generateLinearDirectionSelectOptions, generateRadialDirectionSelectOptions } from './selectOptions';
import { reconcileBackground } from "./functions";


export class SpotlightWipeStep extends TransitionStep<SpotlightWipeConfiguration> {
  // #region Properties (8)

  public readonly defaultSettings: Partial<SpotlightWipeConfiguration> = {
    duration: 1000,
    easing: "none"
  }

  public static DefaultSettings: SpotlightWipeConfiguration = {
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
    backgroundColor: "#00000000"
  }

  public static category = "wipe";
  public static hidden: boolean = false;
  public static icon = "<i class='bt-icon spotlight-wipe fa-fw fas'></i>"
  public static key = "spotlightwipe";
  public static name = "SPOTLIGHTWIPE";
  public static template = "spotlightwipe-config";
  public static reversible: boolean = true;

  // #endregion Properties (8)

  // #region Public Static Methods (7)

  public static RenderTemplate(config?: SpotlightWipeConfiguration): Promise<string> {
    const renderConfig = {
      ...SpotlightWipeStep.DefaultSettings,
      id: foundry.utils.randomID(),
      ...(config ? config : {}),
      ...(config ? reconcileBackground(config) : {}),
      easingSelect: generateEasingSelectOptions(),
      directionSelect: generateLinearDirectionSelectOptions(),
      bgTypeSelect: generateBackgroundTypeSelectOptions(),
      radialSelect: generateRadialDirectionSelectOptions()
    };
    log("Render config:", renderConfig);
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${SpotlightWipeStep.template}.hbs`, renderConfig);
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
      ...parseConfigurationFormElements(elem, "id", "duration", "direction", "radial", "backgroundType", "backgroundColor", "easing", "label")
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
    const filter = new SpotlightWipeFilter(config.direction, config.radial, background.baseTexture);
    this.#filter = filter;
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }

  // #endregion Public Methods (1)
}
