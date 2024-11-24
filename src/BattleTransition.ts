import { coerceMacro, coerceScene } from "./coercion";
import { CUSTOM_HOOKS, PreparedSequences } from "./constants";
import { InvalidMacroError, InvalidSceneError, InvalidSoundError, InvalidTargetError, InvalidTransitionError, NoPreviousStepError, ParallelExecuteError, PermissionDeniedError, RepeatExecuteError, TransitionToSelfError } from "./errors";
import { PreparedTransitionSequence, TransitionSequence } from "./interfaces";
import { AngularWipeConfiguration, BackgroundTransition, BilinearWipeConfiguration, ClockWipeConfiguration, DiamondWipeConfiguration, FadeConfiguration, FireDissolveConfiguration, FlashConfiguration, InvertConfiguration, LinearWipeConfiguration, MacroConfiguration, MeltConfiguration, RadialWipeConfiguration, SceneChangeConfiguration, SoundConfiguration, SpiralWipeConfiguration, SpiralShutterConfiguration, SpotlightWipeConfiguration, TextureSwapConfiguration, TransitionConfiguration, TwistConfiguration, VideoConfiguration, WaitConfiguration, WaveWipeConfiguration, ZoomBlurConfiguration, BossSplashConfiguration, ParallelConfiguration, BarWipeConfiguration, RepeatConfiguration, ZoomConfiguration, ZoomArg, LoadingTipLocation, LoadingTipConfiguration } from "./steps";
import SocketHandler from "./SocketHandler";
import { cleanupTransition, hideLoadingBar, setupTransition, showLoadingBar } from "./transitionUtils";
import { BilinearDirection, ClockDirection, Easing, RadialDirection, TextureLike, WipeDirection } from "./types";
import { deepCopy, deserializeTexture, getStepClassByKey, isColor, localize, serializeTexture, shouldUseAppV2 } from "./utils";
import { TransitionStep } from "./steps/TransitionStep";
import { transitionBuilderDialog } from "./dialogs";

// #region Type aliases (1)

type TransitionSequenceCallback = (transition: BattleTransition) => BattleTransition;

// #endregion Type aliases (1)

// #region Classes (1)

// let suppressSoundUpdates: boolean = false;

/**
 * Primary class that handles queueing, synchronizing, and executing transition sequences.
 */
export class BattleTransition {
  // #region Properties (2)

  #sequence: TransitionConfiguration[] = [];

  // // eslint-disable-next-line no-unused-private-class-members
  // #transitionOverlay: PIXI.DisplayObject[] = [];
  public static SuppressSoundUpdates: boolean = false;

  // #endregion Properties (2)

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
        if (scene.id === canvas?.scene?.id) throw new TransitionToSelfError();
        this.#sequence.push({ type: "scenechange", scene: scene.id } as SceneChangeConfiguration);
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
    const transition = await transitionBuilderDialog(scene);
    if (transition) await BattleTransition.executeSequence(transition);
  }

  public static async SelectScene(omitCurrent: boolean = false): Promise<Scene | null> {
    const content = await renderTemplate(`/modules/${__MODULE_ID__}/templates/scene-selector.hbs`, {
      scenes: game.scenes?.contents.reduce((prev, curr) => {
        if (omitCurrent && curr.id === game.scenes?.current?.id) return prev;
        return [...prev, { id: curr.id, name: curr.name }]
      }, [] as { id: string, name: string }[])
    });

    if (shouldUseAppV2()) {
      return foundry.applications.api.DialogV2.wait({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        window: ({ title: localize("BATTLETRANSITIONS.SCENESELECTOR.TITLE") } as any),
        content,
        buttons: [
          {
            label: `<i class="fas fa-times"></i> ${localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.CANCEL")}`,
            action: "cancel",
            callback: () => Promise.resolve(null)
          },
          {
            label: `<i class="fas fa-check"></i> ${localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.OK")}`,
            action: "ok",
            callback: (event: Event, button: HTMLButtonElement, dialog: HTMLDialogElement) => {
              return Promise.resolve(game.scenes?.get($(dialog).find("#scene").val() as string) ?? null);
            }
          }
        ]
      })
    } else {
      return Dialog.wait({
        title: localize("BATTLETRANSITIONS.SCENESELECTOR.TITLE"),
        content,
        default: "ok",
        buttons: {
          cancel: {
            icon: `<i class="fas fa-times"></i>`,
            label: localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.CANCEL"),
            callback: () => null
          },
          ok: {
            icon: `<i class="fas fa-check"></i>`,
            label: localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.OK"),
            callback: (html) => game.scenes?.get($(html).find("#scene").val() as string) ?? null
          }
        }
      }) as Promise<Scene | null>
    }
  }

  public static async executePreparedSequence(id: string): Promise<void> {
    const prepared = PreparedSequences[id];
    if (!prepared) throw new InvalidTransitionError(typeof prepared);

    Hooks.callAll(CUSTOM_HOOKS.TRANSITION_START, prepared.original);

    let container: PIXI.Container | null = null;

    try {
      container = await setupTransition();
      prepared.overlay = [...container.children];

      hideLoadingBar();

      BattleTransition.SuppressSoundUpdates = true;
      // Execute
      for (const step of prepared.prepared.sequence) {
        const exec = step.execute(container, prepared.original, prepared);
        if (exec instanceof Promise) await exec;
      }

      BattleTransition.SuppressSoundUpdates = false;

      // Teardown
      for (const step of prepared.prepared.sequence) {
        await step.teardown(container);
      }
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
   * Validates a transition sequence and triggers it for all connected clients
   * @param {TransitionConfiguration[]} sequence - {@link TransitionConfiguration}[] representing steps of the sequence
   */
  public static async executeSequence(sequence: TransitionConfiguration[]): Promise<void> {
    // Check for scenechange step
    if (sequence[0].type !== "scenechange") throw new InvalidSceneError(typeof undefined);

    // Validate the target scene
    const scene = (game.scenes?.get((sequence[0] as SceneChangeConfiguration).scene)) as Scene;
    if (!(scene instanceof Scene)) throw new InvalidSceneError(typeof (sequence[0] as SceneChangeConfiguration).scene === "string" ? (sequence[0] as SceneChangeConfiguration).scene : typeof (sequence[0] as SceneChangeConfiguration).scene);

    // Make sure we have permission to activate the new scene
    if (!scene.canUserModify(game.user as User, "update")) throw new PermissionDeniedError();

    // Socket time baybee
    await SocketHandler.execute(sequence);
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
        },
        overlay: []
      }

      return steps;
    } catch (err) {
      ui.notifications?.error((err as Error).message, { console: false });
      console.error(err);
      return []
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

        const valid = await handler.validate(step);
        if (valid instanceof Error) return valid;
        validated.push(valid);
      }
      return validated;
    } catch (err) {
      return err as Error;
    }
  }

  // #endregion Public Static Methods (7)

  // #region Public Methods (46)

  /**
   * Adds an angular wipe, mimicking the battle with Brock in Pokemon Fire Red
   * @param {number} [duration=1000] - Duration that the wipe should last
   * @param {TextureLike} [background="transparent"] - {@link TextureLike} representing the background
   * @param {Easing} [easing="none"] - {@link Easing} to use when animating this transition
   * @returns 
   */
  public angularWipe(duration: number = 1000, background: TextureLike = "transparent", easing: Easing = "none"): this {
    const serializedTexture = serializeTexture(background);
    this.#sequence.push({
      type: "angularwipe",
      duration,
      serializedTexture,
      easing
    } as AngularWipeConfiguration);

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

    const step = getStepClassByKey("barwipe");
    if (!step) throw new InvalidTransitionError("barwipe");
    this.#sequence.push({
      ...step.DefaultSettings,
      duration,
      bars,
      easing,
      direction,
      serializedTexture
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
    this.#sequence.push({
      type: "bilinearwipe",
      serializedTexture,
      duration,
      direction,
      radial,
      easing
    } as BilinearWipeConfiguration);

    return this;
  }

  /**
   * Triggers an animation from the Boss Splash Screen module
   * @param {BossSplashConfiguration} config - {@link BossSplashConfiguration}
   */
  public bossSplash(config: BossSplashConfiguration): this {
    const step = getStepClassByKey("bosssplash");
    if (!step) throw new InvalidTransitionError("bosssplash");
    const newConfig: BossSplashConfiguration = {
      ...step.DefaultSettings,
      ...config
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
      type: "firedissolve",
      duration,
      burnSize,
      easing
    } as FireDissolveConfiguration)
    return this;
  }

  /**
   * Removes any active transition effects from the overlay.
   */
  public clearEffects(): this {
    const step = getStepClassByKey("cleareffects");
    if (!step) throw new InvalidTransitionError("cleareffects");
    this.#sequence.push({
      ...step.DefaultSettings,
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
   * @returns 
   */
  public clockWipe(clockDirection: ClockDirection, direction: WipeDirection, duration: number = 1000, background: TextureLike = "transparent", easing: Easing = "none"): this {
    const serializedTexture = serializeTexture(background);
    this.#sequence.push({
      type: "clockwipe",
      serializedTexture,
      duration,
      clockDirection: clockDirection,
      direction,
      easing
    } as ClockWipeConfiguration)

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
      type: "diamondwipe",
      serializedTexture,
      size,
      duration,
      easing
    } as DiamondWipeConfiguration)

    return this;
  }

  /**
   * Executes the transition sequence built for this {@link BattleTransition} instance.
   * @returns {Promise} - A promise that resolves when the transition is done for all users
   */
  public async execute(): Promise<void> {
    if (!(Array.isArray(this.#sequence) && this.#sequence.length)) throw new InvalidTransitionError(typeof this.#sequence);
    await SocketHandler.execute(this.#sequence)
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
    this.#sequence.push({
      type: "fade",
      serializedTexture,
      duration,
      easing
    } as FadeConfiguration)
    return this;
  }

  /**
   * Changes the current overlay texture to another for a specified amount of time
   * @param {TextureLike} texture - {@link TextureLike}
   * @param {number} [duration] - Duration, in milliseconds, for this effect to last
   * @returns 
   */
  public flash(texture: TextureLike, duration: number): this {
    const step = getStepClassByKey("flash");
    if (!step) throw new InvalidTransitionError("flash");

    const serializedTexture = serializeTexture(texture);
    this.#sequence.push({
      ...step.DefaultSettings,
      duration,
      serializedTexture
    } as FlashConfiguration);
    return this;
  }

  /**
   * 
   * @param {number} amount - Amount by which to shift the hue
   * @param {number} [duration=0] - Duration, in milliseconds, the shift should take to complete
   */
  public hueShift(amount: number, duration: number = 0): this {
    const step = getStepClassByKey("hueshift");
    if (!step) throw new InvalidTransitionError("hueshift");
    const config = {
      ...step.DefaultSettings,
      maxShift: amount,
      duration
    };
    this.#sequence.push(config);
    return this;
  }

  /**
   * Inverts the current overlay texture
   * @returns 
   */
  public invert(): this {
    const step = getStepClassByKey("invert");
    if (!step) throw new InvalidTransitionError("invert");
    this.#sequence.push({
      ...step.DefaultSettings,
      id: foundry.utils.randomID()
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

    this.#sequence.push({
      type: "linearwipe",
      serializedTexture,
      direction,
      duration,
      easing
    } as LinearWipeConfiguration)
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
      type: "melt",
      serializedTexture,
      duration,
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
      sequences
    };

    this.#sequence.push(config);

    return this;
  }

  /**
   * Progressively increases the relative size of displayed pixels
   * @param {number} [maxSize=10] - Relative size of pixels
   * @param {number} [duration=1000] - Duration, in milliseconds, to scale up the pixels
   */
  public pixelate(maxSize: number = 100, duration: number = 1000): this {
    const step = getStepClassByKey("pixelate");
    if (!step) throw new InvalidTransitionError("pixelate");
    const config = {
      ...step.DefaultSettings,
      maxSize,
      duration
    };
    this.#sequence.push(config);

    return this;
  }

  /**
   * Queues up a radial wipe
   * @param {RadialDirection} direction - {@link RadialDirection}
   * @param {number} [duration=1000] - Duration, in milliseconds, that the wipe should take to complete
   * @param {TextureLike} [background="transparent"] - {@link TextureLike}
   * @param {Easing} [easing="none"] - {@link Easing}
   * @returns 
   */
  public radialWipe(direction: RadialDirection, duration: number = 1000, background: TextureLike = "transparent", easing: Easing = "none"): this {
    const serializedTexture = serializeTexture(background);
    this.#sequence.push({
      type: "radialwipe",
      serializedTexture,
      radial: direction,
      duration,
      easing
    } as RadialWipeConfiguration);

    return this;
  }

  /**
   * Will remove the current transition overlay, exposing the new scene
   */
  public removeOverlay(): this {
    this.#sequence.push({ id: foundry.utils.randomID(), type: "removeoverlay", version: "1.1.0" });
    return this;
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
        iterations,
        delay,
        style: "sequence",
        sequence: res.sequence
      } as RepeatConfiguration)
    } else {
      this.#sequence.push({
        ...step.DefaultSettings,
        iterations: iterations - 1,
        delay,
        style: "previous"
      } as RepeatConfiguration)
    }
    return this;
  }

  public restoreOverlay(): this {
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
   * @param {Sound} sound - {@link Sound} to be played
   * @param {number} [volume=100] - Volume at which to play the sound
   */
  public sound(sound: Sound, volume?: number): this
  public sound(arg: unknown, volume: number = 100): this {
    const sound = typeof arg === "string" ? arg : (arg instanceof Sound) ? arg.id : null;
    if (!sound) throw new InvalidSoundError(typeof arg === "string" ? arg : typeof arg);
    this.#sequence.push({
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
      type: "spiralradialwipe",
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
      type: "spotlightwipe",
      direction,
      radial,
      duration,
      serializedTexture,
      easing
    } as SpotlightWipeConfiguration)

    return this;
  }

  /**
   * Swaps the current overlay texture
   * @param {TextureLike} texture - {@link TextureLike}
   * @returns 
   */
  public textureSwap(texture: TextureLike): this {
    const serializedTexture = serializeTexture(texture);
    this.#sequence.push({
      type: "textureswap",
      serializedTexture
    } as TextureSwapConfiguration);

    return this;
  }

  public twist(duration: number = 1000, direction: ClockDirection = "clockwise", maxAngle: number = 10): this {
    this.#sequence.push({
      type: "twist",
      duration,
      direction,
      maxAngle
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
    this.#sequence.push({ type: "wait", duration } as WaitConfiguration);
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
      serializedTexture,
      direction,
      duration,
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
   * @returns 
   */
  public zoom(amount: number, duration: number = 1000, arg: ZoomArg = [0.5, 0.5], clampBounds: boolean = false, bg: TextureLike = "transparent", easing: Easing = "none"): this {
    const step = getStepClassByKey("zoom");
    if (!step) throw new InvalidTransitionError("zoom");

    const serializedTexture = serializeTexture(bg);
    const config: ZoomConfiguration = {
      ...(step.DefaultSettings as ZoomConfiguration),
      amount,
      duration,
      clampBounds,
      serializedTexture,
      easing
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

  public zoomBlur(duration: number = 1000, maxStrength: number = 0.5, innerRadius: number = 0): this {
    this.#sequence.push({
      type: "zoomblur",
      duration,
      maxStrength,
      innerRadius,
    } as ZoomBlurConfiguration)

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
      duration,
      location
    }

    if (parsed && parsed.type === RollTable.documentName) {
      const table: RollTable | undefined = fromUuidSync(source) as RollTable | undefined;
      if (table instanceof RollTable) {
        config.source = "RollTable";
        config.table = table.uuid;
      }
    } else {
      config.source = "string";
      config.message = source;
    }
    config.style = JSON.parse(JSON.stringify(style)) as object;

    this.#sequence.push(config);

    return this;
  }


  // #endregion Public Methods (46)
}

// #endregion Classes (1)

// #region Functions (1)

function getStepInstance(step: TransitionConfiguration): TransitionStep {
  const handler = getStepClassByKey(step.type);
  if (!handler) throw new InvalidTransitionError(step.type);
  return handler.from(step);
}

// #endregion Functions (1)
