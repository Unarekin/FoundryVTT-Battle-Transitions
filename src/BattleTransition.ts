import { coerceColorHex, coerceScene, coerceUser } from "./coercion";
import { PreparedSequences } from "./constants.js";
import { InvalidElementError, InvalidSceneError, InvalidSoundError, InvalidTransitionError, ModuleNotActiveError, ParallelExecuteError, RepeatExecuteError, StepNotReversibleError, TransitionToSelfError } from "./errors";
import { PreparedTransitionSequence, TransitionSequence } from "./interfaces";
import { AngularWipeConfiguration, BackgroundTransition, BilinearWipeConfiguration, ClockWipeConfiguration, DiamondWipeConfiguration, FadeConfiguration, FireDissolveConfiguration, FlashConfiguration, InvertConfiguration, LinearWipeConfiguration, MacroConfiguration, MeltConfiguration, RadialWipeConfiguration, SceneChangeConfiguration, SoundConfiguration, SpiralWipeConfiguration, SpiralShutterConfiguration, SpotlightWipeConfiguration, TextureSwapConfiguration, TransitionConfiguration, TwistConfiguration, VideoConfiguration, WaitConfiguration, WaveWipeConfiguration, ZoomBlurConfiguration, BossSplashConfiguration, ParallelConfiguration, BarWipeConfiguration, RepeatConfiguration, ZoomConfiguration, ZoomArg, LoadingTipLocation, LoadingTipConfiguration, ReverseConfiguration, ClearEffectsConfiguration, ClockWipeStep, LinearWipeStep, FadeStep, MacroStep, FireDissolveStep, DiamondWipeStep, RemoveOverlayStep, MeltStep, RestoreOverlayStep, SoundStep, SpiralShutterStep, SpiralWipeStep, SpotlightWipeStep, TextureSwapStep, TwistStep, VideoStep, WaveWipeStep, ZoomBlurStep, AngularWipeStep, BarWipeStep, BilinearWipeStep, ClearEffectsStep, FlashStep, HueShiftConfiguration, HueShiftStep, InvertStep, LoadingTipStep, PixelateConfiguration, PixelateStep, RepeatStep, ZoomStep, RadialWipeStep } from "./steps";
import SocketHandler from "./SocketHandler";
import { BilinearDirection, ClockDirection, DualStyle, Easing, RadialDirection, TextureLike, WipeDirection } from "./types";
import { backgroundType, deserializeTexture, expandedFormData, generateBackgroundConfig, generateDualStyleConfig, getStepClassByKey, renderTemplateFunc, serializeTexture, templateDir } from "./utils";
import { TransitionStep } from "./steps/TransitionStep";
import { TransitionBuilder } from "./applications";
import { filters } from "./filters";
import { logDeprecation } from "./deprecationHelper";

// #region Type aliases (1)

type TransitionSequenceCallback = (transition: BattleTransition) => BattleTransition;

// #endregion Type aliases (1)

function log300SignatureDeprecation(method: string) {
  logDeprecation(`BattleTransition.${method}`, `The multi-argument method signature for BattleTransition#${method} is deprecated.\nUse the object-based configuration signature instead.`, "3.0.0", "4.0.0", "https://github.com/Unarekin/FoundryVTT-Battle-Transitions/wiki/Deprecations#300");
}

// #region Classes (1)

// let suppressSoundUpdates: boolean = false;

/**
 * Primary class that handles queueing, synchronizing, and executing transition sequences.
 */
export class BattleTransition {
  // #region Properties (3)

  #sequence: TransitionConfiguration[] = [];

  public static Filters = filters;
  // // eslint-disable-next-line no-unused-private-class-members
  // #transitionOverlay: PIXI.DisplayObject[] = [];
  public static SuppressSoundUpdates: boolean = false;

  // #endregion Properties (3)

  // #region Constructors (6)

  // static get SuppressSoundUpdates(): boolean { return suppressSoundUpdates; }
  // static set SuppressSoundUpdates(val: boolean) {
  //   log("Setting SuppressSoundUpdates:", val);
  //   suppressSoundUpdates = val;
  // }
  constructor()
  constructor(scene: Scene)
  constructor(id: string)
  constructor(name: string)
  constructor(uuid: string)
  constructor(arg?: unknown) {
    try {
      if (arg) {
        const scene = coerceScene(arg);
        if (!(scene instanceof Scene)) throw new InvalidSceneError(typeof arg === "string" ? arg : typeof arg);
        // if (scene.id !== canvas?.scene?.id) {
        // if (scene.id === canvas?.scene?.id) throw new TransitionToSelfError();
        const changeStep = getStepClassByKey("scenechange");
        if (!changeStep) throw new InvalidTransitionError("scenechange");

        this.#sequence.push({
          ...changeStep?.DefaultSettings,
          id: foundry.utils.randomID(),
          scene: scene.id
        } as SceneChangeConfiguration);
        // this.#sequence.push({ type: "scenechange", scene: scene.id } as SceneChangeConfiguration);
        // }
      }
    } catch (err) {
      ui.notifications?.error((err as Error).message);
      throw err;
    }
  }

  // #endregion Constructors (6)

  // #region Public Getters And Setters (1)

  public get sequence(): TransitionConfiguration[] { return this.#sequence; }

  // #endregion Public Getters And Setters (1)

  // #region Public Static Methods (7)

  public static async BuildTransition(scene?: Scene): Promise<void> {
    const config = await TransitionBuilder.build(scene?.uuid);

    if (config) {
      if (!config.scene || (config.scene && config.scene !== canvas?.scene?.id)) await new BattleTransition(config.scene).executeSequence(config.sequence, config.users);
      else await new BattleTransition().executeSequence(config.sequence, config.users);
    }
  }

  public static async SelectScene(omitCurrent: boolean = false): Promise<Scene | undefined> {
    const content = await (renderTemplateFunc())(templateDir(`scene-selector.hbs`), {
      scenes: (game.scenes?.contents ?? []).reduce((prev, curr) => {
        if (omitCurrent && curr.id === game.scenes?.current?.id) return prev;
        return [...prev, { id: curr.id, name: curr.name }]
      }, [] as { id: string, name: string }[])
    });

    return foundry.applications.api.DialogV2.wait({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      window: ({ title: "BATTLETRANSITIONS.DIALOGS.SCENESELECTOR.TITLE" } as any),
      content,
      rejectClose: false,
      buttons: [
        {
          icon: "fas fa-times",
          label: _loc("Cancel"),
          action: "cancel",
          callback: () => Promise.resolve(undefined)
        },
        {
          icon: "fas fa-check",
          label: _loc("BATTLETRANSITIONS.DIALOGS.BUTTONS.OK"),
          action: "ok",
          callback: (event: Event, button: HTMLButtonElement, dialog: foundry.applications.api.DialogV2.Any) => {
            const form = dialog.form;
            if (!(form instanceof HTMLFormElement)) throw new InvalidElementError();
            const formData = expandedFormData(form);
            return Promise.resolve(coerceScene(formData.scene));
          }
        }
      ]
    }).then(result => result instanceof Scene ? result : undefined)

  }

  public static HideLoadingBar = false;

  // TODO: Reimplement
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static async executePreparedSequence(id: string): Promise<void> {
    // const prepared = PreparedSequences[id];
    // if (!prepared) throw new InvalidTransitionError(typeof prepared);

    // const sceneChange = prepared.original.sequence.find(item => item.type === "scenechange" || item.type === "viewscene") as SceneChangeConfiguration | undefined;
    // const skipTransition = sceneChange && sceneChange.scene === canvas?.scene?.id;

    // Hooks.callAll(CUSTOM_HOOKS.TRANSITION_START, prepared.original);

    // let container: PIXI.Container | null = null;

    // try {
    //   container = setupTransition();
    //   prepared.overlay = [...container.children];

    //   hideLoadingBar();

    //   BattleTransition.SuppressSoundUpdates = true;

    //   if (!canvasGroup) {
    //     Hooks.once(CUSTOM_HOOKS.INITIALIZE, () => {
    //       if (container) canvasGroup?.addChild(container);
    //     });
    //   } else {
    //     canvasGroup.addChild(container);
    //   }

    //   if (!sceneChange) hideTransitionCover();


    //   // Execute
    //   for (const step of prepared.prepared.sequence) {
    //     const stepClass = getStepClassByKey(step.config.type ?? "");

    //     if (stepClass?.skipWhenSceneViewed && skipTransition) continue;
    //     // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    //     if ((step.config as any).backgroundType === "overlay" || (step.config as any).serializedTexture === "overlay") {
    //       // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    //       (step.config as any).deserializedTexture = (container.children[0] as PIXI.Sprite).texture
    //     }

    //     const exec = step.execute(container, prepared.original, prepared);
    //     if (exec instanceof Promise) await exec;
    //   }

    //   BattleTransition.SuppressSoundUpdates = false;

    //   // Teardown
    //   for (const step of prepared.prepared.sequence) {
    //     await step.teardown(container);
    //   }

    //   removeFiltersFromScene(prepared.prepared);
    // } catch (err) {
    //   ui.notifications?.error((err as Error).message, { console: false });
    //   console.error(err);
    // } finally {
    //   setTimeout(() => { showLoadingBar(); }, 250);
    //   if (container) cleanupTransition(container);
    //   if (prepared) Hooks.callAll(CUSTOM_HOOKS.TRANSITION_END, prepared.original)
    //   else Hooks.callAll(CUSTOM_HOOKS.TRANSITION_END);
    //   delete PreparedSequences[id];
    // }
  }

  /**
   * Executes a given transition sequence.
   * 
   * @remarks This form expects that the sequence has a SceneChangeStep at the start.
   * @param {TransitionConfiguration[]} sequence - {@link TransitionConfiguration}[]
   */
  public static async ExecuteSequence(sequence: TransitionConfiguration[]): Promise<void>
  /**
   * Executes a given sequence
   * @param {string} sceneId - ID of the {@link Scene} to which to transition
   * @param {TransitionConfiguration[]} sequence - {@link TransitionConfiguration}[]
   */
  public static async ExecuteSequence(sceneId: string, sequence: TransitionConfiguration[]): Promise<void>
  /**
   * Executes a given sequence
   * @param {string} sceneName - Name of the {@link Scene} to which to transition.
   * @param {TransitionConfiguration[]} sequence - {@link TransitionConfiguration}[]
   */
  public static async ExecuteSequence(sceneName: string, sequence: TransitionConfiguration[]): Promise<void>
  /**
   * Executes a given sequence
   * @param {string} sceneUUID - UUID of the {@link Scene} to which to transition.
   * @param {TransitionConfiguration[]} sequence - {@link TransitionConfiguration}[]
   */
  public static async ExecuteSequence(sceneUUID: string, sequence: TransitionConfiguration[]): Promise<void>
  /**
   * Executes a given sequence
   * @param {Scene} scene - {@link Scene} to which to transition.
   * @param {TransitionConfiguration[]} sequence - {@link TransitionConfiguration}[]
   */
  public static async ExecuteSequence(scene: Scene, sequence: TransitionConfiguration[]): Promise<void>
  public static async ExecuteSequence(...args: unknown[]): Promise<void> {
    const sequence = (Array.isArray(args[0]) ? args[0] : args[1]) as TransitionConfiguration[];

    if (typeof args[0] === "string" || args[0] instanceof Scene) {
      const scene = (args[0] instanceof Scene) ? args[0] : coerceScene(args[0]);
      if (!(scene instanceof Scene)) throw new InvalidSceneError(typeof args[0] === "string" ? args[0] : typeof args[0]);
      if (scene.active) throw new TransitionToSelfError();
      const sceneStepClass = getStepClassByKey("scenechange");
      if (!sceneStepClass) throw new InvalidTransitionError("scenechange");

      const sceneStep: SceneChangeConfiguration = {
        ...sceneStepClass.DefaultSettings,
        id: foundry.utils.randomID(),
        scene: scene.id ?? ""
      };

      sequence.unshift(sceneStep);
    }

    // // Validate the target scene
    // const scene = (game.scenes?.get((sequence[0] as SceneChangeConfiguration).scene)) as Scene;
    // if (!(scene instanceof Scene)) throw new InvalidSceneError(typeof (sequence[0] as SceneChangeConfiguration).scene === "string" ? (sequence[0] as SceneChangeConfiguration).scene : typeof (sequence[0] as SceneChangeConfiguration).scene);

    // // Make sure we have permission to activate the new scene
    // if (!scene.canUserModify(game.user as User, "update")) throw new PermissionDeniedError();

    // Socket time baybee
    await SocketHandler.execute(sequence);

  }

  /**
   * Adds a preconfigured sequence to the current sequence chain.
   * @param {TransitionConfiguration[]} sequence {@link TransitionConfiguration}[]
   * @returns 
   */
  public addSequence(sequence: TransitionConfiguration[]): this {
    this.#sequence.push(...sequence);
    return this;
  }

  public executeSequence(sequence: TransitionConfiguration[], users?: string[]): Promise<void> {
    this.addSequence(sequence);
    if (Array.isArray(users) && users.length) return this.execute(...users);
    else return this.execute();
  }

  /**
   * Prepares a given set of transitions steps for execution, allowing them to preload media etc
   * @param {TransitionSequence[]} sequence - {@link TransitionConfiguration}[] steps to be prepared
   * @returns 
   */
  public static async prepareSequence(sequence: TransitionSequence): Promise<TransitionStep[]> {
    try {
      const steps: TransitionStep[] = [];
      for (const temp of sequence.sequence) {
        const step = { ...temp };
        const instance = getStepInstance(step);
        if (!instance) throw new InvalidTransitionError(typeof step.type === "string" ? step.type : typeof step.type);

        // Handle steps with backgrounds
        if (Object.prototype.hasOwnProperty.call(step, "backgroundType")) {
          const bgStep = step as unknown as BackgroundTransition;

          if (bgStep.serializedTexture) {
            bgStep.deserializedTexture = deserializeTexture(bgStep.serializedTexture);
          } else {
            switch (bgStep.backgroundType) {
              case "color":
                bgStep.deserializedTexture = deserializeTexture(bgStep.backgroundColor ?? "transparent");
                break;
              case "image":
                bgStep.deserializedTexture = deserializeTexture(bgStep.backgroundImage ?? "transparent");
                break;
            }
          }
        }

        const res = instance.prepare(sequence);
        if (res instanceof Promise) await res;

        steps.push(instance);
      }

      PreparedSequences[sequence.id] = {
        original: sequence,
        prepared: {
          ...sequence,
          sequence: steps,
          sceneFilters: []
        },
        overlay: []
      }

      return steps;
    } catch (err) {
      ui.notifications?.error((err as Error).message, { console: false });
      console.error(err);
      throw err;
    }
  }

  public static async teardownSequence(container: PIXI.Container, sequence: PreparedTransitionSequence) {
    for (const step of sequence.sequence) {
      await step.teardown(container);
    }
  }

  public static async validateSequence(sequence: TransitionConfiguration[]): Promise<TransitionConfiguration[] | Error> {
    try {
      const validated: TransitionConfiguration[] = [];
      for (const step of sequence) {
        const handler = getStepClassByKey(step.type);
        // const handler = BattleTransition.StepTypes[step.type];
        if (!handler) throw new InvalidTransitionError(step.type);

        const valid = await handler.validate(step, sequence);
        if (valid instanceof Error) return valid;
        validated.push(valid);
      }
      return validated;
    } catch (err) {
      return err as Error;
    }
  }

  // #endregion Public Static Methods (7)

  // #region Transition Methods

  /**
   * Adds an angular wipe, mimicking the battle with Brock in Pokemon Fire Red
   * @param {number} [duration=1000] - Duration that the wipe should last
   * @param {TextureLike} [background="transparent"] - {@link TextureLike} representing the background
   * @param {Easing} [easing="none"] - {@link Easing} to use when animating this transition
   * @returns {BattleTransition}
   * @deprecated This signature is deprecated since version 3.0.0.  Use the object-based signature instead.
   */
  // TODO: Remove signature in 4.0
  public angularWipe(duration: number, background: TextureLike, easing: Easing): this
  /**
   * Adds an angular wipe, mimicking the battle with Brock in Pokemon Fire Red
   * @param {AngularWipeConfiguration} config - {@link AngularWipeConfiguration}
   * @returns {BattleTransition}
   */
  public angularWipe(config: Partial<AngularWipeConfiguration>): this
  public angularWipe(...args: unknown[]): this {
    if (args.length !== 0 && typeof args[0] !== "object") {
      log300SignatureDeprecation("angularWipe");
      const config: AngularWipeConfiguration = foundry.utils.deepClone(AngularWipeStep.DefaultSettings);

      const [duration = 1000, background = "transparent", easing = "none"] = args as [number | string, TextureLike, Easing];

      if (typeof duration === "number")
        config.duration = duration;
      else if (typeof duration === "string" && !isNaN(parseFloat(duration)))
        config.duration = parseFloat(duration);

      const serializedTexture = serializeTexture(background ?? "transparent");
      const bgType = backgroundType(background ?? "transparent");

      config.serializedTexture = serializedTexture;
      config.backgroundType = bgType;

      config.backgroundColor = bgType === "color" ? coerceColorHex(background ?? "transparent") ?? "" : "";
      config.backgroundImage = bgType === "image" ? background as string : "";

      config.easing = easing;

      return this.angularWipe(config);
    }

    const config: AngularWipeConfiguration = {
      ...foundry.utils.deepClone(AngularWipeStep.DefaultSettings),
      ...(args[0] ?? {}) as AngularWipeConfiguration,
      id: foundry.utils.randomID()
    };

    this.sequence.push(config);

    return this;
  }

  /**
   * Generate a wipe of alternating bars either horizontally or vertically
   * @param {number} bars - Number of bars into which to split the screen
   * @param {"horizontal" | "vertical"} direction - Direction the bars should travel
   * @param {number} [duration=1000] - Duration, in milliseconds, the wipe should take to complete
   * @param {TextureLike} [background="transparent"] - {@link TextureLike}
   * @param {Easing} [easing="none"] - {@link Easing}
   * @returns {BattleTransition}
   * @deprecated This signature is deprecated since version 3.0.0.  Use the object-based signature instead.
   */
  public barWipe(bars: number, direction: "horizontal" | "vertical", duration: number, background: TextureLike, easing: Easing): this
  /**
   * Generate a wipe of alternating bars either horizontally or vertically
   * @param {BarWipeConfiguration} config - {@link BarWipeConfiguration}
   * @returns {BattleTransition}
   */
  public barWipe(config: Partial<BarWipeConfiguration>): this
  public barWipe(...args: unknown[]): this {

    if (args.length !== 0 && typeof args[0] !== "object") {
      log300SignatureDeprecation("barWipe");
      const [bars = 4, direction = "horizontal", duration = 1000, background = "transparent", easing = "none"] = args as [number, "horizontal" | "vertical", number, TextureLike, Easing];
      const bgType = backgroundType(background);
      return this.barWipe({
        duration,
        bars,
        direction,
        backgroundType: bgType,
        backgroundColor: bgType === "color" ? coerceColorHex(background) : "",
        backgroundImage: bgType === "image" ? background as string : "",
        easing
      });
    }

    const config = foundry.utils.mergeObject(
      foundry.utils.deepClone(BarWipeStep.DefaultSettings),
      (args[0] ?? {}) as Partial<BarWipeConfiguration>
    ) as BarWipeConfiguration;

    this.#sequence.push({
      ...config,
      id: foundry.utils.randomID()
    });
    return this;
  }

  /**
   * Adds a bilinear wipe
   * @param {BilinearDirection} direction - {@link BilinearDirection}
   * @param {RadialDirection} radial - {@link RadialDirection}
   * @param {number} [duration=1000] - Duration in milliseconds that the wipe should last
   * @param {TextureLike} [background="transparent"] - {@link TextureLike} representing the background
   * @param {Easing} [easing="none"] - {@link Easing}
   * @returns {BattleTransition}
   * @deprecated This signature is deprecated since version 3.0.0.  Use the object-based signature instead.
   */
  // TODO: Remove signature in 4.0
  public bilinearWipe(direction: BilinearDirection, radial: RadialDirection, duration: number, background: TextureLike, easing: Easing): this
  /**
   * Adds a bilinear wipe
   * @param {BilinearWipeConfiguration} config - {@link BilinearWipeConfiguration}
   * @returns {BattleTransition}
   */
  public bilinearWipe(config: Partial<BilinearWipeConfiguration>): this
  public bilinearWipe(...args: unknown[]): this {

    if (args.length !== 0 && typeof args[0] !== "object") {
      log300SignatureDeprecation("bilinearWipe");

      const [direction = "vertical", radial = "inside", duration = 1000, background = "transparent", easing = "none"] = args as [BilinearDirection, RadialDirection, number, TextureLike, Easing];

      return this.bilinearWipe({
        direction,
        radial,
        duration,
        easing,
        ...generateBackgroundConfig(background),
      })
    }

    const config = foundry.utils.mergeObject(
      foundry.utils.deepClone(BilinearWipeStep.DefaultSettings),
      (args[0] ?? {}) as Partial<BilinearWipeConfiguration>
    ) as BilinearWipeConfiguration

    this.#sequence.push({
      ...config,
      id: foundry.utils.randomID()
    });
    return this;
  }

  /**
   * Triggers an animation from the Boss Splash Screen module
   * @param {BossSplashConfiguration} config - {@link BossSplashConfiguration}
   * @returns {BattleTransition}
   */
  public bossSplash(config: BossSplashConfiguration): this {
    if (!game?.modules?.get("boss-splash")?.active) {
      const err = new ModuleNotActiveError("Boss Splash Screen");
      ui.notifications?.error(err.message, { console: false });
      throw err;
    }
    const step = getStepClassByKey("bosssplash");
    if (!step) throw new InvalidTransitionError("bosssplash");
    const newConfig: BossSplashConfiguration = {
      ...step.DefaultSettings,
      ...config,
      id: foundry.utils.randomID()
    };

    this.#sequence.push(newConfig);
    return this;
  }

  /**
   * Dissolves the screen with a fire sort of effect
   * @param {number} [duration=1000] - Duration, in milliseconds, the dissolve should take to complete
   * @param {number} [burnSize=1.3] - Relative size of the burn effect
   * @param {Easing} [easing="none"] - {@link Easing}
   * @returns {BattleTransition}
   * @deprecated This signature is deprecated since version 3.0.0.  Use the object-based signature instead.
   */
  // TODO: Remove signature in 4.0
  public burn(duration: number, burnSize: number, easing: Easing): this
  /**
   * Dissolves the screen with a fire sort of effect
   * @param {FireDissolveConfiguration} config - {@link FireDissolveConfiguration}
   * @returns {BattleTransition}
   */
  public burn(config: Partial<FireDissolveConfiguration>): this
  public burn(...args: unknown[]): this {
    if (args.length && typeof args[0] !== "object") {
      log300SignatureDeprecation("burn");
      const [duration = 1000, burnSize = 1.3, easing = "none"] = args as [number, number, Easing];
      return this.burn({ duration, burnSize, easing });
    }

    const config = foundry.utils.mergeObject(
      foundry.utils.deepClone(FireDissolveStep.DefaultSettings),
      (args[0] ?? {}) as Partial<FireDissolveConfiguration>
    ) as FireDissolveConfiguration;

    this.#sequence.push({
      ...config,
      id: foundry.utils.randomID()
    });
    return this;
  }

  /**
   * Removes any active transition effects from the overlay, the scene, or both
   * @param {DualStyle} [style=0] - {@link DualStyle}
   * @returns {BattleTransition}
   * @deprecated This signature is deprecated since version 3.0.0.  Use the object-based signature instead.
   */
  // TODO: Remove signature in 4.0
  public clearEffects(style: DualStyle): this
  /**
   * Removes any active transition effects from the overlay, the scene, or both
   * @param {ClearEffectsConfiguration} config - {@link ClearEffectsConfiguration}
   * @returns {BattleTransition}
   */
  public clearEffects(config: Partial<ClearEffectsConfiguration>): this
  public clearEffects(...args: unknown[]): this {
    if (args.length && typeof args[0] !== "object") {
      log300SignatureDeprecation("clearEffects");
      const [style = DualStyle.Both] = args as [DualStyle];
      return this.clearEffects({
        ...generateDualStyleConfig(style)
      });
    }

    const config = foundry.utils.mergeObject(
      foundry.utils.deepClone(ClearEffectsStep.DefaultSettings),
      (args[0] ?? {}) as Partial<ClearEffectsConfiguration>
    ) as ClearEffectsConfiguration

    this.#sequence.push({
      ...config,
      id: foundry.utils.randomID()
    });

    return this;
  }

  /**
   * Adds a clock wipe to the queue
   * @param {ClockDirection} clockDirection - {@link ClockDirection}
   * @param {WipeDirection} direction - {@link WipeDirection}
   * @param {number} [duration=1000] - Duration, in milliseconds, that the wipe should last
   * @param {TextureLike} [background="transparent"] - {@link TextureLike}
   * @param {Easing} [easing="none"] - {@link Easing}
   * @returns {BattleTransition}
   * @deprecated This signature is deprecated since version 3.0.0.  Use the object-based signature instead.
   */
  // TODO: Remove signature in 4.0
  public clockWipe(clockDirection: ClockDirection, direction: WipeDirection, duration: number, background: TextureLike, easing: Easing): this
  /**
   * Adds a clock wipe to the queue
   * @param {ClockWipeConfiguration} config - {@link ClockWipeConfiguration}
   * @returns {BattleTransition}
   */
  public clockWipe(config: Partial<ClockWipeConfiguration>): this
  public clockWipe(...args: unknown[]): this {
    if (args.length && typeof args[0] !== "object") {
      log300SignatureDeprecation("clockWipe");

      const [clockDirection = "clockwise", direction = "top", duration = 1000, background = "transparent", easing = "none"] = args as [ClockDirection, WipeDirection, number, TextureLike, Easing];

      return this.clockWipe({
        duration,
        clockDirection,
        direction,
        easing,
        ...generateBackgroundConfig(background)
      });
    }

    const config = foundry.utils.mergeObject(
      foundry.utils.deepClone(ClockWipeStep.DefaultSettings),
      (args[0] ?? {}) as Partial<ClockWipeConfiguration>
    ) as ClockWipeConfiguration;

    this.#sequence.push({
      ...config,
      id: foundry.utils.randomID()
    });
    return this;
  }

  /**
   * Adds a wipe that causes diamond-shapes to disappear over time from left to right
   * @param {number} [size=40] - Relative size of the diamonds
   * @param {number} [duration=1000] - Duration, in milliseconds, that the wipe should last
   * @param {TextureLike} [background="transparent"] - {@link TextureLike}
   * @param {Easing} [easing="none"] - {@link Easing}
   * @returns {BattleTransition}
   * @deprecated This signature is deprecated since version 3.0.0.  Use the object-based signature instead.
   */
  // TODO: Remove signature in 4.0
  public diamondWipe(size: number, duration: number, background: TextureLike, easing: Easing): this
  /**
   * Adds a wipe that causes diamond-shapes to disappear over time from left to right
   * @param {DiamondWipeConfiguration} config - {@link DiamondWipeConfiguration}
   * @returns {BattleTransition}
   */
  public diamondWipe(config: Partial<DiamondWipeConfiguration>): this
  public diamondWipe(...args: unknown[]): this {
    if (args.length && typeof args[0] !== "object") {
      log300SignatureDeprecation("diamondWipe");

      const [size = 40, duration = 1000, background = "transparent", easing = "none"] = args as [number, number, TextureLike, Easing];

      return this.diamondWipe({
        size,
        duration,
        easing,
        ...generateBackgroundConfig(background)
      })
    }

    const config = foundry.utils.mergeObject(
      foundry.utils.deepClone(DiamondWipeStep.DefaultSettings),
      (args[0] ?? {}) as Partial<DiamondWipeConfiguration>
    ) as DiamondWipeConfiguration;

    this.#sequence.push({
      ...config,
      id: foundry.utils.randomID()
    });
    return this;
  }


  /**
   * Executes the transition sequence built for this {@link BattleTransition} instance.
   * @returns {Promise} - A promise that resolves when the transition is done for all users
   */
  public async execute(...users: string[]): Promise<void> {
    if (!(Array.isArray(this.#sequence) && this.#sequence.length)) throw new InvalidTransitionError(typeof this.#sequence);

    if (Array.isArray(users) && users.length) {
      // Get a list of Users that are active
      const actualUsers = users.filter(id => coerceUser(id) instanceof User);

      // Change all scenechange steps to viewscene steps.  This could probably be cleaner.
      for (const step of this.#sequence) {
        if (step.type === "scenechange") {
          step.type = "viewscene";
          step.version = "2.0.0";
        }
      }

      await SocketHandler.execute(this.#sequence, actualUsers);
    } else {
      await SocketHandler.execute(this.#sequence)
    }
  }

  /**
   * Fades the screen
   * @param {number} [duration=1000] - Duration, in milliseconds, the fade should take to complete
   * @param {TextureLike} [background="transparent"] - {@link TextureLike}
   * @param {Easing} [easing="none"] - {@link Easing}
   * @returns {BattleTransition}
   * @deprecated This signature is deprecated since version 3.0.0.  Use the object-based signature instead.
   */
  // TODO: Remove signature in 4.0
  public fade(duration: number, background: TextureLike, easing: Easing): this
  /**
   * Fades the screen
   * @param {FadeConfiguration} config - {@link FadeConfiguration}
   * @returns {BattleTransition}
   */
  public fade(config: Partial<FadeConfiguration>): this
  public fade(...args: unknown[]): this {
    if (args.length && typeof args[0] !== "object") {
      log300SignatureDeprecation("fade");
      const [duration = 1000, background = "transparent", easing = "none"] = args as [number, TextureLike, Easing];
      return this.fade({
        duration,
        easing,
        ...generateBackgroundConfig(background)
      })
    }

    const config = foundry.utils.mergeObject(
      foundry.utils.deepClone(FadeStep.DefaultSettings),
      (args[0] ?? {}) as Partial<FadeConfiguration>
    ) as FadeConfiguration;

    this.#sequence.push({
      ...config,
      id: foundry.utils.randomID()
    });
    return this;
  }

  /**
   * Changes the current overlay texture to another for a specified amount of time
   * @param {TextureLike} texture - {@link TextureLike}
   * @param {number} [duration] - Duration, in milliseconds, for this effect to last
   * @param {DualStyle} [style=0] - 0 = Overlay, 1 = Scene, 2 = Both
   * @returns {BattleTransition}
   * @deprecated This signature is deprecated since version 3.0.0.  Use the object-based signature instead.
   */
  // TODO: Remove signature in 4.0
  public flash(texture: TextureLike, duration: number, style: DualStyle): this
  /**
   * Changes the current overlay texture to another for a specified amount of time
   * @param {FlashConfiguration} config - {@link FlashConfiguration}
   * @returns {BattleTransition}
   */
  public flash(config: Partial<FlashConfiguration>): this
  public flash(...args: unknown[]): this {
    if (args.length && typeof args[0] !== "object") {
      log300SignatureDeprecation("flash");
      const [texture = "transparent", duration = 250, style = DualStyle.Overlay] = args as [TextureLike, number, DualStyle];
      return this.flash({
        duration,
        ...generateBackgroundConfig(texture),
        ...generateDualStyleConfig(style)
      });
    }

    const config = foundry.utils.mergeObject(
      foundry.utils.deepClone(FlashStep.DefaultSettings),
      (args[0] ?? {})
    ) as FlashConfiguration;

    this.#sequence.push({
      ...config,
      id: foundry.utils.randomID()
    });
    return this;
  }

  /**
   * Sets the transition overlay to invisible, but will still allow for playing transition effects.
   * @returns {BattleTransition}
   */
  public hideOverlay(): this {
    this.#sequence.push({
      ...RemoveOverlayStep.DefaultSettings,
      id: foundry.utils.randomID()
    });
    return this;
  }

  /**
   * Shifts the hue of the overlay or screen
   * @param {number} amount - Amount by which to shift the hue
   * @param {number} [duration=0] - Duration, in milliseconds, the shift should take to complete
   * @param {Easing} [easing="none"] - {@link Easing}
   * @param {DualStyle} [style=0] - {@link DualStyle}
   * @returns {BattleTransition}
   * @deprecated This signature is deprecated since version 3.0.0.  Use the object-based signature instead.
   */
  // TODO: Remove signature in 4.0
  public hueShift(amount: number, duration: number, easing: Easing, style: DualStyle): this
  /**
   * Shifts the hue of the overlay or screen
   * @param {HueShiftConfiguration} config - {@link HueShiftConfiguration}
   * @returns {BattleTransition}
   */
  public hueShift(config: Partial<HueShiftConfiguration>): this
  public hueShift(...args: unknown[]): this {
    if (args.length && typeof args[0] !== "object") {
      log300SignatureDeprecation("hueShift");

      const [amount, duration = 0, easing = "none", style = DualStyle.Overlay] = args as [number, number, Easing, DualStyle];
      return this.hueShift({
        maxShift: amount,
        duration,
        easing,
        ...generateDualStyleConfig(style)
      })
    }

    const config = foundry.utils.mergeObject(
      foundry.utils.deepClone(HueShiftStep.DefaultSettings),
      (args[0] ?? {})
    ) as HueShiftConfiguration;

    this.#sequence.push({
      ...config,
      id: foundry.utils.randomID()
    });
    return this;
  }

  /**
   * Inverts the current overlay texture
   * @param {DualStyle} [style=0] - 0 = Overlay, 1 = Scene, 2 = Both
   * @returns {BattleTransition}
   * @deprecated This signature is deprecated since version 3.0.0.  Use the object-based signature instead.
   */
  // TODO: Remove signature in 4.0
  public invert(style: DualStyle): this
  /**
   * Inverts the current overlay texture
   * @param {InvertConfiguration} config - {@link InvertConfiguration}
   * @returns {BattleTransition}
   */
  public invert(config: Partial<InvertConfiguration>): this
  public invert(...args: unknown[]): this {
    if (args.length && typeof args[0] !== "object") {
      log300SignatureDeprecation("invert");
      const [style = DualStyle.Overlay] = args as [DualStyle];
      return this.invert({
        ...generateDualStyleConfig(style)
      });
    }

    const config = foundry.utils.mergeObject(
      foundry.utils.deepClone(InvertStep.DefaultSettings),
      (args[0] ?? {})
    ) as InvertConfiguration;

    this.#sequence.push({
      ...config,
      id: foundry.utils.randomID()
    });
    return this;
  }

  /**
   * Adds a linear wipe to the queue
   * @param {WipeDirection} direction - The side of the screen from which the wipe should start
   * @param {number} [duration=1000] - Duration, in milliseconds, for this wipe to take to complete
   * @param {TextureLike} [background="transparent"] - {@link TextureLike}
   * @param {Easing} [easing="none"] - {@link Easing}
   * @returns {BattleTransition}
   * @deprecated This signature is deprecated since version 3.0.0.  Use the object-based signature instead.
   */
  // TODO: Remove signature in 4.0
  public linearWipe(direction: WipeDirection, duration: number, background: TextureLike, easing: Easing): this
  /**
   * Adds a linear wipe to the queue
   * @param {LinearWipeConfiguration} config - {@link LinearWipeConfiguration}
   * @returns {BattleTransition}
   */
  public linearWipe(config: Partial<LinearWipeConfiguration>): this
  public linearWipe(...args: unknown[]): this {
    if (args.length && typeof args[0] !== "object") {
      log300SignatureDeprecation("linearWipe");

      const [direction = "left", duration = 1000, background = "transparent", easing = "none"] = args as [WipeDirection, number, TextureLike, Easing];
      return this.linearWipe({
        direction,
        duration,
        ...generateBackgroundConfig(background),
        easing
      });
    }

    const config = foundry.utils.mergeObject(
      foundry.utils.deepClone(LinearWipeStep.DefaultSettings),
      (args[0] ?? {})
    ) as LinearWipeConfiguration;

    this.#sequence.push({
      ...config,
      id: foundry.utils.randomID()
    });

    return this;
  }

  /**
   * Adds a bit of text to the screen
   * @param {string} message 
   * @param {LoadingTipLocation} location - {@link LoadingTipLocation}
   * @param {number} duration 
   * @param {PIXI.HTMLTextStyle} style - {@link PIXI.HTMLTextStyle}
   * @returns {BattleTransition}
   * @deprecated This signature is deprecated since version 3.0.0.  Use the object-based signature instead.
   */
  // TODO: Remove signature in 4.0
  public loadingTip(message: string, location?: LoadingTipLocation, duration?: number, style?: PIXI.HTMLTextStyle): this
  /**
   * Adds a bit of text to the screen
   * @param {string} rollTable - ID of a {@link Rolltable}
   * @param {LoadingTipLocation} location - {@link LoadingTipLocation}
   * @param {PIXI.HTMLTextStyle} style - {@link PIXI.HTMLTextStyle}
   * @returns {BattleTransition}
   * @deprecated This signature is deprecated since version 3.0.0.  Use the object-based signature instead.
   */
  // TODO: Remove signature in 4.0
  public loadingTip(rollTable: string, location?: LoadingTipLocation, style?: PIXI.HTMLTextStyle): this
  /**
   * Adds a bit of text to the screen
   * @param {LoadingTipConfiguration} config - {@link LoadingTipConfiguration}
   * @returns {BattleTransition}
   */
  public loadingTip(config: Partial<LoadingTipConfiguration>): this
  public loadingTip(...args: unknown[]): this {
    if (args.length && typeof args[0] !== "object") {
      log300SignatureDeprecation("loadingTip");
      const [source, location = "bottomcenter"] = args as [string, LoadingTipLocation];

      const table = fromUuidSync(source as `RollTable.${string}`);

      const style = JSON.parse(JSON.stringify(typeof args[2] === "object" ? args[2] : typeof args[3] === "object" ? args[3] : {})) as Record<string, unknown>

      return this.loadingTip({
        location,
        source: table instanceof RollTable ? "rolltable" : "string",
        table: table instanceof RollTable ? source : "",
        message: table instanceof RollTable ? "" : source,
        duration: typeof args[2] === "number" ? args[2] : 0,
        style
      } as LoadingTipConfiguration)

    }

    const config = foundry.utils.mergeObject(
      foundry.utils.deepClone(LoadingTipStep.DefaultSettings),
      (args[0] ?? {})
    ) as LoadingTipConfiguration;

    this.#sequence.push({
      ...config,
      id: foundry.utils.randomID()
    });

    return this;
  }

  /**
   * Queues up a macro execution
   * @param {string | Macro} macro - The {@link Macro} to execute
   * @returns {BattleTransition}
   * @deprecated This signature is deprecated since version 3.0.0.  Use the object-based signature instead.
   */
  // TODO: Remove signature in 4.0
  public macro(macro: string | Macro): this
  /**
   * Queues up a macro execution
   * @param {MacroConfiguration} config - {@link MacroConfiguration}
   * @returns {BattleTransition}
   */
  public macro(config: Partial<MacroConfiguration>): this
  public macro(...args: unknown[]): this {
    if (args.length && typeof args[0] !== "object") {
      log300SignatureDeprecation("macro");
      return this.macro({
        macro: typeof args[0] === "string" ? args[0] : args[0] instanceof Macro ? args[0].uuid : ""
      });
    }

    const config = foundry.utils.mergeObject(
      foundry.utils.deepClone(MacroStep.DefaultSettings),
      (args[0] ?? {})
    ) as MacroConfiguration;

    this.#sequence.push({
      ...config,
      id: foundry.utils.randomID()
    });
    return this;
  }

  /**
   * Queues up a Doom-style screen melt
   * @param {number} [duration=1000] - Duration, in milliseconds the melt should take to complete
   * @param {TextureLike} [background="transparent"] - {@link TextureLike}
   * @param {Easing} [easing="none"] - {@link Easing}
   * @returns {BattleTransition}
   * @deprecated This signature is deprecated since version 3.0.0.  Use the object-based signature instead.
   */
  // TODO: Remove signature in 4.0
  public melt(duration: number, background: TextureLike, easing: Easing): this
  /**
   * Queues up a Doom-style screen melt
   * @param {MeltConfiguration} config - {@link MeltConfiguration}
   * @returns {BattleTransition}
   */
  public melt(config: Partial<MeltConfiguration>): this
  public melt(...args: unknown[]): this {
    if (args.length && typeof args[0] !== "object") {
      log300SignatureDeprecation("melt");
      const [duration = 1000, background = "transparent", easing = "none"] = args as [number, TextureLike, Easing];
      return this.melt({
        duration,
        easing,
        ...generateBackgroundConfig(background)
      });
    }

    const config = foundry.utils.mergeObject(
      foundry.utils.deepClone(MeltStep.DefaultSettings),
      (args[0] ?? {})
    ) as MeltConfiguration;

    this.#sequence.push({
      ...config,
      id: foundry.utils.randomID()
    });
    return this;
  }

  /**
   * Queues up a set of sequences to run in parallel
   * @param {TransitionSequenceCallback[]} callbacks - Set of {@link TransitionSequenceCallback}s to build sequences to be run in parallel.  Do NOT call `.execute` at the end of these sequences. 
   * @returns {BattleTransition}
   */
  public parallel(...callbacks: TransitionSequenceCallback[]): this {
    const sequences: TransitionConfiguration[][] = [];
    for (const callback of callbacks) {
      const res = callback(new BattleTransition());
      if (res instanceof Promise) throw new ParallelExecuteError();
      sequences.push(res.sequence);
    }

    const step = getStepClassByKey("parallel");
    if (!step) throw new InvalidTransitionError("parallel");

    const config: ParallelConfiguration = {
      ...step?.DefaultSettings,
      id: foundry.utils.randomID(),
      sequences
    };

    this.#sequence.push(config);

    return this;
  }

  /**
   * Progressively increases the relative size of displayed pixels
   * @param {number} [maxSize=10] - Relative size of pixels
   * @param {number} [duration=1000] - Duration, in milliseconds, to scale up the pixels
   * @param {Easing} [easing="none"] - {@link Easing}
   * @param {DualStyle} [style=0] - 0 for overlay, 1 for scene, 2 for both
   * @returns {BattleTransition}
   * @deprecated This signature is deprecated since version 3.0.0.  Use the object-based signature instead.
   */
  // TODO: Remove signature in 4.0
  public pixelate(maxSize: number, duration: number, easing: Easing, style: DualStyle): this
  /**
   * Progressively increases the relative size of displayed pixels
   * @param {PixelateConfiguration} config - {@link PixelateConfiguration}
   * @returns {BattleTransition}
   */
  public pixelate(config: Partial<PixelateConfiguration>): this
  public pixelate(...args: unknown[]): this {
    if (args.length && typeof args[0] !== "object") {
      log300SignatureDeprecation("pixelate");
      const [maxSize = 100, duration = 1000, easing = "none", style = DualStyle.Overlay] = args as [number, number, Easing, DualStyle];
      return this.pixelate({
        maxSize,
        duration,
        easing,
        ...generateDualStyleConfig(style)
      });
    }

    const config = foundry.utils.mergeObject(
      foundry.utils.deepClone(PixelateStep.DefaultSettings),
      (args[0] ?? {})
    ) as PixelateConfiguration;

    this.#sequence.push({
      ...config,
      id: foundry.utils.randomID()
    });

    return this;
  }


  /**
   * Queues up a radial wipe.
   * @param {RadialDirection} directon - {@link RadialDirection} representing where the wipe should start
   * @param {number} [duration=1000] - Duration, in milliseconds, that the wipe should take to complete.
   * @param {ZoomArg} [target=[0.5, 0.5]] - {@link ZoomArg} target on which to center the effect.
   * @param {TextureLike} [background="transparent"] - {@link TextureLike}
   * @param {Easing} [easing="none"] - {@link Easing}
   * @returns {BattleTransition}
   * @deprecated This signature is deprecated since version 3.0.0.  Use the object-based signature instead.
   */
  // TODO: Remove signature in 4.0
  public radialWipe(direction: RadialDirection, duration?: number, target?: ZoomArg, background?: TextureLike, easing?: Easing): this
  /**
   * Queues up a radial wipe
   * @param {RadialDirection} directon - {@link RadialDirection} representing where the wipe should start
   * @param {number} [duration=1000] - Duration, in milliseconds, that the wipe should take to complete.
   * @param {TextureLike} [background="transparent"] - {@link TextureLike}
   * @param {Easing} [easing="none"] - {@link Easing}
   * @returns {BattleTransition}
   * @deprecated This signature is deprecated since version 3.0.0.  Use the object-based signature instead.
   */
  // TODO: Remove signature in 4.0
  public radialWipe(direction: RadialDirection, duration?: number, background?: TextureLike, easing?: Easing): this
  /**
   * Queues up a radial wipe.
   * @param {RadialWipeConfiguration} config - {@link RadialWipeConfiguration}
   * @returns {BattleTransition}
   */
  public radialWipe(config: Partial<RadialWipeConfiguration>): this
  public radialWipe(...args: unknown[]): this {
    // public radialWipe(direction: RadialDirection, duration: number = 1000, ...args: unknown[]): this {
    if (args.length && typeof args[0] !== "object") {
      log300SignatureDeprecation("radialWipe");

      let background: TextureLike = "transparent";
      let easing: Easing = "none";
      let target: ZoomArg = [0.5, 0.5];

      if (Array.isArray(args[0])) {
        target = args[0] as [number, number];
        background = args[1] as TextureLike ?? "transparent";
        easing = args[2] as Easing ?? "none";
      } else if (typeof args[0] === "string" && fromUuidSync<TokenDocument>(args[0])) {
        // It's a UUID
        target = args[0];
        background = args[1] as TextureLike ?? "transparent";
        easing = args[2] as Easing ?? "none";
      } else if (typeof args[0] === "string") {
        background = args[0] as TextureLike ?? "transparent";
        easing = args[1] as Easing ?? "none";
      }

      return this.radialWipe({
        easing,
        target,
        ...generateBackgroundConfig(background)
      })

    }

    const config = foundry.utils.mergeObject(
      foundry.utils.deepClone(RadialWipeStep.DefaultSettings),
      (args[0] ?? {})
    ) as RadialWipeConfiguration

    this.#sequence.push({
      ...config,
      id: foundry.utils.randomID()
    });

    return this;
  }


  /**
   * Repeats the previous transition step a specified number of times
   * @param {number} iterations - Number of times to repeat
   * @returns {BattleTransition}
   * @deprecated This signature is deprecated since version 3.0.0.  Use the object-based signature instead.
   */
  // TODO: Remove signature in 4.0
  public repeat(iterations: number): this
  /**
   * Repeats the previous transition step a specified number of times, with a delay between each iteration
   * 
   * This WILL delay the specified amount before the first iteration
   * @param {number} iterations - Number of times to repeat
   * @param {number} delay - Delay in milliseconds between each iteration
   * @returns {BattleTransition}
   * @deprecated This signature is deprecated since version 3.0.0.  Use the object-based signature instead.
   */
  // TODO: Remove signature in 4.0
  public repeat(iterations: number, delay: number): this
  /**
   * Builds a transition sequence to be repeated a specified number of times
   * @param {number} iterations - Number of times to repeat
   * @param {TransitionSequenceCallback} callback - {@link TransitionSequenceCallback}
   * @returns {BattleTransition}
   * @deprecated This signature is deprecated since version 3.0.0.  Use the object-based signature instead.
   */
  // TODO: Remove signature in 4.0
  public repeat(iterations: number, callback: TransitionSequenceCallback): this
  /**
   * Builds a transition sequence to be repeated a specified number of times, with a specified delay between them
   * @param {number} iterations - Number of times to repeat
   * @param {number} delay - Number of milliseconds to wait between each iteration
   * @param {TransitionSequenceCallback} callback - {@link TransitionSequenceCallback}
   * @returns {BattleTransition}
   * @deprecated This signature is deprecated since version 3.0.0.  Use the object-based signature instead.
   */
  // TODO: Remove signature in 4.0
  public repeat(iterations: number, delay: number, callback: TransitionSequenceCallback): this
  /**
   * Repeats part of a sequence
   * @param {RepeatConfiguration} config - {@link RepeatConfiguration}
   * @param {TransitionSequenceCallback} callback - {@link TransitionSequenceCallback}
   * @returns {BattleTransition}
   */
  public repeat(config: Partial<RepeatConfiguration>, callback?: TransitionSequenceCallback): this
  public repeat(...args: unknown[]): this {
    if (args.length && typeof args[0] !== "object") {
      log300SignatureDeprecation("repeat");
      const iterations = args[0] as number;
      const delay = typeof args[1] === "number" ? args[1] : 0;
      const callback = typeof args[args.length - 1] === "number" ? undefined : args[args.length - 1] as TransitionSequenceCallback;

      const config: Partial<RepeatConfiguration> = {
        delay,
        iterations
      }

      if (callback) {
        const transition = new BattleTransition();
        const res = callback(transition);
        if (res instanceof Promise) throw new RepeatExecuteError();

        config.sequence = res.sequence;
        config.style = "sequence";
      } else {
        config.style = "previous";
      }

      return this.repeat(config);
    }

    const config = foundry.utils.mergeObject(
      foundry.utils.deepClone(RepeatStep.DefaultSettings),
      (args[0] ?? {})
    ) as RepeatConfiguration;
    if (args[1] instanceof Function) {
      const transition = new BattleTransition();
      const res = (args[1] as TransitionSequenceCallback)(transition);
      if (res instanceof Promise) throw new RepeatExecuteError();
      config.sequence = res.sequence;
    }

    this.#sequence.push({
      ...config,
      id: foundry.utils.randomID()
    })

    return this;
  }

  /**
   * Starts the destination scene's ambient playlist/track if configured.
   * @returns {BattleTransition}
   */
  public startPlaylist(): this {
    const step = getStepClassByKey("startplaylist");
    if (!step) throw new InvalidTransitionError("startplaylist");
    this.#sequence.push({
      ...step.DefaultSettings,
      id: foundry.utils.randomID()
    });

    return this;
  }

  /**
   * Executes the previous step, but in reverse.
   * @param {number} [delay=0] - Duration, in milliseconds, to wait before reversing the previous step.
   * @returns {BattleTransition}
   */
  public reverse(delay: number = 0): this {
    const step = getStepClassByKey("reverse");
    if (!step) throw new InvalidTransitionError("reverse");

    if (this.#sequence.length === 0) throw new InvalidTransitionError("reverse");
    const prevStep = getStepClassByKey(this.#sequence[this.#sequence.length - 1].type);
    if (!prevStep) throw new InvalidTransitionError("reverse");
    if (!prevStep.reversible) throw new StepNotReversibleError(prevStep.key);

    const config: ReverseConfiguration = {
      ...step.DefaultSettings,
      delay,
      id: foundry.utils.randomID()
    }

    this.#sequence.push(config);

    return this;
  }

  /**
   * Sets the transition overlay to visible again.
   */
  public showOverlay(): this {
    this.#sequence.push({
      ...RestoreOverlayStep.DefaultSettings,
      id: foundry.utils.randomID(),
    });
    return this;
  }

  /**
   * Plays a sound.
   * @param {string} sound - Path to the sound
   * @param {number} [volume=100] - Volume at which to play the sound
   * @returns {BattleTransition}
   * @deprecated This signature is deprecated since version 3.0.0.  Use the object-based signature instead.
   */
  // TODO: Remove signature in 4.0
  public sound(sound: string, volume?: number): this
  /**
   * Plays a sound.  Will NOT wait for the sound to complete before continuing.
   * @param {foundry.audio.Sound} sound - {@link Sound} to be played
   * @param {number} [volume=100] - Volume at which to play the sound
   * @returns {BattleTransition}
   * @deprecated This signature is deprecated since version 3.0.0.  Use the object-based signature instead.
   */
  // TODO: Remove signature in 4.0
  public sound(sound: foundry.audio.Sound, volume?: number): this
  /**
   * Plays a sound. 
   * @param {SoundConfiguration} config - {@link SoundConfiguration}
   * @returns {BattleTransition}
   */
  public sound(config: Partial<SoundConfiguration>): this
  public sound(...args: unknown[]): this {
    // public sound(arg: unknown, volume: number = 100): this {
    if (args.length && typeof args[0] !== "object") {
      log300SignatureDeprecation("sound");
      const [arg, volume = 100] = args as [foundry.audio.Sound | string, number];
      const sound = typeof arg === "string" ? arg : (arg instanceof foundry.audio.Sound) ? arg.id : null;
      if (!sound) throw new InvalidSoundError(typeof arg === "string" ? arg : typeof arg);

      return this.sound({
        volume,
        file: sound as string
      });
    }

    const config = foundry.utils.mergeObject(
      foundry.utils.deepClone(SoundStep.DefaultSettings),
      (args[0] ?? {})
    ) as SoundConfiguration;
    this.#sequence.push({
      ...config,
      id: foundry.utils.randomID()
    })

    return this;
  }

  /**
   * Queues up a wipe that operates much like a radial wipe, but in a spiral pattern rather than circular
   * @param {ClockDirection} direction - {@link ClockDirection}
   * @param {RadialDirection} radial - {@link RadialDirection}
   * @param {number} [duration=1000] - Duration, in milliseconds, the wipe should last
   * @param {TextureLike} [background="transparent"] {@link TextureLike}
   * @param {Easing} [easing="none"] - {@link Easing}
   * @returns {BattleTransition}
   * @deprecated This signature is deprecated since version 3.0.0.  Use the object-based signature instead.
   */
  // TODO: Remove signature in 4.0
  public spiralShutter(direction: ClockDirection, radial: RadialDirection, duration: number, background: TextureLike, easing: Easing): this
  /**
   * Queues up a wipe that operates much like a radial wipe, but in a spiral pattern rather than circular
   * @param {SpiralShutterConfiguration} config - {@link SpiralShutterConfiguration}
   * @returns {BattleTransition}
   */
  public spiralShutter(config: Partial<SpiralShutterConfiguration>): this
  public spiralShutter(...args: unknown[]): this {
    if (args.length && typeof args[0] !== "object") {
      log300SignatureDeprecation("spiralShutter");
      const [direction = "clockwise", radial = "inside", duration = 1000, background = "transparent", easing = "none"] = args as [ClockDirection, RadialDirection, number, TextureLike, Easing];
      return this.spiralShutter({
        direction,
        radial,
        duration,
        easing,
        ...generateBackgroundConfig(background)
      });
    }

    const config = foundry.utils.mergeObject(
      foundry.utils.deepClone(SpiralShutterStep.DefaultSettings),
      (args[0] ?? {})
    ) as SpiralShutterConfiguration;
    this.#sequence.push({
      ...config,
      id: foundry.utils.randomID()
    });

    return this;
  }

  /**
   * A linear spiral wipe
   * @param {ClockDirection} clock - Whether the spiral travels clockwise or counterclockwise
   * @param {RadialDirection} radial - Whether the spiral starts from the inside or outside of the overlay
   * @param {WipeDirection} direction - Side of the screen from which the wipe starts
   * @param {number} [duration=1000] - Duration, in milliseconds, for the wipe to last
   * @param {TextureLike} background - {@link TextureLike}
   * @param {Easing} easing - {@link Easing}
   * @returns {BattleTransition}
   * @deprecated This signature is deprecated since version 3.0.0.  Use the object-based signature instead.
   */
  // TODO: Remove signature in 4.0
  public spiralWipe(clock: ClockDirection, radial: RadialDirection, direction: WipeDirection, background: TextureLike, easing: Easing): this
  /**
   * A linear spiral wipe
   * @param {SpiralWipeConfiguration} config - {@link SpiralWipeConfiguration} 
   * @returns {BattleTransition}
   */
  public spiralWipe(config: Partial<SpiralWipeConfiguration>): this
  public spiralWipe(...args: unknown[]): this {
    if (args.length && typeof args[0] !== "object") {
      log300SignatureDeprecation("spiralWipe");
      const [clockDirection = "clockwise", radial = "outside", direction = "left", duration = 1000, background = "transparent", easing = "none"] = args as [ClockDirection, RadialDirection, WipeDirection, number, TextureLike, Easing]
      return this.spiralWipe({
        clockDirection,
        radial,
        duration,
        direction,
        easing,
        ...generateBackgroundConfig(background)
      });
    }

    const config = foundry.utils.mergeObject(
      foundry.utils.deepClone(SpiralWipeStep.DefaultSettings),
      (args[0] ?? {})
    ) as SpiralWipeConfiguration

    this.#sequence.push({
      ...config,
      id: foundry.utils.randomID()
    });

    return this;
  }

  /**
   * Queues up a spotlight-shaped wipe
   * @param {WipeDirection} direction - {@link WipeDirection}
   * @param {RadialDirection} radial - {@link RadialDirection}
   * @param {number} [duration=1000] - Duration, in miliseconds, for the wipe to last
   * @param {TextureLike} [background="transparent"] - {@link TextureLike}
   * @param {Easing} [easing="none"] - {@link Easing}
   * @returns {BattleTransition}
   * @deprecated This signature is deprecated since version 3.0.0.  Use the object-based signature instead.
   */
  // TODO: Remove signature in 4.0
  public spotlightWipe(direction: WipeDirection, radial: RadialDirection, duration: number, background: TextureLike, easing: Easing): this
  /**
   * Queues up a spotlight-shaped wipe
   * @param {SpotlightWipeConfiguration} config - {@link SpotlightWipeConfiguration}
   * @returns {BattleTransition}
   */
  public spotlightWipe(config: Partial<SpotlightWipeConfiguration>): this
  public spotlightWipe(...args: unknown[]): this {
    if (args.length && typeof args[0] !== "object") {
      log300SignatureDeprecation("spotlightWipe");
      const [direction, radial, duration = 1000, background = "transparent", easing = "none"] = args as [WipeDirection, RadialDirection, number, TextureLike, Easing];
      return this.spotlightWipe({
        duration,
        direction,
        radial,
        easing,
        ...generateBackgroundConfig(background)
      });
    }

    const config = foundry.utils.mergeObject(
      foundry.utils.deepClone(SpotlightWipeStep.DefaultSettings),
      (args[0] ?? {})
    ) as SpotlightWipeConfiguration

    this.#sequence.push({
      ...config,
      id: foundry.utils.randomID()
    });

    return this;
  }

  /**
   * Swaps the current overlay texture
   * @param {TextureLike} texture - {@link TextureLike}
   * @param {DualStyle} style - 0 = Overlay, 1 = Scene, 2 = Both
   * @returns {BattleTransition}
   * @deprecated This signature is deprecated since version 3.0.0.  Use the object-based signature instead.
   */
  // TODO: Remove signature in 4.0
  public textureSwap(texture: TextureLike, style: DualStyle, replace: boolean): this
  /**
   * Swaps the current overlay texture
   * @param {TextureSwapConfiguration} config - {@link TextureSwapConfiguration}
   * @returns {BattleTransition}
   */
  public textureSwap(config: Partial<TextureSwapConfiguration>): this
  public textureSwap(...args: unknown[]): this {
    if (args.length && typeof args[0] !== "object") {
      log300SignatureDeprecation("textureSwap");
      const [texture, style = DualStyle.Overlay, replace = true] = args as [TextureLike, DualStyle, boolean];
      return this.textureSwap({
        replace,
        ...generateBackgroundConfig(texture),
        ...generateDualStyleConfig(style)
      })
    }

    const config = foundry.utils.mergeObject(
      foundry.utils.deepClone(TextureSwapStep.DefaultSettings),
      (args[0] ?? {})
    ) as TextureSwapConfiguration;

    this.#sequence.push({
      ...config,
      id: foundry.utils.randomID()
    });

    return this;
  }

  /**
   * Twists the screen
   * @param {number} [duration=1000] - Duration, in milliseconds, the animation should last
   * @param {ClockDirection} [direction ="clockwise"] - {@link ClockDirection}
   * @param {number} [maxAngle =10] - Amount to twist
   * @param {Easing} [easing="none"] - {@link Easing}
   * @param {DualStyle} [style=0] - 0 = Overlay, 1 = Scene, 2= Both
   * @returns {BattleTransition}
   * @deprecated This signature is deprecated since version 3.0.0.  Use the object-based signature instead.
   */
  // TODO: Remove signature in 4.0
  public twist(duration: number, direction: ClockDirection, maxAngle: number, easing: Easing, style: DualStyle): this
  /**
   * Twists the screen
   * @param {TwistConfiguration} config - {@link TwistConfiguration}
   * @returns {BattleTransition}
   */
  public twist(config: Partial<TwistConfiguration>): this
  public twist(...args: unknown[]): this {
    if (args.length && typeof args[0] !== "object") {
      log300SignatureDeprecation("twist");

      const [duration = 1000, direction = "clockwise", maxAngle = 10, easing = "none", style = DualStyle.Overlay] = args as [number, ClockDirection, number, Easing, DualStyle];
      return this.twist({
        duration,
        direction,
        maxAngle,
        easing,
        ...generateDualStyleConfig(style)
      });
    }

    const config = foundry.utils.mergeObject(
      foundry.utils.deepClone(TwistStep.DefaultSettings),
      (args[0] ?? {})
    ) as TwistConfiguration;
    this.#sequence.push(config);

    return this;
  }

  /**
   * Plays a video
   * @param {string} file 
   * @returns {BattleTransition}
   * @returns {BattleTransition}
   * @deprecated This signature is deprecated since version 3.0.0.  Use the object-based signature instead.
   */
  // TODO: Remove signature in 4.0
  public video(file: string): this
  /**
   * Plays a video
   * @param {string} file file
   * @param {number} volume 
   * @returns {BattleTransition}
   * @deprecated This signature is deprecated since version 3.0.0.  Use the object-based signature instead.
   */
  // TODO: Remove signature in 4.0
  public video(file: string, volume: number): this
  /**
   * Plays a video
   * @param {string} file 
   * @param {TextureLike} background - {@link TextureLike}
   * @returns {BattleTransition}
   * @deprecated This signature is deprecated since version 3.0.0.  Use the object-based signature instead.
   */
  // TODO: Remove signature in 4.0
  public video(file: string, background: TextureLike): this
  /**
   * Plays a video
   * @param {string} file 
   * @param {boolean} clear 
   * @returns {BattleTransition}
   * @deprecated This signature is deprecated since version 3.0.0.  Use the object-based signature instead.
   */
  // TODO: Remove signature in 4.0
  public video(file: string, clear: boolean): this
  /**
   * Plays a video
   * @param {string} file 
   * @param {number} volume 
   * @param {boolean} clear 
   * @returns {BattleTransition}
   * @deprecated This signature is deprecated since version 3.0.0.  Use the object-based signature instead.
   */
  // TODO: Remove signature in 4.0
  public video(file: string, volume: number, clear: boolean): this
  /**
   * Plays a video
   * @param {string} file 
   * @param {TextureLike} background - {@link TextureLike}
   * @param {boolean} clear 
   * @returns {BattleTransition}
   * @deprecated This signature is deprecated since version 3.0.0.  Use the object-based signature instead.
   */
  // TODO: Remove signature in 4.0
  public video(file: string, background: TextureLike, clear: boolean): this
  /**
   * Plays a video
   * @param {string} file 
   * @param {number} volume 
   * @param {TextureLike} background - {@link TextureLike}
   * @param {boolean} clear 
   * @returns {BattleTransition}
   * @deprecated This signature is deprecated since version 3.0.0.  Use the object-based signature instead.
   */
  // TODO: Remove signature in 4.0
  public video(file: string, volume: number, background: TextureLike, clear: boolean): this
  /**
   * Plays a video
   * @param {VideoConfiguration} config - {@link VideoConfiguration}
   * @returns {BattleTransition}
   */
  public video(config: Partial<VideoConfiguration>): this
  public video(...args: unknown[]): this {
    if (args.length && typeof args[0] !== "object") {
      log300SignatureDeprecation("video");

      const volume: number = args.find(arg => typeof arg === "number") ?? 100;
      const clear: boolean = args.find(arg => typeof arg === "boolean") ?? false;
      const background: TextureLike = args.find(arg => !(typeof arg === "boolean" || typeof arg === "number" || typeof arg === "object")) as TextureLike | undefined ?? "transparent";

      return this.video({
        file: args[0] as string,
        volume,
        clear,
        ...generateBackgroundConfig(background)
      })
    }

    const config = foundry.utils.mergeObject(
      foundry.utils.deepClone(VideoStep.DefaultSettings),
      (args[0] ?? {})
    ) as VideoConfiguration;

    this.#sequence.push({
      ...config,
      id: foundry.utils.randomID()
    });

    return this;
  }

  /**
   * Adds a step to simply wait a given amount of time before continuing.
   * @param {number} duration - Amount of time, in milliseconds, to wait.
   */
  public wait(duration: number): this {
    this.#sequence.push({ type: "wait", duration, id: foundry.utils.randomID(), } as WaitConfiguration);
    return this;
  }

  /**
   * Triggers a wavey saw-like wipe
   * @param {RadialDirection} direction - {@link RadialDirection}
   * @param {number} [duration=1000] - Duration, in milliseconds, for the wipe to last
   * @param {TextureLike} [background=1000] - {@link TextureLike}
   * @param {Easing} [easing="none"] - {@link Easing}
   * @returns {BattleTransition}
   * @deprecated This signature is deprecated since version 3.0.0.  Use the object-based signature instead.
   */
  // TODO: Remove signature in 4.0
  public waveWipe(direction: RadialDirection, duration: number, background: TextureLike, easing: Easing): this
  /**
   * Triggers a wavey saw-like wipe
   * @param {WaveWipeConfiguration} config - {@link WaveWipeConfiguration}
   * @returns {BattleTransition}
   */
  public waveWipe(config: Partial<WaveWipeConfiguration>): this
  public waveWipe(...args: unknown[]): this {
    if (args.length && typeof args[0] !== "object") {
      log300SignatureDeprecation("waveWipe");
      const [direction = "inside", duration = 1000, background = "transparent", easing = "none"] = args as [RadialDirection, number, TextureLike, Easing];
      return this.waveWipe({
        direction,
        duration,
        easing,
        ...generateBackgroundConfig(background)
      });
    }

    const config = foundry.utils.mergeObject(
      foundry.utils.deepClone(WaveWipeStep.DefaultSettings),
      (args[0] ?? {})
    ) as WaveWipeConfiguration;

    this.#sequence.push({
      ...config,
      id: foundry.utils.randomID()
    });
    return this;
  }

  /**
   * Zoom into a location on the overlay
   * 
   * @remarks This effect does not scale the overlay but instead it multiplies the UV coordinates of the overlying texture.
   * As such, the actual values for zoom amount operates in reverse fo what you may expect.
   * 
   * A zoom value of 1 retains the original size.  Values less than one will zoom in, and greater than 1 will zoom out.
   * The maximum distance the overlay can zoom out before the displayed size is 0x0 is dependent on the screen resolution
   * of the viewer, so it is recommended to choose a value that looks "close enough" and possibly fade it out at the end
   * to make its disappearance smoother.
   * @param {number} amount - Relative amount to zoom.  See remarks.
   * @param {number} [duration=1000] - Duration, in milliseconds, that the effect should take to complete
   * @param {ZoomArg} [arg=[0.5, 0.5]] - {@link ZoomArg} representing the location to center the zoom.
   * @param {boolean} [clampBounds=false] - If true, will prevent the texture from leaving the boundaries of its containing sprite when zooming out.
   * @param {TextureLike} [bg="transparent"] - {@link TextureLike} for the background displayed when zooming out if clampBounds is false.
   * @param {Easing} [easing="none"] - {@link Easing} to use when animating the transition.
   * @param {DualStyle} [style=0] - 0 = Overlay, 1 = Scene, 2 = Both
   * @returns {BattleTransition}
   * @deprecated This signature is deprecated since version 3.0.0.  Use the object-based signature instead.
   */
  // TODO: Remove signature in 4.0
  public zoom(amount: number, duration: number, arg: ZoomArg, clampBounds: boolean, background: TextureLike, easing: Easing, style: DualStyle): this
  /**
* Zoom into a location on the overlay
   * 
   * @remarks This effect does not scale the overlay but instead it multiplies the UV coordinates of the overlying texture.
   * As such, the actual values for zoom amount operates in reverse fo what you may expect.
   * 
   * A zoom value of 1 retains the original size.  Values less than one will zoom in, and greater than 1 will zoom out.
   * The maximum distance the overlay can zoom out before the displayed size is 0x0 is dependent on the screen resolution
   * of the viewer, so it is recommended to choose a value that looks "close enough" and possibly fade it out at the end
   * to make its disappearance smoother.
   * @param {ZoomConfiguration} config - {@link ZoomConfiguration}
   * @returns {BattleTransition}
   */
  public zoom(config: Partial<ZoomConfiguration>): this
  public zoom(...args: unknown[]): this {
    if (args.length && typeof args[0] !== "object") {
      log300SignatureDeprecation("zoom");

      const [amount, duration = 1000, target = [0.5, 0.5], clampBounds = false, background = "transparent", easing = "none", style = DualStyle.Overlay] = args as [number, number, ZoomArg, boolean, TextureLike, Easing, DualStyle];
      return this.zoom({
        amount,
        duration,
        easing,
        clampBounds,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        target: Array.isArray(target) ? target : typeof target === "string" ? target : (target as any).uuid ? (target as any).uuid : (target as any).id ? (target as any).id : "",
        ...generateDualStyleConfig(style),
        ...generateBackgroundConfig(background)
      })
    }

    const config = foundry.utils.mergeObject(
      foundry.utils.deepClone(ZoomStep.DefaultSettings),
      (args[0] ?? {})
    ) as ZoomConfiguration

    this.#sequence.push({
      ...config,
      id: foundry.utils.randomID()
    });

    return this;
  }

  /**
   * Simultaneously zoom and blur the screen
   * @param {number} [duration=1000] - Duration in milliseconds the animation should take
   * @param {number} [maxStrength=0.5] - Maximum strength of effect
   * @param {number} [innerRadius=0] - Radius of a circle in the center of the effect that is unaffected
   * @param {Easing} [easing="none"] - {@link Easing}
   * @param {DualStyle} [style=0] - 0 = Overlay, 1 = Scene, 2 = Both
   * @returns {BattleTransition}
   * @deprecated This signature is deprecated since version 3.0.0.  Use the object-based signature instead.
   */
  // TODO: Remove signature in 4.0
  public zoomBlur(duration: number, maxStrength: number, innerRadius: number, easing: Easing, style: DualStyle): this
  /**
   * Simultaneously zoom and blur the screen
   * @param {ZoomBlurConfiguration} config - {@link ZoomBlurConfiguration}
   * @returns {BattleTransition}
   */
  public zoomBlur(config: Partial<ZoomBlurConfiguration>): this
  public zoomBlur(...args: unknown[]): this {
    if (args.length && typeof args[0] !== "object") {
      log300SignatureDeprecation("zoomBlur");
      const [duration = 1000, maxStrength = 0.5, innerRadius = 0, easing = "none", style = DualStyle.Overlay] = args as [number, number, number, Easing, DualStyle];
      return this.zoomBlur({
        duration,
        maxStrength,
        innerRadius,
        easing,
        ...generateDualStyleConfig(style)
      });
    }

    const config = foundry.utils.mergeObject(
      foundry.utils.deepClone(ZoomBlurStep.DefaultSettings),
      (args[0] ?? {})
    ) as ZoomBlurConfiguration;

    this.#sequence.push({
      ...config,
      id: foundry.utils.randomID()
    });
    return this;
  }

  // #endregion Public Methods (52)
}


// #endregion Classes (1)

// #region Functions (1)

function getStepInstance(step: TransitionConfiguration): TransitionStep {
  const handler = getStepClassByKey(step.type);
  if (!handler) throw new InvalidTransitionError(step.type);
  return handler.from(step);
}



// #endregion Functions (1)
