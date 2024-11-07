import { TransitionSequence } from "../interfaces";
import { createColorTexture, generateClockDirectionSelectOptions, generateEasingSelectOptions, generateRadialDirectionSelectOptions, parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { SpiralRadialWipeConfiguration } from "./types";
import { SpiralRadialWipeFilter } from "../filters";

export class SpiralRadialWipeStep extends TransitionStep<SpiralRadialWipeConfiguration> {
  // #region Properties (5)

  public static DefaultSettings: SpiralRadialWipeConfiguration = {
    type: "spiralradialwipe",
    duration: 1000,
    direction: "clockwise",
    radial: "inside",
    easing: "none",
    bgSizingMode: "stretch",
    version: "1.1.0",
    backgroundType: "color",
    backgroundImage: "",
    backgroundColor: "#00000000"
  }

  public static hidden: boolean = false;
  public static key = "spiralradialwipe";
  public static name = "SPIRALRADIALWIPE";
  public static template = "spiralradialwipe-config";

  // #endregion Properties (5)

  // #region Public Static Methods (6)

  public static async RenderTemplate(config?: SpiralRadialWipeConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${SpiralRadialWipeStep.template}.hbs`, {
      id: foundry.utils.randomID(),
      ...SpiralRadialWipeStep.DefaultSettings,
      ...(config ? config : {}),
      easingSelect: generateEasingSelectOptions(),
      radialSelect: generateRadialDirectionSelectOptions(),
      directionSelect: generateClockDirectionSelectOptions()
    });
  }

  public static from(config: SpiralRadialWipeConfiguration): SpiralRadialWipeStep
  public static from(form: HTMLFormElement): SpiralRadialWipeStep
  public static from(form: JQuery<HTMLFormElement>): SpiralRadialWipeStep
  public static from(arg: unknown): SpiralRadialWipeStep {
    if (arg instanceof HTMLFormElement) return SpiralRadialWipeStep.fromFormElement(arg);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    else if (((arg as any)[0]) instanceof HTMLFormElement) return SpiralRadialWipeStep.fromFormElement((arg as any)[0] as HTMLFormElement);
    else return new SpiralRadialWipeStep(arg as SpiralRadialWipeConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): SpiralRadialWipeStep {
    const elem = $(form) as JQuery<HTMLFormElement>;

    const backgroundImage = elem.find("#backgroundImage").val() as string ?? "";
    return new SpiralRadialWipeStep({
      ...SpiralRadialWipeStep.DefaultSettings,
      backgroundImage,
      ...parseConfigurationFormElements(elem, "id", "duration", "easing", "backgroundType", "backgroundColor", "direction", "radial")
    })
  }

  // #endregion Public Static Methods (6)

  // #region Public Methods (1)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    const config: SpiralRadialWipeConfiguration = {
      ...SpiralRadialWipeStep.DefaultSettings,
      ...this.config
    };
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new SpiralRadialWipeFilter(config.direction, config.radial, background.baseTexture);
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }

  // #endregion Public Methods (1)
}