import { WaveWipeFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { createColorTexture, generateEasingSelectOptions, generateRadialDirectionSelectOptions, parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { WaveWipeConfiguration } from "./types";

export class WaveWipeStep extends TransitionStep<WaveWipeConfiguration> {
  // #region Properties (5)

  public static template = "wavewipe-config";

  public static DefaultSettings: WaveWipeConfiguration = {
    type: "wavewipe",
    duration: 1000,
    easing: "none",
    direction: "inside",
    version: "1.1.0",
    bgSizingMode: "stretch",
    backgroundType: "color",
    backgroundImage: "",
    backgroundColor: "#00000000"
  }

  public static hidden: boolean = false;
  public static key = "wavewipe";
  public static name: string = "WAVEWIPE";
  public static icon = "<i class='bt-icon wave-wipe fa-fw'></i>"

  // #endregion Properties (5)

  // #region Public Static Methods (5)


  public static async RenderTemplate(config?: WaveWipeConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${WaveWipeStep.template}.hbs`, {
      ...WaveWipeStep.DefaultSettings,
      ...(config ? config : {}),
      radialSelect: generateRadialDirectionSelectOptions(),
      easingSelect: generateEasingSelectOptions()
    });
  }

  public static from(config: WaveWipeConfiguration): WaveWipeStep
  public static from(form: HTMLFormElement): WaveWipeStep
  public static from(form: JQuery<HTMLFormElement>): WaveWipeStep
  public static from(arg: unknown): WaveWipeStep {
    if (arg instanceof HTMLFormElement) return WaveWipeStep.fromFormElement(arg)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    else if (((arg as any)[0]) instanceof HTMLFormElement) return WaveWipeStep.fromFormElement((arg as any)[0] as HTMLFormElement);
    else return new WaveWipeStep(arg as WaveWipeConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): WaveWipeStep {
    const elem = $(form) as JQuery<HTMLFormElement>;
    const serializedTexture = elem.find("#backgroundImage").val() as string ?? "";

    return new WaveWipeStep({
      ...WaveWipeStep.DefaultSettings,
      serializedTexture,
      ...parseConfigurationFormElements(elem, "id", "duration", "backgroundType", "backgroundColor", "easing", "direction")
    })

  }

  // #endregion Public Static Methods (5)

  // #region Public Methods (1)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    const config: WaveWipeConfiguration = {
      ...WaveWipeStep.DefaultSettings,
      ...this.config
    }
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new WaveWipeFilter(config.direction, background.baseTexture);
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }

  // #endregion Public Methods (1)
}