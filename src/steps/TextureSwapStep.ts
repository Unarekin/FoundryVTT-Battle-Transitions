import { TextureSwapFilter } from "../filters";
import { TransitionSequence } from '../interfaces';
import { createColorTexture, parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { TextureSwapConfiguration } from "./types";

export class TextureSwapStep extends TransitionStep<TextureSwapConfiguration> {
  // #region Properties (4)

  public readonly defaultSettings: Partial<TextureSwapConfiguration> = {};
  public readonly template = "textureswap-config";

  public static DefaultSettings: TextureSwapConfiguration = {
    type: "textureswap",
    version: "1.1.0",
    bgSizingMode: "stretch"
  };
  public static name = "TEXTURESWAP";

  // #endregion Properties (4)

  // #region Public Static Methods (5)

  public static from(config: TextureSwapConfiguration): TextureSwapStep
  public static from(form: HTMLFormElement): TextureSwapStep
  public static from(form: JQuery<HTMLFormElement>): TextureSwapStep
  public static from(arg: unknown): TextureSwapStep {
    if (arg instanceof HTMLFormElement) return TextureSwapStep.fromFormElement(arg);
    else if (Array.isArray(arg) && arg[0] instanceof HTMLFormElement) return TextureSwapStep.fromFormElement(arg[0]);
    else return new TextureSwapStep(arg as TextureSwapConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): TextureSwapStep {
    const elem = $(form) as JQuery<HTMLFormElement>;
    const serializedTexture = elem.find("#backgroundImage").val() as string ?? "";

    return new TextureSwapStep({
      ...TextureSwapStep.DefaultSettings,
      serializedTexture,
      ...parseConfigurationFormElements(elem, "id", "backgroundType", "backgroundColor")
    });
  }

  // #endregion Public Static Methods (5)

  // #region Public Methods (1)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public execute(container: PIXI.Container, sequence: TransitionSequence): void {
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new TextureSwapFilter(background.baseTexture);
    this.addFilter(container, filter);
  }

  // #endregion Public Methods (1)
}