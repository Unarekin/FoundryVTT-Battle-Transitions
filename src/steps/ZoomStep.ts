import { ZoomFilter } from "../filters";
import { PreparedTransitionHash, TransitionSequence } from "../interfaces";
import { addFilterToScene, removeFilterFromScene } from "../transitionUtils";
import { createColorTexture, getTargetType, parseConfigurationFormElements } from "../utils";
import { generateDualStyleSelectOptions, generateEasingSelectOptions, generateTargetTypeSelectOptions } from "./selectOptions";
import { TransitionStep } from "./TransitionStep";
import { SceneChangeConfiguration, TransitionConfiguration, ZoomConfiguration } from "./types";
import { getTargetFromForm, normalizePosition, onTargetSelectDialogClosed, setTargetSelectEventListeners, validateTarget } from "./targetSelectFunctions";
import { InvalidSceneError, InvalidTargetError } from "../errors";

// #region Classes (1)

export class ZoomStep extends TransitionStep<ZoomConfiguration> {
  // #region Properties (11)

  #filters: PIXI.Filter[] = [];
  #sceneFilter: PIXI.Filter | null = null;
  #screenLocation: [number, number] = [0.5, 0.5];

  public static DefaultSettings: ZoomConfiguration = {
    id: "",
    type: "zoom",
    duration: 1000,
    backgroundType: "color",
    bgSizingMode: "stretch",
    backgroundColor: "#00000000",
    version: "1.1.0",
    easing: "none",
    amount: 0,
    clampBounds: false,
    target: [0.5, 0.5],
    applyToOverlay: true,
    applyToScene: false
  }

  public static category: string = "warp";
  public static hidden: boolean = false;
  public static icon: string = `<i class="fas fa-fw fa-magnifying-glass"></i>`
  public static key: string = "zoom";
  public static name: string = "ZOOM";
  public static reversible: boolean = true
  public static template: string = "zoom-config";

  // #endregion Properties (11)

  // #region Public Static Methods (10)

  // // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static async RenderTemplate(config?: ZoomConfiguration, oldScene?: Scene, newScene?: Scene): Promise<string> {
    const targetType = getTargetType({
      ...ZoomStep.DefaultSettings,
      ...(config ? config : {})
    }, oldScene, newScene);

    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${ZoomStep.template}.hbs`, {
      ...ZoomStep.DefaultSettings,
      id: foundry.utils.randomID(),
      ...(config ? config : {}),
      oldScene: oldScene?.id ?? "",
      newScene: newScene?.id ?? "",
      easingSelect: generateEasingSelectOptions(),
      targetType,
      ...generateTargetTypeSelectOptions(oldScene, newScene),
      pointX: Array.isArray(config?.target) ? config.target[0] : 0.5,
      pointY: Array.isArray(config?.target) ? config.target[1] : 0.5,
      dualStyleSelect: generateDualStyleSelectOptions(),
      dualStyle: config ? config.applyToOverlay && config.applyToScene ? "both" : config.applyToOverlay ? "overlay" : config.applyToScene ? "scene" : "overlay" : "overlay"
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
  public static async addEventListeners(html: JQuery<HTMLElement>, config?: ZoomConfiguration) {
    setTargetSelectEventListeners(html);
    setBackgroundSelector(html);

    html.find("#clampBounds").on("change", () => { setBackgroundSelector(html); })
  }

  //public static editDialogClosed(element: HTMLElement | JQuery<HTMLElement>, config?: TransitionConfiguration): void { }
  public static editDialogClosed(element: HTMLElement | JQuery<HTMLElement>): void {
    onTargetSelectDialogClosed($(element));
  }

  public static from(config: ZoomConfiguration): ZoomStep
  public static from(form: HTMLFormElement): ZoomStep
  public static from(form: JQuery<HTMLFormElement>): ZoomStep
  public static from(arg: unknown): ZoomStep {
    if (arg instanceof HTMLFormElement) return ZoomStep.fromFormElement(arg);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    else if ((arg as any)[0] instanceof HTMLFormElement) return ZoomStep.fromFormElement((arg as any)[0] as HTMLFormElement);
    else return new ZoomStep(arg as ZoomConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): ZoomStep {
    const elem = $(form) as JQuery<HTMLFormElement>;
    const serializedTexture = elem.find("#backgroundImage").val() as string ?? "";

    const dualStyle = elem.find("#dualStyle").val() as string;

    const target = getTargetFromForm(elem);

    const config: ZoomConfiguration = {
      ...ZoomStep.DefaultSettings,
      ...parseConfigurationFormElements(elem, "id", "label", "duration", "easing", "amount", "backgroundType", "backgroundColor", "clampBounds"),
      serializedTexture,
      target,
      applyToOverlay: dualStyle === "overlay" || dualStyle === "both",
      applyToScene: dualStyle === "scene" || dualStyle === "both"
    }

    return new ZoomStep(config);
  }

  public static getDuration(config: ZoomConfiguration): number { return { ...ZoomStep.DefaultSettings, ...config }.duration }

  public static async validate(config: ZoomConfiguration, sequence: TransitionConfiguration[]): Promise<ZoomConfiguration | Error> {
    try {
      const newSceneId = sequence.reduce((prev, curr) => curr.type === "scenechange" ? (curr as SceneChangeConfiguration).scene : prev, null as string | null);
      if (!newSceneId) throw new InvalidSceneError(typeof newSceneId === "string" ? newSceneId : typeof newSceneId);
      const newScene = game.scenes?.get(newSceneId);
      if (!newScene) throw new InvalidSceneError(typeof newSceneId === "string" ? newSceneId : typeof newSceneId);

      const target = await validateTarget({
        ...ZoomStep.DefaultSettings,
        ...config
      },
        canvas?.scene as Scene,
        newScene
      );
      return {
        ...ZoomStep.DefaultSettings,
        ...config,
        target
      }

    } catch (err) {
      return err as Error;
    }
  }

  // #endregion Public Static Methods (10)

  // #region Public Methods (4)

  public async execute(container: PIXI.Container, sequence: TransitionSequence, prepared: PreparedTransitionHash): Promise<void> {
    const config: ZoomConfiguration = {
      ...ZoomStep.DefaultSettings,
      ...this.config
    };

    // Check for our target in the current (new) scene
    if (!Array.isArray(config.target)) {
      const obj = await fromUuid(config.target);
      if (!obj) throw new InvalidTargetError(config.target);
      const parsed = foundry.utils.parseUuid(config.target);
      if (parsed?.primaryType !== "Scene") throw new InvalidTargetError(config.target);
      if (parsed.primaryId === canvas?.scene?.id) this.#screenLocation = normalizePosition(obj);
    }

    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filters: PIXI.Filter[] = [];

    if (config.applyToOverlay) {
      const filter = new ZoomFilter(this.#screenLocation, config.duration ? 1 : config.amount, config.clampBounds, background.baseTexture);
      this.addFilter(container, filter);
      filters.push(filter);
    }

    if (config.applyToScene && canvas?.stage) {
      const filter = new ZoomFilter(this.#screenLocation, config.duration ? 1 : config.amount, config.clampBounds, background.baseTexture);
      addFilterToScene(filter, prepared.prepared);
      filters.push(filter);
      this.#sceneFilter = filter;
    }

    if (config.duration) {
      this.#filters = [...filters];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
      await Promise.all(filters.map(filter => TweenMax.to(filter.uniforms, { amount: config.amount, duration: config.duration / 1000, ease: config.easing })))
    }
  }

  public async prepare(): Promise<void> {
    const config: ZoomConfiguration = {
      ...ZoomStep.DefaultSettings,
      ...this.config
    };

    if (Array.isArray(config.target)) {
      this.#screenLocation = config.target;
    } else {
      // Check if the target is in our current (old) scene.
      const obj = await fromUuid(config.target);
      if (!obj) throw new InvalidTargetError(config.target);
      const parsed = foundry.utils.parseUuid(config.target);
      if (parsed?.primaryType !== "Scene") throw new InvalidTargetError(config.target);
      if (parsed.primaryId === canvas?.scene?.id) this.#screenLocation = normalizePosition(obj);
    }
  }

  public async reverse(): Promise<void> {
    const config: ZoomConfiguration = {
      ...ZoomStep.DefaultSettings,
      ...this.config
    };

    await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      this.#filters.map(filter => TweenMax.to(filter.uniforms, { amount: 1, duration: config.duration / 1000, ease: config.easing }))
    )
  }

  public teardown(): Promise<void> | void {
    if (this.#sceneFilter) removeFilterFromScene(this.#sceneFilter);
    this.#sceneFilter = null;
  }

  // #endregion Public Methods (4)
}

// #endregion Classes (1)

// #region Functions (1)

function setBackgroundSelector(html: JQuery<HTMLElement>) {
  const clamp = html.find("#clampBounds").is(":checked");
  if (!clamp) html.find(".background-selector").css("display", "block");
  else html.find(".background-selector").css("display", "none");
}

// #endregion Functions (1)
