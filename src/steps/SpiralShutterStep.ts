import { TransitionSequence } from "../interfaces";
import { createColorTexture, generateClockDirectionSelectOptions, generateEasingSelectOptions, generateRadialDirectionSelectOptions, parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { SpiralShutterConfiguration } from "./types";
import { SpiralShutterFilter } from "../filters";

export class SpiralShutterStep extends TransitionStep<SpiralShutterConfiguration> {
  // #region Properties (5)

  public static DefaultSettings: SpiralShutterConfiguration = {
    id: "",
    type: "spiralshutter",
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
  public static key = "spiralshutter";
  public static name = "SPIRALSHUTTER";
  public static template = "spiralshutter-config";
  public static category = "wipe";
  public static icon = "<i class='bt-icon spiral-shutter fa-fw fas'></i>"

  // #endregion Properties (5)

  // #region Public Static Methods (6)

  public static async RenderTemplate(config?: SpiralShutterConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${SpiralShutterStep.template}.hbs`, {
      ...SpiralShutterStep.DefaultSettings,
      id: foundry.utils.randomID(),
      ...(config ? config : {}),
      easingSelect: generateEasingSelectOptions(),
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
      ...parseConfigurationFormElements(elem, "id", "duration", "easing", "backgroundType", "backgroundColor", "direction", "radial")
    })
  }

  // #endregion Public Static Methods (6)

  // #region Public Methods (1)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    const config: SpiralShutterConfiguration = {
      ...SpiralShutterStep.DefaultSettings,
      ...this.config
    };
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new SpiralShutterFilter(config.direction, config.radial, background.baseTexture);
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }

  // #endregion Public Methods (1)
}