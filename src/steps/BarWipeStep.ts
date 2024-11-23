import { BarWipeFilter } from "../filters";
import { createColorTexture, generateEasingSelectOptions, parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { BarWipeConfiguration } from "./types";

export class BarWipeStep extends TransitionStep<BarWipeConfiguration> {
  // #region Properties (7)

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
  public static template: string = "barwipe-config";

  // #endregion Properties (7)

  // #region Public Static Methods (7)

  public static RenderTemplate(config?: BarWipeConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${BarWipeStep.template}.hbs`, {
      ...BarWipeStep.DefaultSettings,
      id: foundry.utils.randomID(),
      ...(config ? config : {}),
      easingSelect: generateEasingSelectOptions(),
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
      serializedTexture: backgroundImage
    })
  }

  public static getDuration(config: BarWipeConfiguration): number { return { ...BarWipeStep.DefaultSettings, ...config }.duration }

  // #endregion Public Static Methods (7)

  // #region Public Methods (1)

  public async execute(container: PIXI.Container): Promise<void> {
    const config: BarWipeConfiguration = {
      ...BarWipeStep.DefaultSettings,
      ...this.config
    }

    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new BarWipeFilter(config.direction, config.bars, background.baseTexture);
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }

  // #endregion Public Methods (1)
}