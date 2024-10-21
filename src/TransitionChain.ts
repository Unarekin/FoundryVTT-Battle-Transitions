import { coerceMacro, coerceScene } from "./coercion";
import { InvalidMacroError, InvalidSceneError } from "./errors";
import { LinearWipeFilter, BilinearWipeFilter, DiamondTransitionFilter, FadeTransitionFilter, ClockWipeFilter, FireDissolveFilter, RadialWipeFilter, SpotlightWipeFilter, TextureSwapFilter, ChromaKeyFilter } from "./filters";
import { activateScene, cleanupTransition, hideLoadingBar, hideTransitionCover, setupTransition, showLoadingBar } from "./transitionUtils";
import { BilinearDirection, ClockDirection, RadialDirection, WipeDirection } from "./types";
import { createColorTexture } from "./utils";


export class TransitionChain {
  #scene: Scene;
  #sequence: ((container: PIXI.Container) => Promise<void>)[] = [];
  #sounds: Sound[] = [];

  public call(func: (container: PIXI.Container) => Promise<void>): this {
    this.#sequence.push(func);
    return this;
  }

  /**
   * Executes a {@link Macro}
   * @param {string} id 
   */
  public macro(id: string): this
  /**
   * Executes a {@link Macro}
   * @param {string} name 
   */
  public macro(name: string): this
  /**
   * Executes a {@link Macro}
   * @param {string} uuid 
   */
  public macro(uuid: string): this
  /**
   * Executes a {@link Macro}
   * @param {Macro} macro {@link Macro}
   */
  public macro(macro: Macro): this
  public macro(arg: unknown): this {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    const macro = coerceMacro(arg as any);
    if (!macro) throw new InvalidMacroError(typeof arg === "string" ? arg : "[Object object]");
    this.#sequence.push(async () => {
      const res = macro.execute() as unknown;
      if (res instanceof Promise) await res;
    });
    return this;
  }

  /**
   * Causes the sequence to wait the specified amount of time before continuing.
   * @param {number} duration Amount of time to wait, in milliseconds
   * @returns 
   */
  public wait(duration: number): this {
    this.#sequence.push(() => new Promise(resolve => {
      setTimeout(resolve, duration);
    }));

    return this;
  }

  public linearWipe(direction: WipeDirection, duration: number = 2000, bg?: PIXI.TextureSource | PIXI.ColorSource): this {
    const wipe = new LinearWipeFilter(direction, bg ?? createColorTexture("transparent").baseTexture)
    this.#sequence.push(async container => {
      if (Array.isArray(container.filters)) container.filters.push(wipe);
      else container.filters = [wipe];

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await TweenMax.to(wipe.uniforms, { progress: 1, duration: duration / 1000 });
      return;
    });
    return this;
  }

  public bilinearWipe(direction: BilinearDirection, radial: RadialDirection, duration: number = 2000, bg: PIXI.TextureSource | PIXI.ColorSource = "transparent"): this {
    const filter = new BilinearWipeFilter(direction, radial, bg);
    this.#sequence.push(async container => {
      if (Array.isArray(container.filters)) container.filters.push(filter);
      else container.filters = [filter];

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await TweenMax.to(filter.uniforms, { progress: 1, duration: duration / 1000 });
      return;
    })
    return this;
  }

  public async execute() {
    const container = await setupTransition();
    hideLoadingBar();
    await activateScene(this.#scene);
    showLoadingBar();
    hideTransitionCover();
    for (const step of this.#sequence) {
      await step(container)
    }

    for (const sound of this.#sounds) sound.stop();
    cleanupTransition(container);
  }


  public diamondWipe(size: number, duration: number = 2000, bg: PIXI.TextureSource | PIXI.ColorSource = "transparent"): this {
    const filter = new DiamondTransitionFilter(size, bg);
    this.#sequence.push(async container => {
      if (Array.isArray(container.filters)) container.filters.push(filter);
      else container.filters = [filter];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await TweenMax.to(filter.uniforms, { progress: 1, duration: duration / 1000 });
      return;
    });
    return this;
  }

  public fade(duration: number, bg: PIXI.TextureSource | PIXI.ColorSource = "transparent"): this {
    const filter = new FadeTransitionFilter(bg);
    this.#sequence.push(async container => {
      if (Array.isArray(container.filters)) container.filters.push(filter);
      else container.filters = [filter];

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await TweenMax.to(filter.uniforms, { progress: 1, duration: duration / 1000 });
      return;
    });
    return this;
  }

  public clockWipe(clockDirection: ClockDirection, direction: WipeDirection, duration: number = 2000, bg: PIXI.TextureSource | PIXI.ColorSource = "transparent"): this {
    const filter = new ClockWipeFilter(clockDirection, direction, bg);
    this.#sequence.push(async container => {
      if (Array.isArray(container.filters)) container.filters.push(filter);
      else container.filters = [filter];

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await TweenMax.to(filter.uniforms, { progress: 1, duration: duration / 1000 });
      return;
    })

    return this;
  }

  public burn(duration: number = 1000, texture: PIXI.TextureSource): this {
    const filter = new FireDissolveFilter(texture);
    this.#sequence.push(async container => {
      if (Array.isArray(container.filters)) container.filters.push(filter);
      else container.filters = [filter];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await TweenMax.to(filter.uniforms, { integrity: 0, duration: duration / 1000 });
    })
    return this;
  }

  public sound(file: string, loop: boolean = false): this {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    (foundry as any).audio.AudioHelper.preloadSound(file);
    this.#sequence.push(async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      const sound = await (foundry as any).audio.AudioHelper.play({ src: file, volume: 1, autoplay: true, loop }, true) as Sound;
      this.#sounds.push(sound);
    });

    return this;
  }


  public video(file: string, bg: PIXI.TextureSource | PIXI.ColorSource = "transparent", chroma: PIXI.ColorSource = [0, 177 / 255, 64 / 255]): this {
    this.#sequence.push(async container => {

      const texture: PIXI.Texture = await PIXI.Assets.load(file);
      const resource: PIXI.VideoResource = texture.baseTexture.resource as PIXI.VideoResource;
      const source = resource.source;

      return new Promise<void>((resolve, reject) => {

        const swapFilter = new TextureSwapFilter(texture.baseTexture);
        const chromaFilter = new ChromaKeyFilter(chroma, bg);


        if (Array.isArray(container.filters)) container.filters.push(swapFilter, chromaFilter);
        else container.filters = [swapFilter, chromaFilter];

        source.addEventListener("ended", () => {
          // swapFilter.destroy();
          // chromaFilter.destroy();
          resolve();
        });

        source.addEventListener("error", e => {
          // swapFilter.destroy();
          // chromaFilter.destroy();
          reject(e.error as Error);
        });
        void source.play();
      })
    });

    return this;
  }

  public radial(direction: RadialDirection, duration: number = 1000, bg: PIXI.TextureSource | PIXI.ColorSource = "transparent"): this {
    const filter = new RadialWipeFilter(direction, bg);
    this.#sequence.push(async container => {
      if (Array.isArray(container.filters)) container.filters.push(filter);
      else container.filters = [filter];

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await TweenMax.to(filter.uniforms, { progress: 1, duration: duration / 1000 });
    });
    return this;
  }

  public spotlight(direction: WipeDirection, radial: RadialDirection, duration: number = 1000, bg: PIXI.ColorSource | PIXI.TextureSource = "transparent"): this {
    const filter = new SpotlightWipeFilter(direction, radial, bg);
    this.#sequence.push(async container => {
      if (Array.isArray(container.filters)) container.filters.push(filter);
      else container.filters = [filter];

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await TweenMax.to(filter.uniforms, { progress: 1, duration: duration / 1000 });
    });
    return this;
  }

  constructor(id: string)
  constructor(name: string)
  constructor(uuid: string)
  constructor(sccene: Scene)
  constructor(arg: unknown) {
    const scene = coerceScene(arg);
    if (!(scene instanceof Scene)) throw new InvalidSceneError(typeof arg === "string" ? arg : "[Object object]");
    this.#scene = scene;
  }
}