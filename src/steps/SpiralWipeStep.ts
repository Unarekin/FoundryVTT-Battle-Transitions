import { SpiralWipeFilter } from '../filters';
import { createColorTexture, parseConfigurationFormElements, renderTemplateFunc } from '../utils';
import { TransitionStep } from './TransitionStep';
import { SpiralWipeConfiguration } from './types';
import { generateBackgroundTypeSelectOptions, generateClockDirectionSelectOptions, generateEasingSelectOptions, generateRadialDirectionSelectOptions } from './selectOptions';
import { reconcileBackground } from './functions';

export class SpiralWipeStep extends TransitionStep<SpiralWipeConfiguration> {
  // #region Properties (7)

  public static DefaultSettings: SpiralWipeConfiguration = {
    id: "",
    type: "spiralwipe",
    duration: 1000,
    direction: "left",
    clockDirection: "clockwise",
    radial: "outside",
    easing: "none",
    version: "1.1.6",
    bgSizingMode: "stretch",
    backgroundType: "color",
    backgroundImage: "",
    backgroundColor: "#00000000",
    falloff: 0
  };
  public static category = "wipe";
  public static hidden: boolean = false;
  public static icon = `<i class="fas fa-fw fa-arrows-spin"></i>`
  public static key = "spiralwipe";
  public static name = "SPIRALWIPE";
  public static template = "spiralwipe-config";
  public static reversible: boolean = true;

  // #endregion Properties (7)

  // #region Public Static Methods (7)

  public static async RenderTemplate(config?: SpiralWipeConfiguration): Promise<string> {
    return (renderTemplateFunc())(`modules/${__MODULE_ID__}/templates/config/${SpiralWipeStep.template}.hbs`, {
      ...SpiralWipeStep.DefaultSettings,
      id: foundry.utils.randomID(),
      ...(config ? config : {}),
      ...(config ? reconcileBackground(config) : {}),
      easingSelect: generateEasingSelectOptions(),
      radialSelect: generateRadialDirectionSelectOptions(),
      bgTypeSelect: generateBackgroundTypeSelectOptions(),
      directionSelect: {
        top: "BATTLETRANSITIONS.DIRECTIONS.TOP",
        left: "BATTLETRANSITIONS.DIRECTIONS.LEFT",
        right: "BATTLETRANSITIONS.DIRECTIONS.RIGHT",
        bottom: "BATTLETRANSITIONS.DIRECTIONS.BOTTOM"
      },
      clockDirectionSelect: generateClockDirectionSelectOptions(),
    })
  }

  public static from(config: SpiralWipeConfiguration): SpiralWipeStep
  public static from(form: HTMLFormElement): SpiralWipeStep
  public static from(form: JQuery<HTMLFormElement>): SpiralWipeStep
  public static from(arg: unknown): SpiralWipeStep {
    if (arg instanceof HTMLFormElement) return SpiralWipeStep.fromFormElement(arg);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    else if (((arg as any)[0]) instanceof HTMLFormElement) return SpiralWipeStep.fromFormElement((arg as any)[0] as HTMLFormElement);
    else return new SpiralWipeStep(arg as SpiralWipeConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): SpiralWipeStep {
    const elem = $(form) as JQuery<HTMLFormElement>;
    const backgroundImage = elem.find("#backgroundImage").val() as string ?? "";

    return new SpiralWipeStep({
      ...SpiralWipeStep.DefaultSettings,
      backgroundImage,
      ...parseConfigurationFormElements(elem, "id", "duration", "backgroundType", "backgroundColor", "radial", "direction", "clockDirection", "easing", "label", "falloff")
    })
  }

  public static getDuration(config: SpiralWipeConfiguration): number { return { ...SpiralWipeStep.DefaultSettings, ...config }.duration }

  // #endregion Public Static Methods (7)

  #filter: SpiralWipeFilter | null = null;
  public async reverse(): Promise<void> {
    if (this.#filter instanceof SpiralWipeFilter) await this.simpleReverse(this.#filter);
  }

  // #region Public Methods (1)

  public async execute(container: PIXI.Container): Promise<void> {
    const config: SpiralWipeConfiguration = {
      ...SpiralWipeStep.DefaultSettings,
      ...this.config
    };

    const background = config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new SpiralWipeFilter(config.clockDirection, config.radial, config.direction, background.baseTexture, config.falloff);
    this.#filter = filter;
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }

  // #endregion Public Methods (1)
}