import { TextureSwapFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { createColorTexture, parseConfigurationFormElements, wait } from '../utils';
import { TransitionStep } from "./TransitionStep";
import { FlashConfiguration } from "./types";

export class FlashStep extends TransitionStep<FlashConfiguration> {
  // #region Properties (5)

  public static DefaultSettings: FlashConfiguration = {
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

  // #endregion Properties (5)

  // #region Public Static Methods (6)

  public static RenderTemplate(config?: FlashConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${FlashStep.template}.hbs`, {
      id: foundry.utils.randomID(),
      ...FlashStep.DefaultSettings,
      ...(config ? config : {})
    })
  }

  public static from(config: FlashConfiguration): FlashStep
  public static from(form: JQuery<HTMLFormElement>): FlashStep
  public static from(form: HTMLFormElement): FlashStep
  public static from(arg: unknown): FlashStep {
    if (arg instanceof HTMLFormElement) return FlashStep.fromFormElement(arg);
    else if (Array.isArray(arg) && arg[0] instanceof HTMLFormElement) return FlashStep.fromFormElement(arg[0]);
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
    const background = this.config.deserializedTexture ?? createColorTexture("tranparent");

    const filter = new TextureSwapFilter(background.baseTexture);
    this.addFilter(container, filter);
    await wait(this.config.duration);
    this.removeFilter(container, filter);
    filter.destroy();
  }

  // #endregion Public Methods (1)
}