import { RadialWipeFilter } from "../filters";
import { createColorTexture, getTargetType, parseConfigurationFormElements, renderTemplateFunc } from "../utils";
import { generateBackgroundTypeSelectOptions, generateEasingSelectOptions, generateRadialDirectionSelectOptions, generateTargetTypeSelectOptions } from "./selectOptions";
import { TransitionStep } from "./TransitionStep";
import { RadialWipeConfiguration, SceneChangeConfiguration, TransitionConfiguration } from "./types";
import { getTargetFromForm, normalizePosition, onTargetSelectDialogClosed, setTargetSelectEventListeners, validateTarget } from "./targetSelectFunctions";
import { InvalidSceneError, InvalidTargetError } from "../errors";
import { reconcileBackground } from "./functions";

export class RadialWipeStep extends TransitionStep<RadialWipeConfiguration> {
  // #region Properties (10)

  #filter: RadialWipeFilter | null = null;
  #screenLocation: [number, number] = [0.5, 0.5];

  public static DefaultSettings: RadialWipeConfiguration = {
    id: "",
    type: "radialwipe",
    easing: "none",
    radial: "inside",
    duration: 1000,
    bgSizingMode: "stretch",
    version: "1.1.6",
    backgroundType: "color",
    backgroundImage: "",
    backgroundColor: "#00000000",
    target: [0.5, 0.5],
    falloff: 0
  }

  public static category = "wipe";
  public static hidden: boolean = false;
  public static icon = "<i class='bt-icon bt-radial-wipe fa-fw fas'></i>"
  public static key = "radialwipe";
  public static name = "RADIALWIPE";
  public static reversible: boolean = true;
  public static template = "radialwipe-config";

  // #endregion Properties (10)

  // #region Public Static Methods (10)

  public static RenderTemplate(config?: RadialWipeConfiguration, oldScene?: Scene, newScene?: Scene): Promise<string> {
    const targetType = getTargetType({
      ...RadialWipeStep.DefaultSettings,
      ...(config ? config : {})
    }, oldScene, newScene);

    return (renderTemplateFunc())(`modules/${__MODULE_ID__}/templates/config/${RadialWipeStep.template}.hbs`, {
      ...RadialWipeStep.DefaultSettings,
      id: foundry.utils.randomID(),
      ...(config ? config : {}),
      ...(config ? reconcileBackground(config) : {}),
      easingSelect: generateEasingSelectOptions(),
      radialSelect: generateRadialDirectionSelectOptions(),
      bgTypeSelect: generateBackgroundTypeSelectOptions(),
      targetType,
      oldScene: oldScene?.id ?? "",
      newScene: newScene?.id ?? "",
      selectedTarget: config ? config.target : "",
      ...generateTargetTypeSelectOptions(oldScene, newScene),
      pointX: Array.isArray(config?.target) ? config.target[0] : 0.5,
      pointY: Array.isArray(config?.target) ? config.target[1] : 0.5,
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
  public static async addEventListeners(html: HTMLElement, config?: RadialWipeConfiguration) {
    setTargetSelectEventListeners(html);
  }

  public static editDialogClosed(element: HTMLElement | JQuery<HTMLElement>): void {
    onTargetSelectDialogClosed($(element)[0]);
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

  public static fromFormElement(form: HTMLFormElement): RadialWipeStep {
    const elem = $(form) as JQuery<HTMLFormElement>;
    const backgroundImage = elem.find("#backgroundImage").val() as string ?? "";
    const target = getTargetFromForm(elem);
    return new RadialWipeStep({
      ...RadialWipeStep.DefaultSettings,
      backgroundImage,
      target,
      ...parseConfigurationFormElements(elem, "id", "duration", "radial", "backgroundType", "backgroundColor", "easing", "label")
    });
  }

  public static getDuration(config: RadialWipeConfiguration): number { return { ...RadialWipeStep.DefaultSettings, ...config }.duration }

  public static async validate(config: RadialWipeConfiguration, sequence: TransitionConfiguration[]): Promise<RadialWipeConfiguration | Error> {
    try {
      const newSceneId = sequence.reduce((prev, curr) => curr.type === "scenechange" ? (curr as SceneChangeConfiguration).scene : prev, null as string | null);
      if (!newSceneId) throw new InvalidSceneError(typeof newSceneId === "string" ? newSceneId : typeof newSceneId);
      const newScene = game.scenes?.get(newSceneId);
      if (!newScene) throw new InvalidSceneError(typeof newSceneId === "string" ? newSceneId : typeof newSceneId);

      const target = await validateTarget({
        ...RadialWipeStep.DefaultSettings,
        ...config
      },
        canvas?.scene as Scene,
        newScene
      );
      return {
        ...RadialWipeStep.DefaultSettings,
        ...config,
        target
      };
    } catch (err) {
      return err as Error;
    }
  }

  // #endregion Public Static Methods (10)

  // #region Public Methods (3)

  public async execute(container: PIXI.Container): Promise<void> {
    const config: RadialWipeConfiguration = {
      ...RadialWipeStep.DefaultSettings,
      ...this.config
    }
    // Check for our target in the current (new) scene
    if (!Array.isArray(config.target)) {
      const obj = await fromUuid(config.target);
      if (!obj) throw new InvalidTargetError(config.target);
      const parsed = foundry.utils.parseUuid(config.target);
      if (parsed?.primaryType !== "Scene") throw new InvalidTargetError(config.target);
      if (parsed.primaryId === canvas?.scene?.id) this.#screenLocation = normalizePosition(obj);
    }

    const background = config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new RadialWipeFilter(config.radial, this.#screenLocation[0], this.#screenLocation[1], background.baseTexture, config.falloff);
    this.addFilter(container, filter);
    this.#filter = filter;
    await this.simpleTween(filter);
  }

  public async prepare(): Promise<void> {
    const config: RadialWipeConfiguration = {
      ...RadialWipeStep.DefaultSettings,
      ...this.config
    };
    if (Array.isArray(config.target)) {
      this.#screenLocation = config.target;
    } else {
      // Check if the target is in our current (old) scene
      const obj = await fromUuid(config.target);
      if (!obj) throw new InvalidTargetError(config.target);
      const parsed = foundry.utils.parseUuid(config.target);
      if (parsed?.primaryType !== "Scene") throw new InvalidTargetError(config.target);
      if (parsed.primaryId === canvas?.scene?.id) this.#screenLocation = normalizePosition(obj);
    }
  }

  public async reverse(): Promise<void> {
    if (this.#filter instanceof RadialWipeFilter) await this.simpleReverse(this.#filter);
  }

  // #endregion Public Methods (3)
}