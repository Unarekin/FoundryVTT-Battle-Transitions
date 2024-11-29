import { RadialWipeFilter } from "../filters";
import { Easing } from "../types";
import { createColorTexture, getTargetType, parseConfigurationFormElements } from "../utils";
import { addTargetSelectEventListeners, getTargetFromForm, normalizeLocation, swapTargetType, validateTarget } from "./functions";
import { generateDrawingSelectOptions, generateEasingSelectOptions, generateNoteSelectOptions, generateRadialDirectionSelectOptions, generateTargetTypeSelectOptions, generateTileSelectOptions, generateTokenSelectOptions } from "./selectOptions";
import { TransitionStep } from "./TransitionStep";
import { RadialWipeConfiguration } from "./types";

export class RadialWipeStep extends TransitionStep<RadialWipeConfiguration> {
  // #region Properties (11)

  #filter: RadialWipeFilter | null = null;
  #screenLocation: [number, number] = [0.5, 0.5];

  public readonly defaultSettings: Partial<RadialWipeConfiguration> = {
    duration: 1000,
    easing: "none" as Easing
  }

  public static DefaultSettings: RadialWipeConfiguration = {
    id: "",
    type: "radialwipe",
    easing: "none",
    radial: "inside",
    duration: 1000,
    bgSizingMode: "stretch",
    version: "1.1.0",
    backgroundType: "color",
    backgroundImage: "",
    backgroundColor: "#00000000",
    target: [0.5, 0.5]
  }

  public static category = "wipe";
  public static hidden: boolean = false;
  public static icon = "<i class='bt-icon radial-wipe fa-fw fas'></i>"
  public static key = "radialwipe";
  public static name = "RADIALWIPE";
  public static reversible: boolean = true;
  public static template = "radialwipe-config";

  // #endregion Properties (11)

  // #region Public Static Methods (8)

  public static RenderTemplate(config?: RadialWipeConfiguration, oldScene?: Scene, newScene?: Scene): Promise<string> {
    const targetType = getTargetType({
      ...RadialWipeStep.DefaultSettings,
      ...(config ? config : {})
    });

    const hasTokens = !!oldScene?.tokens.contents.length;
    const hasTiles = !!oldScene?.tiles.contents.length;
    const hasNotes = !!oldScene?.notes.contents.length;
    const hasDrawings = !!oldScene?.drawings.contents.length;

    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${RadialWipeStep.template}.hbs`, {
      ...RadialWipeStep.DefaultSettings,
      id: foundry.utils.randomID(),
      ...(config ? config : {}),
      easingSelect: generateEasingSelectOptions(),
      radialSelect: generateRadialDirectionSelectOptions(),
      targetType,
      oldScene,
      newScene,
      targetTypeSelect: generateTargetTypeSelectOptions(oldScene),
      hasTokens,
      hasTiles,
      hasNotes,
      hasDrawings,
      tokenSelect: oldScene ? generateTokenSelectOptions(oldScene) : {},
      tileSelect: oldScene ? generateTileSelectOptions(oldScene) : {},
      noteSelect: oldScene ? generateNoteSelectOptions(oldScene) : {},
      drawingSelect: oldScene ? generateDrawingSelectOptions(oldScene) : {},
      pointX: Array.isArray(config?.target) ? config.target[0] : 0.5,
      pointY: Array.isArray(config?.target) ? config.target[1] : 0.5,
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
  public static async addEventListeners(html: JQuery<HTMLElement>, config?: RadialWipeConfiguration) {
    swapTargetType(html);
    addTargetSelectEventListeners(html);
  }

  public static from(config: RadialWipeConfiguration): RadialWipeStep
  public static from(form: HTMLFormElement): RadialWipeStep
  public static from(form: JQuery<HTMLFormElement>): RadialWipeStep
  public static from(arg: unknown): RadialWipeStep {
    if (arg instanceof HTMLFormElement) return RadialWipeStep.fromFormElement(arg);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    else if (((arg as any)[0]) instanceof HTMLFormElement) return RadialWipeStep.fromFormElement((arg as any)[0] as HTMLFormElement);
    else return new RadialWipeStep(arg as RadialWipeConfiguration);
  }

  public static async validate(config: RadialWipeConfiguration): Promise<RadialWipeConfiguration | Error> {
    try {
      const target = await validateTarget({
        ...RadialWipeStep.DefaultSettings,
        ...config
      });
      if (target instanceof Error) throw target;

      return {
        ...config,
        ...(target ? { target } : {})
      };
    } catch (err) {
      return err as Error;
    }
  }

  public static fromFormElement(form: HTMLFormElement): RadialWipeStep {
    const elem = $(form) as JQuery<HTMLFormElement>;
    const serializedTexture = elem.find("#backgroundImage").val() as string ?? "";
    const target = getTargetFromForm(elem);
    return new RadialWipeStep({
      ...RadialWipeStep.DefaultSettings,
      serializedTexture,
      target,
      ...parseConfigurationFormElements(elem, "id", "duration", "radial", "backgroundType", "backgroundColor", "easing", "label")
    });
  }

  public static getDuration(config: RadialWipeConfiguration): number { return { ...RadialWipeStep.DefaultSettings, ...config }.duration }

  // #endregion Public Static Methods (8)

  // #region Public Methods (3)

  public async execute(container: PIXI.Container): Promise<void> {
    const config: RadialWipeConfiguration = {
      ...RadialWipeStep.DefaultSettings,
      ...this.config
    }
    const background = config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new RadialWipeFilter(config.radial, this.#screenLocation[0], this.#screenLocation[1], background.baseTexture);
    this.addFilter(container, filter);
    this.#filter = filter;
    await this.simpleTween(filter);
  }

  public async prepare(): Promise<void> {
    const config: RadialWipeConfiguration = {
      ...RadialWipeStep.DefaultSettings,
      ...this.config
    };

    if (Array.isArray(config.target)) this.#screenLocation = config.target;
    else if (typeof config.target === "string") this.#screenLocation = normalizeLocation(await fromUuid(config.target));
    else this.#screenLocation = normalizeLocation(config.target);
  }

  public async reverse(): Promise<void> {
    if (this.#filter instanceof RadialWipeFilter) await this.simpleReverse(this.#filter);
  }

  // #endregion Public Methods (3)
}