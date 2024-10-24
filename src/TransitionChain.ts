import { coerceMacro, coerceScene } from "./coercion";
import { InvalidMacroError, InvalidSceneError, InvalidTransitionError, ParallelExecuteError, PermissionDeniedError } from "./errors";
import { BilinearWipeFilter, DiamondTransitionFilter, FadeTransitionFilter, LinearWipeFilter, RadialWipeFilter, FireDissolveFilter, ClockWipeFilter, SpotlightWipeFilter, TextureSwapFilter } from "./filters";
import { TransitionStep, LinearWipeConfiguration, BilinearWipeConfiguration, RadialWipeConfiguration, DiamondTransitionConfiguration, FadeConfiguration, FireDissolveConfiguration, ClockWipeConfiguration, SpotlightWipeConfiguration, TextureSwapConfiguration, WaitConfiguration, SoundConfiguration, VideoConfiguration, ParallelConfiguration } from "./interfaces";
import SocketHandler from "./SocketHandler";
import { activateScene, cleanupTransition, hideLoadingBar, hideTransitionCover, setupTransition, showLoadingBar } from "./transitionUtils";
import { BilinearDirection, ClockDirection, Easing, RadialDirection, WipeDirection } from './types';
import { awaitHook, createColorTexture, deserializeTexture, localize, serializeTexture } from "./utils";


export class TransitionChain {
  #scene: Scene | null = null;
  #sequence: TransitionStep[] = [];
  #sounds: Sound[] = [];
  #transitionOverlay: PIXI.Container | null = null;
  #defaultEasing: Easing = "none";

  #typeHandlers: { [x: string]: unknown } = {
    bilinearwipe: this.#executeBilinearWipe.bind(this),
    clockwipe: this.#executeClockWipe.bind(this),
    diamondwipe: this.#executeDiamondWipe.bind(this),
    fade: this.#executeFade.bind(this),
    firedissolve: this.#executeBurn.bind(this),
    linearwipe: this.#executeLinearWipe.bind(this),
    macro: this.#executeMacro.bind(this),
    parallel: this.#executeParallel.bind(this),
    radialwipe: this.#executeRadialWipe.bind(this),
    removeoverlay: this.#executeRemoveOverlay.bind(this),
    spotlightwipe: this.#executeSpotlightWipe.bind(this),
    textureswap: this.#executeTextureSwap.bind(this),
    sound: this.#executeSound.bind(this),
    video: this.#executeVideo.bind(this),
    wait: this.#executeWait.bind(this)
  }

  public get sequence() { return this.#sequence; }

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

  async #executeSequence(sequence: TransitionStep[], container: PIXI.Container) {
    for (const step of sequence) {
      // Execute step

      if (typeof this.#typeHandlers[step.type] !== "function") throw new InvalidTransitionError(step.type);
      const handler = this.#typeHandlers[step.type];
      if (typeof handler === "function") await handler(step, container);
    }
  }

  public async execute(remote: boolean = false, sequence?: TransitionStep[], caller?: string) {
    if (!this.#scene) throw new InvalidSceneError(typeof undefined);
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

      await this.#executeSequence(sequence, container);

      for (const sound of this.#sounds) sound.stop();
      cleanupTransition(container);

    }
  }


  async #executeLinearWipe(config: LinearWipeConfiguration, container: PIXI.Container) {

    const background = deserializeTexture(config.background ?? createColorTexture("transparent"));

    const wipe = new LinearWipeFilter(config.direction, background.baseTexture);

    if (Array.isArray(container.filters)) container.filters.push(wipe);
    else container.filters = [wipe];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await TweenMax.to(wipe.uniforms, { progress: 1, duration: config.duration / 1000, ease: config.easing || this.#defaultEasing });

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



  async #executeBilinearWipe(config: BilinearWipeConfiguration, container: PIXI.Container) {
    const background = deserializeTexture(config.background);
    const filter = new BilinearWipeFilter(config.direction, config.radial, background.baseTexture);
    if (Array.isArray(container.filters)) container.filters.push(filter);
    else container.filters = [filter];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await TweenMax.to(filter.uniforms, { progress: 1, duration: config.duration / 1000, ease: config.easing || this.#defaultEasing });
  }

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


  async #executeRadialWipe(config: RadialWipeConfiguration, container: PIXI.Container) {
    const background = deserializeTexture(config.background);
    const filter = new RadialWipeFilter(config.radial, background.baseTexture);
    if (Array.isArray(container.filters)) container.filters.push(filter);
    else container.filters = [filter];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await TweenMax.to(filter.uniforms, { progress: 1, duration: config.duration / 1000, ease: config.easing || this.#defaultEasing });

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


  async #executeDiamondWipe(config: DiamondTransitionConfiguration, container: PIXI.Container) {
    const background = deserializeTexture(config.background);
    const filter = new DiamondTransitionFilter(config.size, background.baseTexture);
    if (Array.isArray(container.filters)) container.filters.push(filter);
    else container.filters = [filter];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await TweenMax.to(filter.uniforms, { progress: 1, duration: config.duration / 1000, ease: config.easing || this.#defaultEasing });
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


  async #executeFade(config: FadeConfiguration, container: PIXI.Container) {
    const bg = deserializeTexture(config.background);
    const filter = new FadeTransitionFilter(bg.baseTexture);
    if (Array.isArray(container.filters)) container.filters.push(filter);
    else container.filters = [filter];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await TweenMax.to(filter.uniforms, { progress: 1, duration: config.duration / 1000, ease: config.easing || this.#defaultEasing });

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

  async #executeBurn(config: FireDissolveConfiguration, container: PIXI.Container) {
    const filter = new FireDissolveFilter(config.background, config.burnSize);
    if (Array.isArray(container.filters)) container.filters.push(filter);
    else container.filters = [filter];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await TweenMax.to(filter.uniforms, { integrity: 0, duration: config.duration / 1000, ease: config.easing || this.#defaultEasing });
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



  async #executeClockWipe(config: ClockWipeConfiguration, container: PIXI.Container) {
    const background = deserializeTexture(config.background);
    const filter = new ClockWipeFilter(config.clockdirection, config.direction, background.baseTexture);

    if (Array.isArray(container.filters)) container.filters.push(filter);
    else container.filters = [filter];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await TweenMax.to(filter.uniforms, { progress: 1, duration: config.duration / 1000, ease: config.easing || this.#defaultEasing });

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


  async #executeSpotlightWipe(config: SpotlightWipeConfiguration, container: PIXI.Container) {
    const background = deserializeTexture(config.background);
    const filter = new SpotlightWipeFilter(config.direction, config.radial, background.baseTexture);
    if (Array.isArray(container.filters)) container.filters.push(filter);
    else container.filters = [filter];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await TweenMax.to(filter.uniforms, { progress: 1, duration: config.duration / 1000, ease: config.easing || this.#defaultEasing });
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

  async #executeTextureSwap(config: TextureSwapConfiguration, container: PIXI.Container) {
    const texture = deserializeTexture(config.texture);
    const filter = new TextureSwapFilter(texture.baseTexture);
    if (Array.isArray(container.filters)) container.filters.push(filter);
    else container.filters = [filter];
    return Promise.resolve();
  }

  public textureSwap(texture: PIXI.ColorSource | PIXI.TextureSource): this {
    new TextureSwapFilter(texture);
    this.#sequence.push({
      type: "textureswap",
      texture: serializeTexture(texture)
    })
    return this;
  }

  async #executeWait(config: WaitConfiguration) {
    return new Promise(resolve => { setTimeout(resolve, config.duration) });
  }

  public wait(duration: number): this {
    this.#sequence.push({
      type: "wait",
      duration
    });
    return this;
  }

  async #executeSound(config: SoundConfiguration) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await foundry.audio.AudioHelper.preloadSound(config.file);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const sound = await foundry.audio.AudioHelper.play({ src: config.file, volume: config.volume / 100, autoplay: true }, true) as Sound;
    this.#sounds.push(sound);

    return Promise.resolve();
  }

  public sound(sound: Sound | string, volume: number = 100): this {
    this.#sequence.push({
      type: "sound",
      file: typeof sound === "string" ? sound : sound.src,
      volume
    });

    return this;
  }

  async #executeVideo(config: VideoConfiguration, container: PIXI.Container) {
    const texture: PIXI.Texture = await PIXI.Assets.load(config.file);
    const resource: PIXI.VideoResource = texture.baseTexture.resource as PIXI.VideoResource;
    const source = resource.source;


    return new Promise<void>((resolve, reject) => {
      const swapFilter = new TextureSwapFilter(texture.baseTexture);

      const sprite = PIXI.Sprite.from(texture);

      container.addChild(sprite);
      sprite.filters = [swapFilter];

      source.addEventListener("ended", () => { resolve(); });
      source.addEventListener("error", e => { reject(e.error as Error); });

      void source.play();

    })

  }

  public video(file: string, volume: number, background: PIXI.TextureSource | PIXI.ColorSource = "transparent"): this {

    this.#sequence.push({
      type: "video",
      file,
      volume,
      background: serializeTexture(background)
    });

    return this;
  }


  async #executeMacro(config: { macro: string }) {
    const macro = coerceMacro(config.macro);
    if (!macro) throw new InvalidMacroError(config.macro);

    const res = macro.execute();
    if (res instanceof Promise) await res;
    else return Promise.resolve();
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

  async #executeParallel(config: ParallelConfiguration, container: PIXI.Container) {
    await Promise.all(config.sequences.map(sequence => this.#executeSequence(sequence, container)));
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

  async #executeRemoveOverlay() {
    if (this.#transitionOverlay) this.#transitionOverlay.alpha = 0;
    return Promise.resolve();
  }

  public removeOverlay(): this {
    this.#sequence.push({
      type: "removeoverlay"
    });
    return this;
  }

  static TriggerForScene(id: string): void
  static TriggerForScene(name: string): void
  static TriggerForScene(uuid: string): void
  static TriggerForScene(scene: Scene): void
  static TriggerForScene(arg: unknown): void {
    const scene = coerceScene(arg);
    if (!scene) throw new InvalidSceneError(typeof arg === "string" ? arg : typeof arg);
    const steps: TransitionStep[] = scene.getFlag(__MODULE_ID__, "steps") ?? [];
    if (!steps.length) return;
    SocketHandler.transition(scene.id ?? "", steps);
  }

  static Cleanup() {
    cleanupTransition();
  }

  static async SelectScene(): Promise<Scene | null> {
    const content = await renderTemplate(`/modules/${__MODULE_ID__}/templates/scene-selector.hbs`, {
      scenes: game.scenes.contents.map(scene => ({ id: scene.id, name: scene.name }))
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
}
