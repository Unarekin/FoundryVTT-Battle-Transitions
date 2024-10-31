import { BilinearWipeFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { createColorTexture, generateBilinearDirectionSelectOptions, generateEasingSelectOptions, generateRadialDirectionSelectOptions, parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { BilinearWipeConfiguration } from "./types";

export class BilinearWipeStep extends TransitionStep<BilinearWipeConfiguration> {
  // #region Properties (5)

  public static DefaultSettings: BilinearWipeConfiguration = {
    type: "bilinearwipe",
    duration: 1000,
    easing: "none",
    radial: "inside",
    direction: "vertical",
    version: "1.1.0",
    bgSizingMode: "stretch",
    backgroundType: "color",
    backgroundImage: "",
    backgroundColor: "#00000000"
  }

  public static hidden: boolean = false;
  public static key = "bilinearwipe";
  public static name = "BILINEARWIPE";
  public static template = "bilinearwipe-config";

  // #endregion Properties (5)

  // #region Public Static Methods (6)

  public static RenderTemplate(config?: BilinearWipeConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${BilinearWipeStep.template}.hbs`, {
      id: foundry.utils.randomID(),
      ...BilinearWipeStep.DefaultSettings,
      ...(config ? config : {}),
      easingSelect: generateEasingSelectOptions(),
      directionSelect: generateBilinearDirectionSelectOptions(),
      radialSelect: generateRadialDirectionSelectOptions()
    });
  }

  public static from(config: BilinearWipeConfiguration): BilinearWipeStep
  public static from(form: JQuery<HTMLFormElement>): BilinearWipeStep
  public static from(form: HTMLFormElement): BilinearWipeStep
  public static from(arg: unknown): BilinearWipeStep {
    if (arg instanceof HTMLFormElement) return BilinearWipeStep.fromFormElement(arg);
    else if (Array.isArray(arg) && arg[0] instanceof HTMLFormElement) return BilinearWipeStep.fromFormElement(arg[0]);
    else return new BilinearWipeStep(arg as BilinearWipeConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): BilinearWipeStep {
    const backgroundImage = $(form).find("#backgroundImage").val() as string ?? "";
    const elem = parseConfigurationFormElements<BilinearWipeConfiguration>($(form) as JQuery<HTMLFormElement>, "id", "duration", "radial", "easing", "backgroundType", "backgroundColor")
    return new BilinearWipeStep({
      ...BilinearWipeStep.DefaultSettings,
      ...elem,
      serializedTexture: backgroundImage
    });
  }

  // #endregion Public Static Methods (6)

  // #region Public Methods (1)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, _sequence: TransitionSequence): Promise<void> {
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new BilinearWipeFilter(this.config.direction, this.config.radial, background.baseTexture);
    this.addFilter(container, filter);
    await this.simpleTween(filter)
  }

  // #endregion Public Methods (1)
}