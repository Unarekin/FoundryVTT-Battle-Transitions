import { BilinearWipeFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { createColorTexture, generateBilinearDirectionSelectOptions, generateEasingSelectOptions, generateRadialDirectionSelectOptions, parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { BilinearWipeConfiguration } from "./types";

export class BilinearWipeStep extends TransitionStep<BilinearWipeConfiguration> {
  // #region Properties (7)

  public static DefaultSettings: BilinearWipeConfiguration = {
    id: "",
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

  public static category = "wipe";
  public static hidden: boolean = false;
  public static icon = `<i class="fas fa-fw fa-arrows-left-right-to-line"></i>`
  public static key = "bilinearwipe";
  public static name = "BILINEARWIPE";
  public static template = "bilinearwipe-config";

  public static reversible: boolean = true;

  // #endregion Properties (7)

  // #region Public Static Methods (7)

  public static RenderTemplate(config?: BilinearWipeConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${BilinearWipeStep.template}.hbs`, {
      ...BilinearWipeStep.DefaultSettings,
      id: foundry.utils.randomID(),
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    else if (((arg as any)[0]) instanceof HTMLFormElement) return BilinearWipeStep.fromFormElement((arg as any)[0] as HTMLFormElement);
    else return new BilinearWipeStep(arg as BilinearWipeConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): BilinearWipeStep {
    const backgroundImage = $(form).find("#backgroundImage").val() as string ?? "";
    const elem = parseConfigurationFormElements<BilinearWipeConfiguration>($(form) as JQuery<HTMLFormElement>, "id", "duration", "radial", "easing", "backgroundType", "backgroundColor", "label")
    return new BilinearWipeStep({
      ...BilinearWipeStep.DefaultSettings,
      ...elem,
      serializedTexture: backgroundImage
    });
  }

  public static getDuration(config: BilinearWipeConfiguration): number { return { ...BilinearWipeStep.DefaultSettings, ...config }.duration }

  // #endregion Public Static Methods (7)

  // #region Public Methods (1)

  #filter: BilinearWipeFilter | null = null;
  public async reverse(): Promise<void> {
    if (this.#filter instanceof BilinearWipeFilter) {
      const config: BilinearWipeConfiguration = {
        ...BilinearWipeStep.DefaultSettings,
        ...this.config
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await TweenMax.to(this.#filter.uniforms, { progress: 0, duration: config.duration / 1000, ease: config.easing });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, _sequence: TransitionSequence): Promise<void> {
    const config: BilinearWipeConfiguration = {
      ...BilinearWipeStep.DefaultSettings,
      ...this.config
    }
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new BilinearWipeFilter(config.direction, config.radial, background.baseTexture);
    this.#filter = filter;
    this.addFilter(container, filter);
    await this.simpleTween(filter)
  }

  // #endregion Public Methods (1)
}