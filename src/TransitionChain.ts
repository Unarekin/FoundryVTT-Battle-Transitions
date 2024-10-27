import { coerceMacro, coerceScene } from "./coercion";
import { FileNotFoundError, InvalidMacroError, InvalidSceneError, InvalidTransitionError, ParallelExecuteError, PermissionDeniedError, TransitionToSelfError } from "./errors";
import { BilinearWipeFilter, DiamondTransitionFilter, FadeTransitionFilter, LinearWipeFilter, RadialWipeFilter, FireDissolveFilter, ClockWipeFilter, SpotlightWipeFilter, TextureSwapFilter, MeltFilter, GlitchFilter } from "./filters";
import { TransitionStep, LinearWipeConfiguration, BilinearWipeConfiguration, RadialWipeConfiguration, DiamondTransitionConfiguration, FadeConfiguration, FireDissolveConfiguration, ClockWipeConfiguration, SpotlightWipeConfiguration, TextureSwapConfiguration, WaitConfiguration, SoundConfiguration, VideoConfiguration, ParallelConfiguration, MeltConfiguration, GlitchConfiguration } from "./interfaces";
import SocketHandler from "./SocketHandler";
import { activateScene, cleanupTransition, hideLoadingBar, hideTransitionCover, setupTransition, showLoadingBar } from "./transitionUtils";
import { BilinearDirection, ClockDirection, Easing, RadialDirection, WipeDirection } from './types';
import { awaitHook, createColorTexture, deserializeTexture, localize, log, serializeTexture } from "./utils";

export class TransitionChain {
  // #region Properties (6)

  #defaultEasing: Easing = "none";
  #scene: Scene | null = null;
  #sequence: TransitionStep[] = [];
  #sounds: Sound[] = [];
  #transitionOverlay: PIXI.Container | null = null;
  #typeHandlers: { [x: string]: unknown } = {
    bilinearwipe: this.#executeBilinearWipe.bind(this),
    clockwipe: this.#executeClockWipe.bind(this),
    diamondwipe: this.#executeDiamondWipe.bind(this),
    fade: this.#executeFade.bind(this),
    firedissolve: this.#executeBurn.bind(this),
    glitch: this.#executeGlitch.bind(this),
    linearwipe: this.#executeLinearWipe.bind(this),
    macro: this.#executeMacro.bind(this),
    melt: this.#executeMelt.bind(this),
    parallel: this.#executeParallel.bind(this),
    radialwipe: this.#executeRadialWipe.bind(this),
    removeoverlay: this.#executeRemoveOverlay.bind(this),
    spotlightwipe: this.#executeSpotlightWipe.bind(this),
    textureswap: this.#executeTextureSwap.bind(this),
    sound: this.#executeSound.bind(this),
    video: this.#executeVideo.bind(this),
    wait: this.#executeWait.bind(this)
  }

  #preparationHandlers: { [x: string]: unknown } = {
    video: this.#prepareVideo.bind(this)
  }

  // #endregion Properties (6)

  // #region Constructors (6)

  constructor(id: string)
  constructor(name: string)
  constructor(uuid: string)
  constructor(scene: Scene)
  constructor()
  constructor(arg?: unknown) {
    try {
      if (arg) {
        const scene = coerceScene(arg);
        if (!scene) throw new InvalidSceneError(typeof arg === "string" ? arg : arg as string);
        this.#scene = scene;
      }
    } catch (err) {
      ui.notifications?.error((err as Error).message);
      throw err;
    }
  }

  // #endregion Constructors (6)

  // #region Public Getters And Setters (1)

  public get sequence() { return this.#sequence; }

  // #endregion Public Getters And Setters (1)

  // #region Public Static Methods (7)

  public static Cleanup() {
    cleanupTransition();
  }

  public static async SelectScene(): Promise<Scene | null> {
    const content = await renderTemplate(`/modules/${__MODULE_ID__}/templates/scene-selector.hbs`, {
      scenes: game.scenes?.contents.map(scene => ({ id: scene.id, name: scene.name }))
    });
    return Dialog.wait({
      title: localize("BATTLETRANSITIONS.SCENESELECTOR.TITLE"),
      content,
      default: "ok",
      buttons: {
        cancel: {
          icon: "<i class='fas fa-times'></i>",
          label: localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.CANCEL"),
          callback: () => null
        },
        ok: {
          icon: "<i class='fas fa-check'></i>",
          label: localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.OK"),
          callback: (html) => game.scenes?.get($(html).find("#scene").val() as string) ?? null
        }
      }
    }) as Promise<Scene | null>
  }

  public static TriggerForScene(id: string): void
  public static TriggerForScene(name: string): void
  public static TriggerForScene(uuid: string): void
  public static TriggerForScene(scene: Scene): void
  public static TriggerForScene(arg: unknown): void {
    const scene = coerceScene(arg);
    if (!scene) throw new InvalidSceneError(typeof arg === "string" ? arg : typeof arg);
    const steps: TransitionStep[] = scene.getFlag(__MODULE_ID__, "steps") ?? [];
    if (!steps.length) return;
    SocketHandler.transition(scene.id ?? "", steps);
  }

  // #endregion Public Static Methods (7)

  // #region Public Methods (17)

  public bilinearWipe(direction: BilinearDirection, radial: RadialDirection, duration: number = 1000, bg: PIXI.TextureSource | PIXI.ColorSource = "transparent", easing: Easing = this.#defaultEasing): this {
    new BilinearWipeFilter(direction, radial, bg);
    const background = serializeTexture(bg);
    this.#sequence.push({
      type: "bilinearwipe",
      duration,
      direction,
      radial,
      background,
      easing
    });
    return this;
  }

  public burn(duration: number = 1000, background: PIXI.ColorSource | PIXI.TextureSource = "transparent", burnSize: number = 1.3, easing: Easing = this.#defaultEasing): this {
    new FireDissolveFilter(background, burnSize);
    this.#sequence.push({
      type: "firedissolve",
      background: serializeTexture(background),
      duration,
      burnSize,
      easing
    });

    return this;
  }

  public clockWipe(clockDirection: ClockDirection, direction: WipeDirection, duration: number = 1000, background: PIXI.TextureSource | PIXI.ColorSource = "transparent", easing: Easing = this.#defaultEasing): this {
    new ClockWipeFilter(clockDirection, direction, background);

    this.#sequence.push({
      type: "clockwipe",
      duration,
      background: serializeTexture(background),
      direction,
      clockdirection: clockDirection,
      easing
    });

    return this;
  }

  public diamondWipe(size: number, duration: number = 1000, bg: PIXI.TextureSource | PIXI.ColorSource = "transparent", easing: Easing = this.#defaultEasing): this {
    new DiamondTransitionFilter(size, bg);
    this.#sequence.push({
      type: "diamondwipe",
      size,
      background: serializeTexture(bg),
      duration,
      easing
    });
    return this;
  }

  public async execute(remote: boolean = false, sequence?: TransitionStep[], caller?: string) {
    try {
      if (!this.#scene) throw new InvalidSceneError(typeof undefined);
      if (this.#scene.id === canvas?.scene?.id) throw new TransitionToSelfError();
      if (!remote) {
        if (!this.#scene.canUserModify(game.users?.current as User ?? null, "update")) throw new PermissionDeniedError();
        SocketHandler.transition(this.#scene.id ?? "", sequence ? sequence : this.#sequence);
      } else {
        if (!sequence) throw new InvalidTransitionError(typeof sequence);
        const container = await setupTransition();
        this.#transitionOverlay = container.children[1] as PIXI.Container;
        hideLoadingBar();

        // If we did not call this function, wait for the scene to activate
        if (caller !== game.users?.current?.id) await awaitHook("canvasReady");
        // If we DID, then activate.
        else if (caller === game.users?.current?.id) await activateScene(this.#scene);

        showLoadingBar();
        hideTransitionCover();


        await this.#prepareSequence(sequence);
        await this.#executeSequence(sequence, container);

        // for (const sound of this.#sounds) sound.stop();
        cleanupTransition(container);
      }
    } catch (err) {
      ui.notifications?.error((err as Error).message);
    }
  }

  async #prepareSequence(sequence: TransitionStep[]) {
    for (const step of sequence) {
      if (typeof this.#preparationHandlers[step.type] === "function") {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        await (this.#preparationHandlers[step.type] as Function)(step);
      }
    }
  }

  public fade(duration: number, bg: PIXI.TextureSource | PIXI.ColorSource = "transparent", easing: Easing = this.#defaultEasing): this {
    new FadeTransitionFilter(bg);
    this.#sequence.push({
      type: "fade",
      duration,
      background: serializeTexture(bg),
      easing
    });
    return this;
  }

  public linearWipe(direction: WipeDirection, duration: number = 1000, bg: PIXI.TextureSource | PIXI.ColorSource = "transparent", easing: Easing = this.#defaultEasing): this {
    new LinearWipeFilter(direction, bg);

    const background = serializeTexture(bg);

    this.#sequence.push({
      type: "linearwipe",
      duration,
      direction,
      background,
      easing
    });
    return this;
  }

  public macro(source: string | Macro): this {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const macro = coerceMacro(source as any);
    if (!macro) throw new InvalidMacroError(typeof source === "string" ? source : typeof source);

    this.#sequence.push({
      type: "macro",
      macro: macro.id
    });

    return this;
  }

  public melt(duration: number = 1000, background: PIXI.TextureSource | PIXI.ColorSource = "transparent", easing: Easing = this.#defaultEasing): this {
    new MeltFilter(background);

    this.#sequence.push({
      type: "melt",
      duration,
      background: serializeTexture(background),
      easing
    });

    return this;
  }

  public parallel(...callbacks: ((chain: TransitionChain) => TransitionStep[])[]): this {
    const sequences: TransitionStep[][] = [];
    for (const callback of callbacks) {
      const chain = new TransitionChain();
      const res = callback(chain);
      if (res instanceof Promise) throw new ParallelExecuteError();
      sequences.push(chain.sequence);
    }

    this.#sequence.push({
      type: "parallel",
      sequences
    });

    return this;
  }

  public radialWipe(direction: RadialDirection, duration: number = 1000, bg: PIXI.TextureSource | PIXI.ColorSource = "transparent", easing: Easing = this.#defaultEasing): this {
    new RadialWipeFilter(direction, bg);

    this.#sequence.push({
      type: "radialwipe",
      duration,
      radial: direction,
      background: serializeTexture(bg),
      easing
    })
    return this;
  }

  public removeOverlay(): this {
    this.#sequence.push({
      type: "removeoverlay"
    });
    return this;
  }

  public sound(sound: Sound | string, volume: number = 100): this {
    this.#sequence.push({
      type: "sound",
      file: typeof sound === "string" ? sound : sound.src,
      volume
    });

    return this;
  }

  public spotlightWipe(direction: WipeDirection, radial: RadialDirection, duration: number = 1000, background: PIXI.ColorSource | PIXI.TextureSource = "transparent", easing: Easing = this.#defaultEasing): this {
    new SpotlightWipeFilter(direction, radial, background);
    this.#sequence.push({
      type: "spotlightwipe",
      direction,
      radial,
      duration,
      background: serializeTexture(background),
      easing
    });

    return this;
  }

  public textureSwap(texture: PIXI.ColorSource | PIXI.TextureSource): this {
    new TextureSwapFilter(texture);
    this.#sequence.push({
      type: "textureswap",
      texture: serializeTexture(texture)
    })
    return this;
  }



  public video(file: string): this
  public video(file: string, volume: number): this
  public video(file: string, background: PIXI.TextureSource | PIXI.ColorSource): this
  public video(file: string, clear: boolean): this
  public video(file: string, volume: number, clear: boolean): this
  public video(file: string, background: PIXI.TextureSource | PIXI.ColorSource, clear: boolean): this
  public video(file: string, volume: number, background: PIXI.TextureSource | PIXI.ColorSource, clear: boolean): this
  public video(file: string, ...args: unknown[]): this {
    const volume = args.find(arg => typeof arg === "number") ?? 100;
    const clear = args.find(arg => typeof arg === "boolean") ?? false;
    const background = args.find(arg => !(typeof arg === "boolean" || typeof arg === "number")) ?? "transparent";

    this.#sequence.push({
      type: "video",
      file,
      volume,
      background,
      clear
    });
    return this;
  }

  public wait(duration: number): this {
    this.#sequence.push({
      type: "wait",
      duration
    });
    return this;
  }

  // #endregion Public Methods (17)

  // #region Private Methods (17)

  async #executeBilinearWipe(config: BilinearWipeConfiguration, container: PIXI.Container) {
    const background = deserializeTexture(config.background);
    const filter = new BilinearWipeFilter(config.direction, config.radial, background.baseTexture);
    if (Array.isArray(container.filters)) container.filters.push(filter);
    else container.filters = [filter];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await TweenMax.to(filter.uniforms, { progress: 1, duration: config.duration / 1000, ease: config.easing || this.#defaultEasing });
  }

  public glitch(duration: number = 1000, background: PIXI.TextureSource | PIXI.ColorSource = "transparent"): this {
    new GlitchFilter(background);
    this.#sequence.push({
      type: "glitch",
      duration
    });
    return this;
  }

  async #executeGlitch(config: GlitchConfiguration, container: PIXI.Container) {
    const filter = new GlitchFilter();

    if (Array.isArray(container.filters)) container.filters.push(filter);
    else container.filters = [filter];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await TweenMax.to(filter.uniforms, { progress: 1, duration: config.duration / 1000, ease: config.easing || this.#defaultEasing });
  }

  async #executeBurn(config: FireDissolveConfiguration, container: PIXI.Container) {
    const filter = new FireDissolveFilter(config.background, config.burnSize);
    if (Array.isArray(container.filters)) container.filters.push(filter);
    else container.filters = [filter];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await TweenMax.to(filter.uniforms, { integrity: 0, duration: config.duration / 1000, ease: config.easing || this.#defaultEasing });
  }

  async #executeClockWipe(config: ClockWipeConfiguration, container: PIXI.Container) {
    const background = deserializeTexture(config.background);
    const filter = new ClockWipeFilter(config.clockdirection, config.direction, background.baseTexture);

    if (Array.isArray(container.filters)) container.filters.push(filter);
    else container.filters = [filter];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await TweenMax.to(filter.uniforms, { progress: 1, duration: config.duration / 1000, ease: config.easing || this.#defaultEasing });
  }

  async #executeDiamondWipe(config: DiamondTransitionConfiguration, container: PIXI.Container) {
    const background = deserializeTexture(config.background);
    const filter = new DiamondTransitionFilter(config.size, background.baseTexture);
    if (Array.isArray(container.filters)) container.filters.push(filter);
    else container.filters = [filter];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await TweenMax.to(filter.uniforms, { progress: 1, duration: config.duration / 1000, ease: config.easing || this.#defaultEasing });
  }

  async #executeFade(config: FadeConfiguration, container: PIXI.Container) {
    const bg = deserializeTexture(config.background);
    const filter = new FadeTransitionFilter(bg.baseTexture);
    if (Array.isArray(container.filters)) container.filters.push(filter);
    else container.filters = [filter];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await TweenMax.to(filter.uniforms, { progress: 1, duration: config.duration / 1000, ease: config.easing || this.#defaultEasing });
  }

  async #executeLinearWipe(config: LinearWipeConfiguration, container: PIXI.Container) {
    const background = deserializeTexture(config.background ?? createColorTexture("transparent"));

    const wipe = new LinearWipeFilter(config.direction, background.baseTexture);

    if (Array.isArray(container.filters)) container.filters.push(wipe);
    else container.filters = [wipe];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await TweenMax.to(wipe.uniforms, { progress: 1, duration: config.duration / 1000, ease: config.easing || this.#defaultEasing });
  }

  async #executeMacro(config: { macro: string }) {
    const macro = coerceMacro(config.macro);
    if (!macro) throw new InvalidMacroError(config.macro);

    const res = macro.execute();
    if (res instanceof Promise) await res;
    else return Promise.resolve();
  }

  async #executeMelt(config: MeltConfiguration, container: PIXI.Container) {
    const background = deserializeTexture(config.background);
    const filter = new MeltFilter(background.baseTexture);
    if (Array.isArray(container.filters)) container.filters.push(filter);
    else container.filters = [filter];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await TweenMax.to(filter.uniforms, { progress: 1, duration: config.duration / 1000, ease: config.easing ?? "none" });
  }

  async #executeParallel(config: ParallelConfiguration, container: PIXI.Container) {
    await Promise.all(config.sequences.map(sequence => this.#executeSequence(sequence, container)));
  }

  async #executeRadialWipe(config: RadialWipeConfiguration, container: PIXI.Container) {
    const background = deserializeTexture(config.background);
    const filter = new RadialWipeFilter(config.radial, background.baseTexture);
    if (Array.isArray(container.filters)) container.filters.push(filter);
    else container.filters = [filter];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await TweenMax.to(filter.uniforms, { progress: 1, duration: config.duration / 1000, ease: config.easing || this.#defaultEasing });
  }

  async #executeRemoveOverlay() {
    if (this.#transitionOverlay) this.#transitionOverlay.alpha = 0;
    return Promise.resolve();
  }

  async #executeSequence(sequence: TransitionStep[], container: PIXI.Container) {
    for (const step of sequence) {
      // Execute step

      if (typeof this.#typeHandlers[step.type] !== "function") throw new InvalidTransitionError(step.type);
      const handler = this.#typeHandlers[step.type];
      if (typeof handler === "function") await handler(step, container);
    }
  }

  async #executeSound(config: SoundConfiguration) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await foundry.audio.AudioHelper.preloadSound(config.file);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const sound = await foundry.audio.AudioHelper.play({ src: config.file, volume: config.volume / 100, autoplay: true }, true) as Sound;
    this.#sounds.push(sound);

    return Promise.resolve();
  }

  async #executeSpotlightWipe(config: SpotlightWipeConfiguration, container: PIXI.Container) {
    const background = deserializeTexture(config.background);
    const filter = new SpotlightWipeFilter(config.direction, config.radial, background.baseTexture);
    if (Array.isArray(container.filters)) container.filters.push(filter);
    else container.filters = [filter];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await TweenMax.to(filter.uniforms, { progress: 1, duration: config.duration / 1000, ease: config.easing || this.#defaultEasing });
  }

  async #executeTextureSwap(config: TextureSwapConfiguration, container: PIXI.Container) {
    const texture = deserializeTexture(config.texture);
    const filter = new TextureSwapFilter(texture.baseTexture);
    if (Array.isArray(container.filters)) container.filters.push(filter);
    else container.filters = [filter];
    return Promise.resolve();
  }

  async #executeVideo(config: VideoConfiguration, container: PIXI.Container) {
    const exist = await srcExists(config.file);
    if (!exist) throw new FileNotFoundError(config.file);
    const texture: PIXI.Texture = await PIXI.Assets.load(config.file);
    const resource: PIXI.VideoResource = texture.baseTexture.resource as PIXI.VideoResource;
    const source = resource.source;

    const background = deserializeTexture(config.background);

    return new Promise<void>((resolve, reject) => {
      source.addEventListener("ended", () => {
        if (config.clear) {
          if (Array.isArray(container.filters) && container.filters.includes(vidFilter)) container.filters.splice(container.filters.indexOf(vidFilter), 1);
          vidFilter.destroy();
        }
        resolve();
      });
      source.addEventListener("error", e => { reject(e.error as Error); });



      const bgFilter = new TextureSwapFilter(background.baseTexture);
      const vidFilter = new TextureSwapFilter(texture.baseTexture);

      if (Array.isArray(container.filters)) container.filters.push(bgFilter, vidFilter);
      else container.filters = [bgFilter, vidFilter];

      source.volume = config.volume / 100;
      void source.play();
    });
  }

  async #executeWait(config: WaitConfiguration) {
    return new Promise(resolve => { setTimeout(resolve, config.duration) });
  }

  async #prepareVideo(config: VideoConfiguration) {
    log(`Preloading ${config.file}...`);
    const start = Date.now();
    await PIXI.Assets.load(config.file);
    log(`Video loaded in ${Date.now() - start}ms`);
  }

  // #endregion Private Methods (17)
}
