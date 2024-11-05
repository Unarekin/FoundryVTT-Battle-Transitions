import { coerceMacro, coerceScene } from "./coercion";
import { ConfigurationHandler } from "./ConfigurationHandler";
import { CUSTOM_HOOKS } from "./constants";
import { InvalidMacroError, InvalidSceneError, InvalidSoundError, InvalidTransitionError, ParallelExecuteError, RepeatExecuteError, TransitionToSelfError } from "./errors";
import { PreparedTransitionSequence, TransitionSequence } from "./interfaces";
import SocketHandler from "./SocketHandler";
import { AngularWipeConfiguration, BilinearWipeConfiguration, ClockWipeConfiguration, DiamondWipeConfiguration, FadeConfiguration, FireDissolveConfiguration, FlashConfiguration, InvertConfiguration, LinearWipeConfiguration, MacroConfiguration, MeltConfiguration, ParallelConfiguration, RadialWipeConfiguration, SceneChangeConfiguration, SceneChangeStep, SoundConfiguration, SpiralRadialWipeConfiguration, SpotlightWipeConfiguration, TextureSwapConfiguration, TransitionConfiguration, TransitionStep, WaitConfiguration, WaitStep, WaveWipeConfiguration, VideoConfiguration, BackgroundTransition, ParallelSequence, AngularWipeStep, BilinearWipeStep, ClockWipeStep, DiamondWipeStep, FadeStep, FireDissolveStep, SpiralRadialWipeStep, FlashStep, InvertStep, LinearWipeStep, MacroStep, MeltStep, ParallelStep, RadialWipeStep, SoundStep, SpotlightWipeStep, TextureSwapStep, WaveWipeStep, VideoStep, RemoveOverlayStep, RestoreOverlayStep, StartPlaylistStep } from "./steps";
import { cleanupTransition, hideLoadingBar, setupTransition, showLoadingBar } from "./transitionUtils";
import { BilinearDirection, ClockDirection, Easing, RadialDirection, TextureLike, WipeDirection } from "./types";
import { deserializeTexture, log, serializeTexture } from "./utils";

let suppressSoundUpdates: boolean = false;

// #region Type aliases (1)

type TransitionSequenceCallback = (transition: BattleTransition) => TransitionConfiguration[];

// #endregion Type aliases (1)

// #region Classes (1)

/**
 * Primary class that handles queueing, synchronizing, and executing transition sequences.
 */
export class BattleTransition {
  // #region Properties (3)

  #sequence: TransitionConfiguration[] = [];
  #stepTypes: { [x: string]: typeof TransitionStep } = {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    angularwipe: (AngularWipeStep as any),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    bilinearwipe: (BilinearWipeStep as any),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    clockwipe: (ClockWipeStep as any),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    diamondwipe: (DiamondWipeStep as any),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    fade: (FadeStep as any),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    firedissolve: (FireDissolveStep as any),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    flash: (FlashStep as any),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    invert: (InvertStep as any),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    linearwipe: (LinearWipeStep as any),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    macro: (MacroStep as any),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    melt: (MeltStep as any),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    parallel: (ParallelStep as any),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    radialwipe: (RadialWipeStep as any),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    removeoverlay: (RemoveOverlayStep as any),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    restoreoverlay: (RestoreOverlayStep as any),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    scenechange: (SceneChangeStep as any),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    sound: (SoundStep as any),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    spiralradialwipe: (SpiralRadialWipeStep as any),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    spotlightwipe: (SpotlightWipeStep as any),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    startplaylist: (StartPlaylistStep as any),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    textureswap: (TextureSwapStep as any),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    video: (VideoStep as any),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    wait: (WaitStep as any),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    wavewipe: (WaveWipeStep as any)
  }

  // eslint-disable-next-line no-unused-private-class-members
  #transitionOverlay: PIXI.DisplayObject[] = [];

  // #endregion Properties (3)

  // #region Constructors (6)

  #scene: Scene | null = null;

  static get SuppressSoundUpdates(): boolean { return suppressSoundUpdates; }
  static set SuppressSoundUpdates(val: boolean) {
    log("Setting SuppressSoundUpdates:", val);
    suppressSoundUpdates = val;
  }

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
        this.#scene = scene;
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

  // #region Public Static Methods (1)

  public static BuildTransition(scene?: Scene): Promise<void> {
    return ConfigurationHandler.BuildTransition(scene);
  }

  // #endregion Public Static Methods (1)

  // #region Public Methods (39)

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
   * Begins executing a given transition sequence, notifying other connected clients to do the same.
   * @param {TransitionConfiguration[]} [sequence] - {@link TransitionConfiguration}[] to execute.  Defaults to sequence pre-configured on this {@link BattleTransition}.
   */
  public async execute(sequence?: TransitionSequence): Promise<void> {
    try {
      if (!sequence) {
        sequence = {
          caller: game.user?.id ?? "",
          remote: false,
          sequence: this.#sequence
        };
      }

      // Notify other clients to execute, if necessary
      if (!sequence.remote) {

        // Ensure we start with a scene change
        if (sequence.sequence[0].type !== "scenechange") {
          if (this.#scene instanceof Scene) {
            sequence.sequence.unshift({
              ...SceneChangeStep.DefaultSettings,
              id: foundry.utils.randomID(),
              scene: this.#scene.id
            } as SceneChangeConfiguration);
          } else {
            throw new InvalidSceneError(typeof this.#scene);
          }
        }


        // Ensure we have a start playlist step
        if (!sequence.sequence.some(step => step.type === "startplaylist")) {
          sequence.sequence.push({
            ...StartPlaylistStep.DefaultSettings,
            id: foundry.utils.randomID()
          })
        }

        // Last minute validation of our sequence
        const valid = await this.#validateSequence(sequence.sequence);
        if (valid instanceof Error) throw valid;

        const serialized = await this.#serializeSequence(sequence.sequence);
        await SocketHandler.execute({
          ...sequence,
          sequence: serialized
        });
      } else {
        await this.#executeSequence(sequence);
      }
    } catch (err) {
      ui.notifications?.error((err as Error).message, { console: false });
      throw err;
    }
  }

  public async executeParallelSequence(container: PIXI.Container, config: ParallelConfiguration) {
    await Promise.all(
      config.sequences.map(({ sequence, prepared }) => this.#doExecuteSequence(container, sequence, prepared))
    );
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
    const serializedTexture = serializeTexture(texture);
    this.#sequence.push({
      type: "flash",
      duration,
      serializedTexture
    } as FlashConfiguration);
    return this;
  }

  /**
   * Inverts the current overlay texture
   * @returns 
   */
  public invert(): this {
    this.#sequence.push({ type: "invert" } as InvertConfiguration);
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

  /**
   * Queues up a set of sequences to run in parallel
   * @param callbacks 
   * @returns 
   */
  public parallel(...callbacks: TransitionSequenceCallback[]): this {
    const sequences: TransitionSequence[] = [];
    for (const callback of callbacks) {
      const transition = new BattleTransition();
      const res = callback(transition);
      if (res instanceof Promise) throw new ParallelExecuteError();
      sequences.push({
        caller: game.user?.id ?? "",
        remote: false,
        sequence: transition.sequence
      });
    }

    this.#sequence.push({
      type: "parallel",
      sequences: sequences.map(sequence => ({
        sequence,
        prepared: {
          ...sequence,
          sequence: []
        }
      } as ParallelSequence))
    } as ParallelConfiguration);

    return this;
  }

  public async prepareSequence(sequence: TransitionSequence): Promise<PreparedTransitionSequence> {
    try {
      const steps: TransitionStep[] = [];

      for (const step of sequence.sequence) {
        const instance = this.#getStepInstance(step);

        if (Object.prototype.hasOwnProperty.call(step, "backgroundType")) {
          const bgStep = step as unknown as BackgroundTransition;

          switch (bgStep.backgroundType) {
            case "color":
              bgStep.deserializedTexture = deserializeTexture(bgStep.backgroundColor ?? "transparent");
              break;
            case "image":
              bgStep.deserializedTexture = deserializeTexture(bgStep.backgroundImage ?? "transparent");
              break;
          }
        }

        // if (typeof (step as unknown as BackgroundTransition).serializedTexture !== "undefined") {
        //   // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        //   (step as BackgroundTransition).deserializedTexture = deserializeTexture((step as BackgroundTransition).serializedTexture as any);
        // }
        const prep = instance.prepare(sequence);
        if (prep instanceof Promise) await prep;

        steps.push(instance);
      }
      return {
        ...sequence,
        sequence: steps
      };
    } catch (err) {
      throw err as Error;
    }
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
    this.#sequence.push({ type: "removeoverlay", version: "1.1.0" });
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

    if (callback) {
      const transition = new BattleTransition();
      const res = callback(transition);
      if (res instanceof Promise) throw new RepeatExecuteError();
      for (let i = 0; i < iterations; i++) {
        this.#sequence.push(...transition.sequence);
        if (delay) this.wait(delay);
      }
    } else {
      // Repeat the last step
      const step = this.#sequence[this.#sequence.length - 1];
      if (delay) this.wait(delay);
      for (let i = 0; i < iterations; i++) {
        this.#sequence.push(step);
        if (delay) this.wait(delay);
      }
    }

    return this;
  }

  public restoreOverlay(): this {
    this.#sequence.push({ type: "restoreoverlay", version: "1.1.0" });
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
  public spiralRadialWipe(direction: ClockDirection, radial: RadialDirection, duration: number = 1000, background: TextureLike = "transparent", easing: Easing = "none"): this {
    const serializedTexture = serializeTexture(background);
    this.#sequence.push({
      type: "spiralradialwipe",
      serializedTexture,
      duration,
      easing,
      direction,
      radial
    } as SpiralRadialWipeConfiguration)

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

  // #endregion Public Methods (39)

  // #region Private Methods (6)

  async #doExecuteSequence(container: PIXI.Container, sequence: TransitionSequence, prepared: PreparedTransitionSequence) {
    for (const step of prepared.sequence) {
      const exec = step.execute(container, sequence);
      if (exec instanceof Promise) await exec;
    }
  }

  async #executeSequence(sequence: TransitionSequence) {
    BattleTransition.SuppressSoundUpdates = true;
    Hooks.callAll(CUSTOM_HOOKS.TRANSITION_START, sequence);
    log("Executing sequence:", sequence);
    let container: PIXI.Container | null = null;
    try {
      // Prepare overlay
      container = await setupTransition();
      this.#transitionOverlay = [...container.children];
      hideLoadingBar();

      const preparedSequence = await this.prepareSequence(sequence);
      await this.#doExecuteSequence(container, sequence, preparedSequence);
      await this.#teardownSequence(container, preparedSequence);

      BattleTransition.SuppressSoundUpdates = false;
    } catch (err) {
      throw err as Error;
    } finally {
      setTimeout(() => { showLoadingBar() }, 250);
      if (container) cleanupTransition(container);
      Hooks.callAll(CUSTOM_HOOKS.TRANSITION_END, sequence);
    }
  }

  #getStepInstance(step: TransitionConfiguration): TransitionStep {
    const handler = this.#stepTypes[step.type];
    if (!handler) throw new InvalidTransitionError(step.type);
    return handler.from(step);
  }

  async #serializeSequence(sequence: TransitionConfiguration[] = this.#sequence): Promise<TransitionConfiguration[]> {
    const serializedSequence: TransitionConfiguration[] = [];
    for (const step of sequence) {
      const instance = this.#getStepInstance(step);
      const res = instance.serialize();
      const serialized = (res instanceof Promise) ? await res : res;
      const bg = serialized as unknown as BackgroundTransition;
      if (typeof bg.deserializedTexture !== "undefined" && typeof bg.serializedTexture === "undefined")
        bg.serializedTexture = serializeTexture(bg.deserializedTexture);
      delete bg.deserializedTexture;

      serializedSequence.push(serialized);
    }
    return serializedSequence;
  }

  async #teardownSequence(container: PIXI.Container, sequence: PreparedTransitionSequence) {
    for (const step of sequence.sequence) {
      await step.teardown(container);
    }
  }

  async #validateSequence(sequence: TransitionConfiguration[] = this.#sequence): Promise<boolean | Error> {
    try {
      for (const step of sequence) {
        const handler = this.#stepTypes[step.type];
        if (!handler) throw new InvalidTransitionError(step.type);
        const valid = await handler.validate(step);
        if (valid instanceof Error) return valid;
      }
      return true;
    } catch (err) {
      throw err as Error;
    }
  }

  // #endregion Private Methods (6)
}

// #endregion Classes (1)
