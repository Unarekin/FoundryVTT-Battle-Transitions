import { TextureSwapFilter } from "../filters";
import { PreparedTransitionHash, TransitionSequence } from "../interfaces";
import { addFilterToScene, removeFilterFromScene } from "../transitionUtils";
import { createColorTexture, parseConfigurationFormElements, wait } from '../utils';
import { TransitionStep } from "./TransitionStep";
import { FlashConfiguration } from "./types";

export class FlashStep extends TransitionStep<FlashConfiguration> {
  // #region Properties (7)

  public static DefaultSettings: FlashConfiguration = {
    id: "",
    type: "flash",
    duration: 250,
    version: "1.1.0",
    bgSizingMode: "stretch",
    backgroundType: "color",
    backgroundImage: "",
    backgroundColor: "#00000000",
    applyToOverlay: true,
    applyToScene: false
  }

  public static category = "effect";
  public static hidden: boolean = false;
  public static icon = "<i class='bt-icon flash fa-fw fas'></i>"
  public static key = "flash";
  public static name = "FLASH";
  public static template = "flash-config";

  // #endregion Properties (7)

  // #region Public Static Methods (7)

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
    const elem = parseConfigurationFormElements($(form) as JQuery<HTMLFormElement>, "id", "duration", "backgroundType", "backgroundColor", "label");
    return new FlashStep({
      ...FlashStep.DefaultSettings,
      ...elem,
      serializedTexture: backgroundImage
    })
  }

  public static getDuration(config: FlashConfiguration): number { return { ...FlashStep.DefaultSettings, ...config }.duration }

  // #endregion Public Static Methods (7)

  // #region Public Methods (1)



  public async execute(container: PIXI.Container, sequence: TransitionSequence, prepared: PreparedTransitionHash): Promise<void> {
    const config: FlashConfiguration = {
      ...FlashStep.DefaultSettings,
      ...this.config
    };
    const background = this.config.deserializedTexture ?? createColorTexture("tranparent");

    const promises: Promise<void>[] = [];

    if (config.applyToOverlay) {
      const filter = new TextureSwapFilter(background.baseTexture);
      this.addFilter(container, filter);
      promises.push(wait(config.duration).then(() => { this.removeFilter(container, filter); filter.destroy() }));
    }

    if (config.applyToScene && canvas?.stage) {
      const filter = new TextureSwapFilter(background.baseTexture);
      addFilterToScene(filter, prepared.prepared);
      promises.push(wait(config.duration).then(() => {
        removeFilterFromScene(filter);
      }));
    }

    await Promise.all(promises);
  }

  // #endregion Public Methods (1)
}