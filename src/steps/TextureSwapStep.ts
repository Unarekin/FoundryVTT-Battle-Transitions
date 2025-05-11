import { TextureSwapFilter } from "../filters";
import { PreparedTransitionHash, TransitionSequence } from '../interfaces';
import { addFilterToScene, removeFilterFromScene } from "../transitionUtils";
import { createColorTexture, parseConfigurationFormElements, renderTemplateFunc } from "../utils";
import { reconcileBackground } from "./functions";
import { generateBackgroundTypeSelectOptions, generateDualStyleSelectOptions } from "./selectOptions";
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
    backgroundColor: "#00000000",
    applyToScene: false,
    applyToOverlay: true
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
    return (renderTemplateFunc())(`modules/${__MODULE_ID__}/templates/config/${TextureSwapStep.template}.hbs`, {
      ...TextureSwapStep.DefaultSettings,
      id: foundry.utils.randomID(),
      ...(config ? config : {}),
      ...(config ? reconcileBackground(config) : {}),
      dualStyleSelect: generateDualStyleSelectOptions(),
      bgTypeSelect: generateBackgroundTypeSelectOptions(),
      dualStyle: config ? config.applyToOverlay && config.applyToScene ? "both" : config.applyToOverlay ? "overlay" : config.applyToScene ? "scene" : "overlay" : "overlay"
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
    const backgroundImage = $(form).find("#backgroundImage").val() as string ?? "";

    const dualStyle = elem.find("#dualStyle").val() as string;

    return new TextureSwapStep({
      ...TextureSwapStep.DefaultSettings,
      ...parseConfigurationFormElements(elem, "id", "label", "backgroundType", "backgroundColor"),
      backgroundImage,
      applyToOverlay: dualStyle === "overlay" || dualStyle === "both",
      applyToScene: dualStyle === "scene" || dualStyle === "both"
    });
  }

  // #endregion Public Static Methods (6)

  // #region Public Methods (1)

  #sceneFilter: PIXI.Filter | null = null;

  public teardown(): Promise<void> | void {
    if (this.#sceneFilter) removeFilterFromScene(this.#sceneFilter);
    this.#sceneFilter = null;
  }

  public execute(container: PIXI.Container, sequence: TransitionSequence, prepared: PreparedTransitionHash): void {
    const config: TextureSwapConfiguration = {
      ...TextureSwapStep.DefaultSettings,
      ...this.config
    };

    if (config.applyToOverlay) {
      const background = config.deserializedTexture ?? createColorTexture("transparent");
      const filter = new TextureSwapFilter(background.baseTexture);
      this.addFilter(container, filter);
    }

    if (config.applyToScene && canvas?.stage) {
      const background = config.deserializedTexture ?? createColorTexture("transparent");
      const filter = new TextureSwapFilter(background.baseTexture);
      addFilterToScene(filter, prepared.prepared);
      this.#sceneFilter = filter;
    }
  }

  // #endregion Public Methods (1)
}