import { FadeTransitionFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { createColorTexture, generateEasingSelectOptions, parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { FadeConfiguration } from "./types";

export class FadeStep extends TransitionStep<FadeConfiguration> {
  // #region Properties (7)

  public static DefaultSettings: FadeConfiguration = {
    id: "",
    type: "fade",
    duration: 1000,
    version: "1.1.0",
    bgSizingMode: "stretch",
    backgroundType: "color",
    backgroundColor: "#00000000",
    easing: "none"
  }

  public static category = "effect";
  public static hidden: boolean = false;
  public static icon = "<i class='bt-icon fade fa-fw fas'></i>"
  public static key = "fade";
  public static name = "FADE";
  public static template = "fade-config";

  // #endregion Properties (7)

  // #region Public Static Methods (7)

  public static RenderTemplate(config?: FadeConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${FadeStep.template}.hbs`, {
      ...FadeStep.DefaultSettings,
      id: foundry.utils.randomID(),
      ...(config ? config : {}),
      easingSelect: generateEasingSelectOptions()
    });
  }

  public static from(config: FadeConfiguration): FadeStep
  public static from(form: HTMLFormElement): FadeStep
  public static from(form: JQuery<HTMLFormElement>): FadeStep
  public static from(arg: unknown): FadeStep {
    if (arg instanceof HTMLFormElement) return FadeStep.fromFormElement(arg);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    else if (((arg as any)[0]) instanceof HTMLFormElement) return FadeStep.fromFormElement((arg as any)[0] as HTMLFormElement);
    else return new FadeStep(arg as FadeConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): FadeStep {
    const backgroundImage = $(form).find("#backgroundImage").val() as string ?? "";
    const elem = parseConfigurationFormElements($(form) as JQuery<HTMLFormElement>, "id", "duration", "backgroundType", "backgroundColor", "easing", "label");
    return new FadeStep({
      ...FadeStep.DefaultSettings,
      ...elem,
      serializedTexture: backgroundImage
    })
  }

  public static getDuration(config: FadeConfiguration): number { return { ...FadeStep.DefaultSettings, ...config }.duration }

  // #endregion Public Static Methods (7)

  // #region Public Methods (1)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    const config: FadeConfiguration = {
      ...FadeStep.DefaultSettings,
      ...this.config
    }
    const background = config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new FadeTransitionFilter(background.baseTexture);
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }

  // #endregion Public Methods (1)
}