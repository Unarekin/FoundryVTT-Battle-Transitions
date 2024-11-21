import { TextureSwapFilter } from "../filters";
import { TransitionSequence } from '../interfaces';
import { createColorTexture, parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { TextureSwapConfiguration } from "./types";

export class TextureSwapStep extends TransitionStep<TextureSwapConfiguration> {
  // #region Properties (6)

  public readonly defaultSettings: Partial<TextureSwapConfiguration> = {};

  public static DefaultSettings: TextureSwapConfiguration = {
    id: "",
    type: "textureswap",
    version: "1.1.0",
    bgSizingMode: "stretch",
    backgroundType: "color",
    backgroundImage: "",
    backgroundColor: "#00000000"
  };
  public static hidden: boolean = false;
  public static key: string = "textureswap";
  public static name = "TEXTURESWAP";
  public static template = "textureswap-config";
  public static icon = "<i class='bt-icon texture-swap fa-fw fas'></i>"
  public static category = "effect";

  // #endregion Properties (6)

  // #region Public Static Methods (6)

  public static async RenderTemplate(config?: TextureSwapConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${TextureSwapStep.template}.hbs`, {
      ...TextureSwapStep.DefaultSettings,
      id: foundry.utils.randomID(),
      ...(config ? config : {})
    })
  }

  public static from(config: TextureSwapConfiguration): TextureSwapStep
  public static from(form: HTMLFormElement): TextureSwapStep
  public static from(form: JQuery<HTMLFormElement>): TextureSwapStep
  public static from(arg: unknown): TextureSwapStep {
    if (arg instanceof HTMLFormElement) return TextureSwapStep.fromFormElement(arg);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    else if (((arg as any)[0]) instanceof HTMLFormElement) return TextureSwapStep.fromFormElement((arg as any)[0] as HTMLFormElement);
    else return new TextureSwapStep(arg as TextureSwapConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): TextureSwapStep {
    const elem = $(form) as JQuery<HTMLFormElement>;
    const serializedTexture = elem.find("#backgroundImage").val() as string ?? "";

    return new TextureSwapStep({
      ...TextureSwapStep.DefaultSettings,
      serializedTexture,
      ...parseConfigurationFormElements(elem, "id", "backgroundType", "backgroundColor", "label")
    });
  }

  // #endregion Public Static Methods (6)

  // #region Public Methods (1)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public execute(container: PIXI.Container, sequence: TransitionSequence): void {
    const config: TextureSwapConfiguration = {
      ...TextureSwapStep.DefaultSettings,
      ...this.config
    };

    const background = config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new TextureSwapFilter(background.baseTexture);
    this.addFilter(container, filter);
  }

  // #endregion Public Methods (1)
}