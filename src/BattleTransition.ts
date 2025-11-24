import { coerceColorHex, coerceMacro, coerceScene, coerceUser } from "./coercion";
import { CUSTOM_HOOKS, PreparedSequences } from "./constants.js";
import { InvalidDirectionError, InvalidDurationError, InvalidEasingError, InvalidElementError, InvalidMacroError, InvalidSceneError, InvalidSoundError, InvalidTargetError, InvalidTextureError, InvalidTransitionError, ModuleNotActiveError, NoPreviousStepError, ParallelExecuteError, RepeatExecuteError, StepNotReversibleError, TransitionToSelfError } from "./errors";
import { PreparedTransitionSequence, TransitionSequence } from "./interfaces";
import { AngularWipeConfiguration, BackgroundTransition, BilinearWipeConfiguration, ClockWipeConfiguration, DiamondWipeConfiguration, FadeConfiguration, FireDissolveConfiguration, FlashConfiguration, InvertConfiguration, LinearWipeConfiguration, MacroConfiguration, MeltConfiguration, RadialWipeConfiguration, SceneChangeConfiguration, SoundConfiguration, SpiralWipeConfiguration, SpiralShutterConfiguration, SpotlightWipeConfiguration, TextureSwapConfiguration, TransitionConfiguration, TwistConfiguration, VideoConfiguration, WaitConfiguration, WaveWipeConfiguration, ZoomBlurConfiguration, BossSplashConfiguration, ParallelConfiguration, BarWipeConfiguration, RepeatConfiguration, ZoomConfiguration, ZoomArg, LoadingTipLocation, LoadingTipConfiguration, ReverseConfiguration, ClearEffectsConfiguration, ClockWipeStep, AngularWipeStep, LinearWipeStep, FadeStep } from "./steps";
import SocketHandler from "./SocketHandler";
import { cleanupTransition, hideLoadingBar, hideTransitionCover, removeFiltersFromScene, setupTransition, showLoadingBar } from "./transitionUtils";
import { BilinearDirection, ClockDirection, DualStyle, Easing, RadialDirection, TextureLike, WipeDirection } from "./types";
import { backgroundType, deepCopy, deserializeTexture, formDataExtendedClass, getStepClassByKey, isColor, localize, renderTemplateFunc, serializeTexture, templateDir } from "./utils";
import { TransitionStep } from "./steps/TransitionStep";
import { TransitionBuilder } from "./applications";
import { filters } from "./filters";
import { isValidBilinearDirection, isValidClockDirection, isValidEasing, isValidRadialDirection, isValidWipeDirection } from "./validation";
import { ScreenSpaceCanvasGroup } from "./ScreenSpaceCanvasGroup";

// #region Type aliases (1)

type TransitionSequenceCallback = (transition: BattleTransition) => BattleTransition;

// #endregion Type aliases (1)

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
      window: ({ title: localize("BATTLETRANSITIONS.DIALOGS.SCENESELECTOR.TITLE") } as any),
      content,
      rejectClose: false,
      buttons: [
        {
          icon: "fas fa-times",
          label: localize("Cancel"),
          action: "cancel",
          callback: () => Promise.resolve(undefined)
        },
        {
          icon: "fas fa-check",
          label: localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.OK"),
          action: "ok",
          callback: (event: Event, button: HTMLButtonElement, dialog: foundry.applications.api.DialogV2.Any) => {
            const form = dialog.form;
            if (!(form instanceof HTMLFormElement)) throw new InvalidElementError();
            const formData = foundry.utils.expandObject((new (formDataExtendedClass())(form)).object) as Record<string, unknown>
            return Promise.resolve(coerceScene(formData.scene));
          }
        }
      ]
    }).then(result => result instanceof Scene ? result : undefined)

  }

  public static HideLoadingBar = false;

  public static async executePreparedSequence(id: string): Promise<void> {
    const prepared = PreparedSequences[id];
    if (!prepared) throw new InvalidTransitionError(typeof prepared);

    const sceneChange = prepared.original.sequence.find(item => item.type === "scenechange" || item.type === "viewscene") as SceneChangeConfiguration | undefined;
    const skipTransition = sceneChange && sceneChange.scene === canvas?.scene?.id;

    Hooks.callAll(CUSTOM_HOOKS.TRANSITION_START, prepared.original);

    let container: PIXI.Container | null = null;

    try {
      container = setupTransition();
      prepared.overlay = [...container.children];

      hideLoadingBar();

      BattleTransition.SuppressSoundUpdates = true;

      if (!canvasGroup) {
        Hooks.once(CUSTOM_HOOKS.INITIALIZE, () => {
          if (container) canvasGroup?.addChild(container);
        });
      } else {
        canvasGroup.addChild(container);
      }

      if (!sceneChange) hideTransitionCover();


      // Execute
      for (const step of prepared.prepared.sequence) {
        const stepClass = getStepClassByKey(step.config.type ?? "");

        if (stepClass?.skipWhenSceneViewed && skipTransition) continue;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if ((step.config as any).backgroundType === "overlay" || (step.config as any).serializedTexture === "overlay") {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          (step.config as any).deserializedTexture = (container.children[0] as PIXI.Sprite).texture
        }

        const exec = step.execute(container, prepared.original, prepared);
        if (exec instanceof Promise) await exec;
      }

      BattleTransition.SuppressSoundUpdates = false;

      // Teardown
      for (const step of prepared.prepared.sequence) {
        await step.teardown(container);
      }

      removeFiltersFromScene(prepared.prepared);
    } catch (err) {
      ui.notifications?.error((err as Error).message, { console: false });
      console.error(err);
    } finally {
      setTimeout(() => { showLoadingBar(); }, 250);
      if (container) cleanupTransition(container);
      if (prepared) Hooks.callAll(CUSTOM_HOOKS.TRANSITION_END, prepared.original)
      else Hooks.callAll(CUSTOM_HOOKS.TRANSITION_END);
      delete PreparedSequences[id];
    }
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

  // #region Public Methods (52)

  /**
   * Adds an angular wipe, mimicking the battle with Brock in Pokemon Fire Red
   * @param {number} [duration=1000] - Duration that the wipe should last
   * @param {TextureLike} [background="transparent"] - {@link TextureLike} representing the background
   * @param {Easing} [easing="none"] - {@link Easing} to use when animating this transition
   * @returns 
   */
  public angularWipe(duration: number = 1000, background: TextureLike = "transparent", easing: Easing = "none"): this {
    if (typeof duration === "string" && isNaN(parseFloat(duration))) throw new InvalidDurationError(duration);
    if (typeof duration !== "number") throw new InvalidDurationError(duration);
    if (!isValidEasing(easing)) throw new InvalidEasingError(easing);

    const actualDuration = typeof duration === "string" ? parseFloat(duration) : duration;
    if (actualDuration < 0) throw new InvalidDurationError(duration);

    const serializedTexture = serializeTexture(background);

    const bgType = backgroundType(background);

    const config: AngularWipeConfiguration = {
      ...AngularWipeStep.DefaultSettings,
      id: foundry.utils.randomID(),
      serializedTexture,
      duration: actualDuration,
      backgroundType: bgType,
      backgroundColor: bgType === "color" ? coerceColorHex(background) ?? "" : "",
      backgroundImage: bgType === "image" ? background as string : "",
      easing
    }

    this.#sequence.push(config);

    return this;
  }

  /**
   * Generate a wipe of alternating bars either horizontally or vertically
   * @param {number} bars - Number of bars into which to split the screen
   * @param {"horizontal" | "vertical"} direction - Direction the bars should travel
   * @param {number} [duration=1000] - Duration, in milliseconds, the wipe should take to complete
   * @param {TextureLike} [background="transparent"] - {@link TextureLike}
   * @param {Easing} [easing="none"] - {@link Easing}
   */
  public barWipe(bars: number, direction: "horizontal" | "vertical", duration: number = 1000, background: TextureLike = "transparent", easing: Easing = "none"): this {
    const serializedTexture = serializeTexture(background);

    if (!(direction === "horizontal" || direction === "vertical")) throw new InvalidDirectionError(direction);
    if (isNaN(parseFloat(duration.toString()))) throw new InvalidDurationError(duration);
    if (duration < 0) throw new InvalidDurationError(duration);

    if (!isValidEasing(easing)) throw new InvalidEasingError(easing);


    const step = getStepClassByKey("barwipe");
    if (!step) throw new InvalidTransitionError("barwipe");
    this.#sequence.push({
      ...step.DefaultSettings,
      id: foundry.utils.randomID(),
      duration,
      bars,
      easing,
      direction,
      serializedTexture,
      backgroundType: backgroundType(background)
    } as BarWipeConfiguration);

    return this;
  }

  /**
   * Adds a bilinear wipe
   * @param {BilinearDirection} direction - {@link BilinearDirection}
   * @param {RadialDirection} radial - {@link RadialDirection}
   * @param {number} [duration=1000] - Duration in milliseconds that the wipe should last
   * @param {TextureLike} [background="transparent"] - {@link TextureLike} representing the background
   * @param {Easing} [easing="none"] - {@link Easing}
   * @returns 
   */
  public bilinearWipe(direction: BilinearDirection, radial: RadialDirection, duration: number = 1000, background: TextureLike = "transparent", easing: Easing = "none"): this {
    const serializedTexture = serializeTexture(background);

    if (!serializedTexture) throw new InvalidTextureError();

    if (!isValidBilinearDirection(direction)) throw new InvalidDirectionError(direction);
    if (!isValidRadialDirection(radial)) throw new InvalidDirectionError(radial);
    if (!isValidEasing(easing)) throw new InvalidEasingError(easing);
    if (isNaN(parseFloat(duration.toString()))) throw new InvalidDurationError(duration);
    if (duration < 0) throw new InvalidDurationError(duration);


    const step = getStepClassByKey("bilinearwipe");
    if (!step) throw new InvalidTransitionError("bilinearwipe");

    const config: BilinearWipeConfiguration = {
      ...(step.DefaultSettings as BilinearWipeConfiguration),
      id: foundry.utils.randomID(),
      serializedTexture,
      backgroundType: backgroundType(background),
      duration,
      direction,
      radial,
      easing,
    }

    this.#sequence.push(config);

    return this;
  }

  /**
   * Triggers an animation from the Boss Splash Screen module
   * @param {BossSplashConfiguration} config - {@link BossSplashConfiguration}
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
   */
  public burn(duration: number = 1000, burnSize: number = 1.3, easing: Easing = "none"): this {
    this.#sequence.push({
      id: foundry.utils.randomID(),
      type: "firedissolve",
      duration,
      burnSize,
      easing
    } as FireDissolveConfiguration)
    return this;
  }

  /**
   * Removes any active transition effects from the overlay, the scene, or both
   * @param {DualStyle} [style=0] - {@link DualStyle}
   */
  public clearEffects(style: DualStyle = DualStyle.Both): this {
    const step = getStepClassByKey("cleareffects");
    if (!step) throw new InvalidTransitionError("cleareffects");
    this.#sequence.push({
      ...step.DefaultSettings,
      id: foundry.utils.randomID(),
      applyToScene: style === DualStyle.Scene || style === DualStyle.Both,
      applyToOverlay: style === DualStyle.Overlay || style === DualStyle.Both
    } as ClearEffectsConfiguration);
    return this;
  }

  /**
   * Adds a clock wipe to the queue
   * @param {ClockDirection} clockDirection - {@link ClockDirection}
   * @param {WipeDirection} direction - {@link WipeDirection}
   * @param {number} [duration=1000] - Duration, in milliseconds, that the wipe should last
   * @param {TextureLike} [background="transparent"] - {@link TextureLike}
   * @param {Easing} [easing="none"] - {@link Easing}
   * @returns 
   */
  public clockWipe(clockDirection: ClockDirection, direction: WipeDirection, duration: number = 1000, background: TextureLike = "transparent", easing: Easing = "none"): this {
    // Sanity check arguments
    if (!isValidClockDirection(clockDirection)) throw new InvalidDirectionError(clockDirection);
    if (!isValidWipeDirection(direction)) throw new InvalidDirectionError(direction);
    if (isNaN(parseFloat(duration.toString())) || duration < 0) throw new InvalidDurationError(duration);
    if (!isValidEasing(easing)) throw new InvalidEasingError(easing);


    const serializedTexture = serializeTexture(background);

    const bgType = backgroundType(background);


    const config: ClockWipeConfiguration = {
      ...ClockWipeStep.DefaultSettings,
      id: foundry.utils.randomID(),
      serializedTexture,
      duration,
      clockDirection,
      direction,
      backgroundType: bgType,
      backgroundColor: bgType === "color" ? coerceColorHex(background) ?? "" : "",
      backgroundImage: bgType === "image" ? background as string : "",
      easing
    }

    this.#sequence.push(config);

    return this;
  }

  /**
   * Adds a wipe that causes diamond-shapes to disappear over time from left to right
   * @param {number} [size=40] - Relative size of the diamonds
   * @param {number} [duration=1000] - Duration, in milliseconds, that the wipe should last
   * @param {TextureLike} [background="transparent"] - {@link TextureLike}
   * @param {Easing} [easing="none"] - {@link Easing}
   * @returns 
   */
  public diamondWipe(size: number = 40, duration: number = 1000, background: TextureLike = "transparent", easing: Easing = "none"): this {
    const serializedTexture = serializeTexture(background);

    this.#sequence.push({
      id: foundry.utils.randomID(),
      type: "diamondwipe",
      serializedTexture,
      size,
      backgroundType: backgroundType(background),
      duration,
      easing
    } as DiamondWipeConfiguration)

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
   * @returns 
   */
  public fade(duration: number = 1000, background: TextureLike = "transparent", easing: Easing = "none"): this {
    const serializedTexture = serializeTexture(background);
    const bgType = backgroundType(background);

    const config: FadeConfiguration = {
      ...FadeStep.DefaultSettings,
      id: foundry.utils.randomID(),
      type: "fade",
      serializedTexture,
      duration,
      easing,
      backgroundType: bgType,
      backgroundColor: bgType === "color" ? coerceColorHex(background) ?? "" : "",
      backgroundImage: bgType === "image" ? background as string : "",
    };

    this.#sequence.push(config);

    return this;
  }

  /**
   * Changes the current overlay texture to another for a specified amount of time
   * @param {TextureLike} texture - {@link TextureLike}
   * @param {number} [duration] - Duration, in milliseconds, for this effect to last
   * @param {DualStyle} [style=0] - 0 = Overlay, 1 = Scene, 2 = Both
   * @returns 
   */
  public flash(texture: TextureLike, duration: number, style: DualStyle = DualStyle.Overlay): this {
    const step = getStepClassByKey("flash");
    if (!step) throw new InvalidTransitionError("flash");

    const serializedTexture = serializeTexture(texture);
    this.#sequence.push({
      ...step.DefaultSettings,
      id: foundry.utils.randomID(),
      duration,
      serializedTexture,
      applyToScene: style === DualStyle.Scene || style === DualStyle.Both,
      applyToOverlay: style === DualStyle.Overlay || style === DualStyle.Both
    } as FlashConfiguration);
    return this;
  }

  /**
   * Sets the transition overlay to invisible, but will still allow for playing transition effects.
   * @returns 
   */
  public hideOverlay(): this {
    this.#sequence.push({ id: foundry.utils.randomID(), type: "removeoverlay", version: "1.1.0" });
    return this;
  }

  /**
   * 
   * @param {number} amount - Amount by which to shift the hue
   * @param {number} [duration=0] - Duration, in milliseconds, the shift should take to complete
   * @param {Easing} [easing="none"] - {@link Easing}
   * @param {DualStyle} [style=0] - {@link DualStyle}
   */
  public hueShift(amount: number, duration: number = 0, easing: Easing = "none", style: DualStyle = DualStyle.Overlay): this {
    const step = getStepClassByKey("hueshift");
    if (!step) throw new InvalidTransitionError("hueshift");
    const config = {
      ...step.DefaultSettings,
      id: foundry.utils.randomID(),
      maxShift: amount,
      duration,
      easing,
      applyToScene: style === DualStyle.Scene || style === DualStyle.Both,
      applyToOverlay: style === DualStyle.Overlay || style === DualStyle.Both
    };
    this.#sequence.push(config);
    return this;
  }

  /**
   * Inverts the current overlay texture
   * @param {DualStyle} [style=0] - 0 = Overlay, 1 = Scene, 2 = Both
   * @returns 
   */
  public invert(style: DualStyle = DualStyle.Overlay): this {
    const step = getStepClassByKey("invert");
    if (!step) throw new InvalidTransitionError("invert");
    this.#sequence.push({
      ...step.DefaultSettings,
      id: foundry.utils.randomID(),
      applyToScene: style === DualStyle.Scene || style === DualStyle.Both,
      applyToOverlay: style === DualStyle.Overlay || style === DualStyle.Both
    } as InvertConfiguration);
    return this;
  }

  /**
   * Adds a linear wipe to the queue
   * @param {WipeDirection} direction - The side of the screen from which the wipe should start
   * @param {number} [duration=1000] - Duration, in milliseconds, for this wipe to take to complete
   * @param {TextureLike} [background="transparent"] - {@link TextureLike}
   * @param {Easing} [easing="none"] - {@link Easing}
   * @returns 
   */
  public linearWipe(direction: WipeDirection, duration: number = 1000, background: TextureLike = "transparent", easing: Easing = "none"): this {
    const serializedTexture = serializeTexture(background);

    const bgType = backgroundType(background);

    const config: LinearWipeConfiguration = {
      ...LinearWipeStep.DefaultSettings,
      id: foundry.utils.randomID(),
      type: "linearwipe",
      serializedTexture,
      direction,
      duration,
      backgroundType: bgType,
      backgroundColor: bgType === "color" ? coerceColorHex(background) ?? "" : "",
      backgroundImage: bgType === "image" ? background as string : "",
      easing,
    };

    this.#sequence.push(config);
    return this;
  }

  public loadingTip(message: string, location?: LoadingTipLocation, duration?: number, style?: PIXI.HTMLTextStyle): this
  public loadingTip(rollTable: string, location?: LoadingTipLocation, style?: PIXI.HTMLTextStyle): this
  public loadingTip(source: string, location: LoadingTipLocation = "bottomcenter", ...others: unknown[]): this {
    const step = getStepClassByKey("loadingtip");
    if (!step) throw new InvalidTransitionError("loadingtip");

    // Parse arguments
    const duration: number = typeof others[0] === "number" ? others[0] : 0;

    let style: PIXI.HTMLTextStyle | null = null;
    if (others[1] instanceof PIXI.HTMLTextStyle) {
      style = others[1];
    } else if (others[0] instanceof PIXI.HTMLTextStyle) {
      style = others[0];
    } else {
      style = new PIXI.HTMLTextStyle();
      deepCopy(style, PIXI.HTMLTextStyle.defaultStyle);
      deepCopy(style, (step.DefaultSettings as LoadingTipConfiguration).style);
    }

    // Check for UUID
    const parsed = typeof foundry.utils.parseUuid === "function" ? foundry.utils.parseUuid(source) : parseUuid(source);

    const config: LoadingTipConfiguration = {
      ...step.DefaultSettings as LoadingTipConfiguration,
      id: foundry.utils.randomID(),
      duration,
      location
    }

    if (parsed && parsed.type === RollTable.documentName) {
      const table: RollTable | undefined = fromUuidSync(source) as RollTable | undefined;
      if (table instanceof RollTable) {
        config.source = "rolltable";
        config.table = table.uuid;
      }
    } else {
      config.source = "string";
      config.message = source;
    }
    config.style = JSON.parse(JSON.stringify(style)) as Record<string, unknown>;

    this.#sequence.push(config);

    return this;
  }

  /**
   * Queues up a macro execution
   * @param {string | Macro} macro - The {@link Macro} to execute
   * @returns 
   */
  public macro(macro: string | Macro): this {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const actualMacro = coerceMacro(macro as any);
    if (!actualMacro) throw new InvalidMacroError(typeof macro === "string" ? macro : typeof macro);
    this.#sequence.push({
      id: foundry.utils.randomID(),
      type: "macro",
      macro: actualMacro.uuid
    } as MacroConfiguration);
    return this;
  }

  /**
   * Queues up a Doom-style screen melt
   * @param {number} [duration=1000] - Duration, in milliseconds the melt should take to complete
   * @param {TextureLike} [background="transparent"] - {@link TextureLike}
   * @param {Easing} [easing="none"] - {@link Easing}
   */
  public melt(duration: number = 1000, background: TextureLike = "transparent", easing: Easing = "none"): this {
    const serializedTexture = serializeTexture(background);

    this.#sequence.push({
      id: foundry.utils.randomID(),
      type: "melt",
      serializedTexture,
      duration,
      backgroundType: backgroundType(background),
      easing
    } as MeltConfiguration)

    return this;
  }

  /*
   * Queues up a set of sequences to run in parallel
   * @param {TransitionSequenceCallback[]} callbacks - Set of {@link TransitionSequenceCallback}s to build sequences to be run in parallel.  Do NOT call `.execute` at the end of these sequences.
   * @returns 
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
   */
  public pixelate(maxSize: number = 100, duration: number = 1000, easing: Easing = "none", style: DualStyle = 0): this {
    const step = getStepClassByKey("pixelate");
    if (!step) throw new InvalidTransitionError("pixelate");
    const config = {
      ...step.DefaultSettings,
      id: foundry.utils.randomID(),
      maxSize,
      duration,
      easing,
      applyToOverlay: style === DualStyle.Overlay || style === DualStyle.Both,
      applyToScene: style === DualStyle.Scene || style === DualStyle.Both
    };
    this.#sequence.push(config);

    return this;
  }


  /**
   * Queues up a radial wipe.
   * @param {RadialDirection} directon - {@link RadialDirection} representing where the wipe should start
   * @param {number} [duration=1000] - Duration, in milliseconds, that the wipe should take to complete.
   * @param {ZoomArg} [target=[0.5, 0.5]] - {@link ZoomArg} target on which to center the effect.
   * @param {TextureLike} [background="transparent"] - {@link TextureLike}
   * @param {Easing} [easing="none"] - {@link Easing}
   */
  public radialWipe(direction: RadialDirection, duration?: number, target?: ZoomArg, background?: TextureLike, easing?: Easing): this
  /**
   * Queues up a radial wipe
   * @param {RadialDirection} directon - {@link RadialDirection} representing where the wipe should start
   * @param {number} [duration=1000] - Duration, in milliseconds, that the wipe should take to complete.
   * @param {TextureLike} [background="transparent"] - {@link TextureLike}
   * @param {Easing} [easing="none"] - {@link Easing}
   */
  public radialWipe(direction: RadialDirection, duration?: number, background?: TextureLike, easing?: Easing): this
  public radialWipe(direction: RadialDirection, duration: number = 1000, ...args: unknown[]): this {
    const step = getStepClassByKey("radialwipe");
    if (!step) throw new InvalidTransitionError("radialwipe");


    let background: TextureLike = "transparent";
    let easing: Easing = "none";
    let target: ZoomArg = [0.5, 0.5];

    if (Array.isArray(args[0])) {
      target = args[0] as [number, number];
      background = args[1] as TextureLike ?? "transparent";
      easing = args[2] as Easing ?? "none";
    } else if (typeof args[0] === "string" && fromUuidSync(args[0])) {
      // It's a UUID
      target = args[0];
      background = args[1] as TextureLike ?? "transparent";
      easing = args[2] as Easing ?? "none";
    } else if (typeof args[0] === "string") {
      background = args[0] as TextureLike ?? "transparent";
      easing = args[1] as Easing ?? "none";
    }

    const serializedTexture = serializeTexture(background);

    const config: RadialWipeConfiguration = {
      ...step.DefaultSettings as RadialWipeConfiguration,
      id: foundry.utils.randomID(),
      serializedTexture,
      radial: direction,
      duration,
      easing
    };

    if (Array.isArray(target)) {
      config.target = target;
    } else if (typeof target === "string" && fromUuidSync(target)) {
      config.target = target;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    } else if (typeof (target as any).uuid === "string") {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      config.target = (target as any).uuid as string;
    } else {
      throw new InvalidTargetError(target);
    }

    this.#sequence.push(config);

    return this;
  }


  /**
   * Sets the transition overlay to invisible, but will still allow for playing transition effects.
   * @deprecated since 1.1.0 please use {@link hideOverlay} instead.
   * @see {@link hideOverlay}
   */
  public removeOverlay(): this {
    ui.notifications?.warn("BATTLETRANSITIONS.WARNINGS.REMOVEOVERLAYDEPRECATION", { localize: true });
    return this.hideOverlay();
  }

  /**
   * Repeats the previous transition step a specified number of times
   * @param {number} iterations - Number of times to repeat
   */
  public repeat(iterations: number): this
  /**
   * Repeats the previous transition step a specified number of times, with a delay between each iteration
   * 
   * This WILL delay the specified amount before the first iteration
   * @param {number} iterations - Number of times to repeat
   * @param {number} delay - Delay in milliseconds between each iteration
   */
  public repeat(iterations: number, delay: number): this
  /**
   * Builds a transition sequence to be repeated a specified number of times
   * @param {number} iterations - Number of times to repeat
   * @param {TransitionSequenceCallback} callback - {@link TransitionSequenceCallback}
   */
  public repeat(iterations: number, callback: TransitionSequenceCallback): this
  /**
   * Builds a transition sequence to be repeated a specified number of times, with a specified delay between them
   * @param {number} iterations - Number of times to repeat
   * @param {number} delay - Number of milliseconds to wait between each iteration
   * @param {TransitionSequenceCallback} callback - {@link TransitionSequenceCallback}
   */
  public repeat(iterations: number, delay: number, callback: TransitionSequenceCallback): this
  public repeat(iterations: number, ...args: unknown[]): this {
    const delay = typeof args[0] === "number" ? args[0] : 0;
    const callback = (typeof args[0] === "number" ? args[1] : args[0]) as TransitionSequenceCallback;

    if ((typeof callback === "function") && !this.#sequence.some(step => step.type !== "scenechange")) throw new NoPreviousStepError();

    const step = getStepClassByKey("repeat");
    if (!step) throw new InvalidTransitionError("repeat");

    if (callback) {
      const transition = new BattleTransition();
      const res = callback(transition);
      if (res instanceof Promise) throw new RepeatExecuteError();

      this.#sequence.push({
        ...step.DefaultSettings,
        id: foundry.utils.randomID(),
        iterations,
        delay,
        style: "sequence",
        sequence: res.sequence
      } as RepeatConfiguration)
    } else {
      this.#sequence.push({
        ...step.DefaultSettings,
        id: foundry.utils.randomID(),
        iterations: iterations - 1,
        delay,
        style: "previous"
      } as RepeatConfiguration)
    }
    return this;
  }

  /**
   * Sets the transition overlay to visible again.
   * @deprecated since version 1.1.0 please use {@link showOverlay} instead.
   * @see {@link showOverlay}
   */
  public restoreOverlay(): this {
    ui.notifications?.warn("BATTLETRANSITIONS.WARNINGS.RESTOREOVERLAYDEPRECATION", { localize: true });
    return this.showOverlay();
  }

  /**
   * Starts the destination scene's ambient playlist/track if configured.
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
    this.#sequence.push({ id: foundry.utils.randomID(), type: "restoreoverlay", version: "1.1.0" });
    return this;
  }

  /**
   * Plays a sound.  Will NOT wait for the sound to complete before continuing.
   * @param {string} sound - Path to the sound
   * @param {number} [volume=100] - Volume at which to play the sound
   */
  public sound(sound: string, volume?: number): this
  /**
   * Plays a sound.  Will NOT wait for the sound to complete before continuing.
   * @param {foundry.audio.Sound} sound - {@link Sound} to be played
   * @param {number} [volume=100] - Volume at which to play the sound
   */
  public sound(sound: foundry.audio.Sound, volume?: number): this
  public sound(arg: unknown, volume: number = 100): this {
    const sound = typeof arg === "string" ? arg : (arg instanceof foundry.audio.Sound) ? arg.id : null;
    if (!sound) throw new InvalidSoundError(typeof arg === "string" ? arg : typeof arg);
    this.#sequence.push({
      id: foundry.utils.randomID(),
      type: "sound",
      volume,
      file: sound
    } as SoundConfiguration);
    return this;
  }

  /**
   * Queues up a wipe that operates much like a radial wipe, but in a spiral pattern rather than circular
   * @param {ClockDirection} direction - {@link ClockDirection}
   * @param {RadialDirection} radial - {@link RadialDirection}
   * @param {number} [duration=1000] - Duration, in milliseconds, the wipe should last
   * @param {TextureLike} [background="transparent"] {@link TextureLike}
   * @param {Easing} [easing="none"] - {@link Easing}
   * @returns 
   */
  public spiralShutter(direction: ClockDirection, radial: RadialDirection, duration: number = 1000, background: TextureLike = "transparent", easing: Easing = "none"): this {
    const serializedTexture = serializeTexture(background);
    this.#sequence.push({
      id: foundry.utils.randomID(),
      type: "spiralshutter",
      serializedTexture,
      duration,
      easing,
      direction,
      radial
    } as SpiralShutterConfiguration)

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
   * @returns 
   */
  public spiralWipe(clock: ClockDirection, radial: RadialDirection, direction: WipeDirection, duration: number = 1000, background: TextureLike = "transparent", easing: Easing = "none"): this {
    const serializedTexture = serializeTexture(background);

    const backgroundType = typeof serializedTexture === "string" && isColor(serializedTexture) ? "color" : "image";
    this.#sequence.push({
      type: "spiralwipe",
      id: foundry.utils.randomID(),
      version: "1.1.0",
      duration,
      direction,
      clockDirection: clock,
      radial,
      easing,
      bgSizingMode: "stretch",
      backgroundType,
      serializedTexture
    } as SpiralWipeConfiguration);

    return this;
  }

  /**
   * Queues up a spotlight-shaped wipe
   * @param {WipeDirection} direction - {@link WipeDirection}
   * @param {RadialDirection} radial - {@link RadialDirection}
   * @param {number} [duration=1000] - Duration, in miliseconds, for the wipe to last
   * @param {TextureLike} [background="transparent"] - {@link TextureLike}
   * @param {Easing} [easing="none"] - {@link Easing}
   * @returns 
   */
  public spotlightWipe(direction: WipeDirection, radial: RadialDirection, duration: number = 1000, background: TextureLike = "transparent", easing: Easing = "none"): this {
    const serializedTexture = serializeTexture(background);
    this.#sequence.push({
      id: foundry.utils.randomID(),
      type: "spotlightwipe",
      direction,
      radial,
      duration,
      backgroundType: backgroundType(background),
      serializedTexture,
      easing
    } as SpotlightWipeConfiguration)

    return this;
  }

  /**
   * Swaps the current overlay texture
   * @param {TextureLike} texture - {@link TextureLike}
   * @param {DualStyle} style - 0 = Overlay, 1 = Scene, 2 = Both
   * @returns 
   */
  public textureSwap(texture: TextureLike, style: DualStyle = DualStyle.Overlay): this {
    const serializedTexture = serializeTexture(texture);
    this.#sequence.push({
      id: foundry.utils.randomID(),
      type: "textureswap",
      serializedTexture,
      backgroundType: backgroundType(texture),
      applyToScene: style === DualStyle.Scene || style === DualStyle.Both,
      applyToOverlay: style === DualStyle.Overlay || style === DualStyle.Both
    } as TextureSwapConfiguration);

    return this;
  }

  /**
   * Twists the screen
   * @param {number} [duration=1000] - Duration, in milliseconds, the animation should last
   * @param {ClockDirection} [direction ="clockwise"] - {@link ClockDirection}
   * @param {number} [maxAngle =10] - Amount to twist
   * @param {Easing} [easing="none"] - {@link Easing}
   * @param {DualStyle} [style=0] - 0 = Overlay, 1 = Scene, 2= Both
   * @returns 
   */
  public twist(duration: number = 1000, direction: ClockDirection = "clockwise", maxAngle: number = 10, easing: Easing = "none", style: DualStyle = DualStyle.Overlay): this {
    this.#sequence.push({
      id: foundry.utils.randomID(),
      type: "twist",
      duration,
      direction,
      maxAngle,
      easing,
      applyToScene: style === DualStyle.Scene || style === DualStyle.Both,
      applyToOverlay: style === DualStyle.Overlay || style === DualStyle.Both
    } as TwistConfiguration);

    return this;
  }

  public video(file: string): this
  public video(file: string, volume: number): this
  public video(file: string, background: TextureLike): this
  public video(file: string, clear: boolean): this
  public video(file: string, volume: number, clear: boolean): this
  public video(file: string, background: TextureLike, clear: boolean): this
  public video(file: string, volume: number, background: TextureLike, clear: boolean): this
  public video(file: string, ...args: unknown[]): this {
    const volume = args.find(arg => typeof arg === "number") ?? 100;
    const clear = args.find(arg => typeof arg === "boolean") ?? false;
    const background = args.find(arg => !(typeof arg === "boolean" || typeof arg === "number")) ?? "transparent";

    const serializedTexture = serializeTexture(background);

    this.#sequence.push({
      id: foundry.utils.randomID(),
      type: "video",
      volume,
      file,
      serializedTexture,
      clear
    } as VideoConfiguration);
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
   * @returns 
   */
  public waveWipe(direction: RadialDirection, duration: number = 1000, background: TextureLike = "transparent", easing: Easing = "none"): this {
    const serializedTexture = serializeTexture(background);
    this.#sequence.push({
      type: "wavewipe",
      id: foundry.utils.randomID(),
      serializedTexture,
      direction,
      duration,
      backgroundType: backgroundType(background),
      easing
    } as WaveWipeConfiguration)

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
   * @returns 
   */
  public zoom(amount: number, duration: number = 1000, arg: ZoomArg = [0.5, 0.5], clampBounds: boolean = false, background: TextureLike = "transparent", easing: Easing = "none", style: DualStyle = DualStyle.Overlay): this {
    const step = getStepClassByKey("zoom");
    if (!step) throw new InvalidTransitionError("zoom");

    const serializedTexture = serializeTexture(background);
    const config: ZoomConfiguration = {
      ...(step.DefaultSettings as ZoomConfiguration),
      id: foundry.utils.randomID(),
      amount,
      duration,
      clampBounds,
      serializedTexture,
      backgroundType: backgroundType(background),
      easing,
      applyToScene: style === DualStyle.Scene || style === DualStyle.Both,
      applyToOverlay: style === DualStyle.Overlay || style === DualStyle.Both
    };

    if (Array.isArray(arg)) {
      config.target = arg;
    } else if (typeof arg === "string" && fromUuidSync(arg)) {
      config.target = arg;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    } else if (typeof (arg as any).uuid === "string") {
      // A UUID directly
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      config.target = (arg as any).uuid as string;
    } else {
      throw new InvalidTargetError(arg);
    }

    this.#sequence.push(config);

    return this;
  }

  /**
   * Simultaneously zoom and blur the screen
   * @param {number} [duration=1000] - Duration in milliseconds the animation should take
   * @param {number} [maxStrength=0.5] - Maximum strength of effect
   * @param {number} [innerRadius=0] - Radius of a circle in the center of the effect that is unaffected
   * @param {Easing} [easing="none"] - {@link Easing}
   * @param {DualStyle} [style=0] - 0 = Overlay, 1 = Scene, 2 = Both
   * @returns 
   */
  public zoomBlur(duration: number = 1000, maxStrength: number = 0.5, innerRadius: number = 0, easing: Easing = "none", style: DualStyle = DualStyle.Overlay): this {
    this.#sequence.push({
      type: "zoomblur",
      id: foundry.utils.randomID(),
      duration,
      maxStrength,
      innerRadius,
      easing,
      applyToScene: style === DualStyle.Scene || style === DualStyle.Both,
      applyToOverlay: style === DualStyle.Overlay || style === DualStyle.Both
    } as ZoomBlurConfiguration)

    return this;
  }

  // #endregion Public Methods (52)

  public static get overlayGroup() { return canvasGroup; }

  static initialize() {
    canvasGroup = new ScreenSpaceCanvasGroup();
    canvas?.stage?.addChild(canvasGroup);
  }
}

let canvasGroup: ScreenSpaceCanvasGroup | undefined = undefined;

// #endregion Classes (1)

// #region Functions (1)

function getStepInstance(step: TransitionConfiguration): TransitionStep {
  const handler = getStepClassByKey(step.type);
  if (!handler) throw new InvalidTransitionError(step.type);
  return handler.from(step);
}



// #endregion Functions (1)
