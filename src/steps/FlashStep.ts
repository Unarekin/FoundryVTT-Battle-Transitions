import { TextureSwapFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { createColorTexture, parseConfigurationFormElements, wait } from '../utils';
import { TransitionStep } from "./TransitionStep";
import { FlashConfiguration } from "./types";

export class FlashStep extends TransitionStep<FlashConfiguration> {
  // #region Properties (5)

  public static DefaultSettings: FlashConfiguration = {
    id: "",
    type: "flash",
    duration: 250,
    version: "1.1.0",
    bgSizingMode: "stretch",
    backgroundType: "color",
    backgroundImage: "",
    backgroundColor: "#00000000"
  }

  public static hidden: boolean = false;
  public static key = "flash";
  public static name = "FLASH";
  public static template = "flash-config";
  public static icon = "<i class='bt-icon flash fa-fw fas'></i>"
  public static category = "effect";

  // #endregion Properties (5)

  // #region Public Static Methods (6)

  public static RenderTemplate(config?: FlashConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${FlashStep.template}.hbs`, {
      ...FlashStep.DefaultSettings,
      id: foundry.utils.randomID(),
      ...(config ? config : {})
    })
  }

  public static from(config: FlashConfiguration): FlashStep
  public static from(form: JQuery<HTMLFormElement>): FlashStep
  public static from(form: HTMLFormElement): FlashStep
  public static from(arg: unknown): FlashStep {
    if (arg instanceof HTMLFormElement) return FlashStep.fromFormElement(arg);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    else if (((arg as any)[0]) instanceof HTMLFormElement) return FlashStep.fromFormElement((arg as any)[0] as HTMLFormElement);
    return new FlashStep(arg as FlashConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): FlashStep {
    const backgroundImage = $(form).find("#backgroundImage").val() as string ?? "";
    const elem = parseConfigurationFormElements($(form) as JQuery<HTMLFormElement>, "id", "duration", "backgroundType", "backgroundColor");
    return new FlashStep({
      ...FlashStep.DefaultSettings,
      ...elem,
      serializedTexture: backgroundImage
    })
  }

  // #endregion Public Static Methods (6)

  // #region Public Methods (1)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    const config: FlashConfiguration = {
      ...FlashStep.DefaultSettings,
      ...this.config
    };
    const background = this.config.deserializedTexture ?? createColorTexture("tranparent");

    const filter = new TextureSwapFilter(background.baseTexture);
    this.addFilter(container, filter);
    await wait(config.duration);
    this.removeFilter(container, filter);
    filter.destroy();
  }

  // #endregion Public Methods (1)
}