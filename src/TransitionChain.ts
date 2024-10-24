import { coerceScene } from "./coercion";
import { InvalidSceneError, InvalidTransitionError, PermissionDeniedError } from "./errors";
import { BilinearWipeFilter, DiamondTransitionFilter, FadeTransitionFilter, LinearWipeFilter, RadialWipeFilter, FireDissolveFilter, ClockWipeFilter } from "./filters";
import { TransitionStep, LinearWipeConfiguration, BilinearWipeConfiguration, RadialWipeConfiguration, DiamondTransitionConfiguration, FadeConfiguration, FireDissolveConfiguration, ClockWipeConfiguration } from "./interfaces";
import SocketHandler from "./SocketHandler";
import { activateScene, cleanupTransition, hideLoadingBar, hideTransitionCover, setupTransition, showLoadingBar } from "./transitionUtils";
import { BilinearDirection, ClockDirection, RadialDirection, WipeDirection } from './types';
import { awaitHook, createColorTexture, deserializeTexture, serializeTexture } from "./utils";


export class TransitionChain {
  #scene: Scene;
  #sequence: TransitionStep[] = [];
  #sounds: Sound[] = [];

  #typeHandlers: { [x: string]: unknown } = {
    bilinearwipe: this.#executeBilinearWipe.bind(this),
    clockwipe: this.#executeClockWipe.bind(this),
    diamondwipe: this.#executeDiamondWipe.bind(this),
    fade: this.#executeFade.bind(this),
    firedissolve: this.#executeBurn.bind(this),
    linearwipe: this.#executeLinearWipe.bind(this),
    radialwipe: this.#executeRadialWipe.bind(this),    
  }

  constructor(id: string)
  constructor(name: string)
  constructor(uuid: string)
  constructor(scene: Scene)
  constructor(arg: unknown) {
    try {
      const scene = coerceScene(arg);
      if (!scene) throw new InvalidSceneError(typeof arg === "string" ? arg : arg as string);
      this.#scene = scene;
    } catch (err) {
      ui.notifications?.error((err as Error).message);
      throw err;
    }
  }

  public async execute(remote: boolean = false, sequence?: TransitionStep[], caller?: string) {
    if (!remote) {
      if (!this.#scene.canUserModify(game.users?.current as User ?? null, "update")) throw new PermissionDeniedError();
      SocketHandler.transition(this.#scene.id ?? "", sequence ? sequence : this.#sequence);
    } else {
      if (!sequence) throw new InvalidTransitionError(typeof sequence);
      console.log("TransitionChain executing:", sequence, caller);
      const container = await setupTransition();
      hideLoadingBar();

      // If we did not call this function, wait for the scene to activate
      if (caller !== game.users?.current?.id) await awaitHook("canvasReady");
      // If we DID, then activate.
      else if (caller === game.users?.current?.id) await activateScene(this.#scene);

      showLoadingBar();
      hideTransitionCover();

      for (const step of sequence) {
        // Execute step
         
        if (typeof this.#typeHandlers[step.type] !== "function") throw new InvalidTransitionError(step.type);
        const handler = this.#typeHandlers[step.type];
        if (typeof handler === "function") await handler(step, container);
      }

      for (const sound of this.#sounds) sound.stop();
      cleanupTransition(container);

    }
  }

  async #executeLinearWipe(config: LinearWipeConfiguration, container: PIXI.Container) {

    const background = deserializeTexture(config.background ?? createColorTexture("transparent"));

    const wipe = new LinearWipeFilter(config.direction, background.baseTexture);
    
    if (Array.isArray(container.filters)) container.filters.push(wipe);
    else container.filters=[wipe];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await TweenMax.to(wipe.uniforms, { progress: 1, duration: config.duration / 1000 });

  }

  public linearWipe(direction: WipeDirection, duration: number = 1000, bg: PIXI.TextureSource | PIXI.ColorSource = "transparent"): this {
    new LinearWipeFilter(direction, bg);

    const background = serializeTexture(bg);

    this.#sequence.push({
      type: "linearwipe",
      duration,
      direction,
      background
    });
    return this;
  }



  async #executeBilinearWipe(config: BilinearWipeConfiguration, container: PIXI.Container) {
    const background = deserializeTexture(config.background);
    const filter = new BilinearWipeFilter(config.direction, config.radial, background.baseTexture);
    if (Array.isArray(container.filters)) container.filters.push(filter);
    else container.filters = [filter];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await TweenMax.to(filter.uniforms, { progress: 1, duration: config.duration / 1000 });
  }

  public bilinearWipe(direction: BilinearDirection, radial: RadialDirection, duration: number = 1000, bg: PIXI.TextureSource | PIXI.ColorSource = "transparent"): this {
    new BilinearWipeFilter(direction, radial, bg);
    const background = serializeTexture(bg);
    this.#sequence.push({
      type: "bilinearwipe",
      duration,
      direction,
      radial,
      background
    });
    return this;
  }


  async #executeRadialWipe(config: RadialWipeConfiguration, container: PIXI.Container) {
    const background = deserializeTexture(config.background);
    const filter = new RadialWipeFilter(config.radial, background.baseTexture);
    if (Array.isArray(container.filters)) container.filters.push(filter);
    else container.filters = [filter];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await TweenMax.to(filter.uniforms, { progress: 1, duration: config.duration / 1000 });

  }
  
  public radialWipe(direction: RadialDirection, duration: number = 1000, bg: PIXI.TextureSource | PIXI.ColorSource = "transparent"): this {
    new RadialWipeFilter(direction, bg);
    
    this.#sequence.push({
      type: "radialwipe",
      duration,
      radial: direction,
      background: serializeTexture(bg)
    })
    return this;
  }
 

  async #executeDiamondWipe(config: DiamondTransitionConfiguration, container: PIXI.Container) {
    const background = deserializeTexture(config.background);
    const filter = new DiamondTransitionFilter(config.size, background.baseTexture);
    if (Array.isArray(container.filters)) container.filters.push(filter);
    else container.filters = [filter];

          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          await TweenMax.to(filter.uniforms, { progress: 1, duration: config.duration / 1000 });
  }

  public diamondWipe(size: number, duration: number = 1000, bg: PIXI.TextureSource | PIXI.ColorSource = "transparent"): this {
    this.#sequence.push({
      type: "diamondwipe",
      size,
      background: serializeTexture(bg),
      duration
    });
    return this;
  }
  

  async #executeFade(config: FadeConfiguration, container: PIXI.Container) {
    const bg = deserializeTexture(config.background);
    const filter = new FadeTransitionFilter(bg.baseTexture);
    if (Array.isArray(container.filters)) container.filters.push(filter);
    else container.filters = [filter];
    
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await TweenMax.to(filter.uniforms, { progress: 1, duration: config.duration / 1000 });
    
  }

  public fade(duration: number, bg: PIXI.TextureSource | PIXI.ColorSource = "transparent"): this {
    this.#sequence.push({
      type: "fade",
      duration,
      background: serializeTexture(bg)
    });
    return this;
  }

  async #executeBurn(config: FireDissolveConfiguration, container: PIXI.Container) {
    const filter = new FireDissolveFilter(config.background, config.burnSize);
    if (Array.isArray(container.filters)) container.filters.push(filter);
    else container.filters =[filter];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await TweenMax.to(filter.uniforms, { integrity: 0, duration: config.duration / 1000 });
  }

  public burn(duration: number = 1000, background: PIXI.ColorSource | PIXI.TextureSource = "transparent", burnSize: number=1.3): this {
    this.#sequence.push({
      type: "firedissolve",
      background: serializeTexture(background),
      duration,
      burnSize
    });

    return this;
  }

  

  async #executeClockWipe(config: ClockWipeConfiguration, container: PIXI.Container) {
    const background = deserializeTexture(config.background);
    const filter = new ClockWipeFilter(config.clockdirection, config.direction, background.baseTexture);
    
    if (Array.isArray(container.filters)) container.filters.push(filter);
    else container.filters = [filter];
    
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await TweenMax.to(filter.uniforms, { progress: 1, duration: config.duration / 1000 });

  }

  public clockWipe(clockDirection: ClockDirection, direction: WipeDirection, duration: number = 1000, background: PIXI.TextureSource | PIXI.ColorSource = "transparent"): this {

    this.#sequence.push({
      type: "clockwipe",
      duration,
      background: serializeTexture(background),
      direction,
      clockdirection: clockDirection
    });
    
    return this;
  }


}


// export class TransitionChain {
//   #scene: Scene;
//   #sequence: ((container: PIXI.Container) => Promise<void>)[] = [];
//   #sounds: Sound[] = [];

//   public call(func: (container: PIXI.Container) => Promise<void>): this {
//     this.#sequence.push(func);
//     return this;
//   }

//   /**
//    * Executes a {@link Macro}
//    * @param {string} id 
//    */
//   public macro(id: string): this
//   /**
//    * Executes a {@link Macro}
//    * @param {string} name 
//    */
//   public macro(name: string): this
//   /**
//    * Executes a {@link Macro}
//    * @param {string} uuid 
//    */
//   public macro(uuid: string): this
//   /**
//    * Executes a {@link Macro}
//    * @param {Macro} macro {@link Macro}
//    */
//   public macro(macro: Macro): this
//   public macro(arg: unknown): this {
//     // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
//     const macro = coerceMacro(arg as any);
//     if (!macro) throw new InvalidMacroError(typeof arg === "string" ? arg : "[Object object]");
//     this.#sequence.push(async () => {
//       const res = macro.execute() as unknown;
//       if (res instanceof Promise) await res;
//     });
//     return this;
//   }

//   /**
//    * Causes the sequence to wait the specified amount of time before continuing.
//    * @param {number} duration Amount of time to wait, in milliseconds
//    * @returns 
//    */
//   public wait(duration: number): this {
//     this.#sequence.push(() => new Promise(resolve => {
//       setTimeout(resolve, duration);
//     }));

//     return this;
//   }

//   public linearWipe(direction: WipeDirection, duration: number = 2000, bg?: PIXI.TextureSource | PIXI.ColorSource): this {
//     const wipe = new LinearWipeFilter(direction, bg ?? createColorTexture("transparent").baseTexture)
//     this.#sequence.push(async container => {
//       if (Array.isArray(container.filters)) container.filters.push(wipe);
//       else container.filters = [wipe];

//       // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
//       await TweenMax.to(wipe.uniforms, { progress: 1, duration: duration / 1000 });
//       return;
//     });
//     return this;
//   }

//   public bilinearWipe(direction: BilinearDirection, radial: RadialDirection, duration: number = 2000, bg: PIXI.TextureSource | PIXI.ColorSource = "transparent"): this {
//     const filter = new BilinearWipeFilter(direction, radial, bg);
//     this.#sequence.push(async container => {
//       if (Array.isArray(container.filters)) container.filters.push(filter);
//       else container.filters = [filter];

//       // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
//       await TweenMax.to(filter.uniforms, { progress: 1, duration: duration / 1000 });
//       return;
//     })
//     return this;
//   }

//   public async execute(fromSocket: boolean = false) {
//     if (!fromSocket) {
      
//     }


//     const container = await setupTransition();
//     hideLoadingBar();
//     await activateScene(this.#scene);
//     showLoadingBar();
//     hideTransitionCover();
//     for (const step of this.#sequence) {
//       await step(container)
//     }

//     for (const sound of this.#sounds) sound.stop();
//     cleanupTransition(container);
//   }


//   public diamondWipe(size: number, duration: number = 2000, bg: PIXI.TextureSource | PIXI.ColorSource = "transparent"): this {
//     const filter = new DiamondTransitionFilter(size, bg);
//     this.#sequence.push(async container => {
//       if (Array.isArray(container.filters)) container.filters.push(filter);
//       else container.filters = [filter];
//       // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
//       await TweenMax.to(filter.uniforms, { progress: 1, duration: duration / 1000 });
//       return;
//     });
//     return this;
//   }

//   public fade(duration: number, bg: PIXI.TextureSource | PIXI.ColorSource = "transparent"): this {
//     const filter = new FadeTransitionFilter(bg);
//     this.#sequence.push(async container => {
//       if (Array.isArray(container.filters)) container.filters.push(filter);
//       else container.filters = [filter];

//       // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
//       await TweenMax.to(filter.uniforms, { progress: 1, duration: duration / 1000 });
//       return;
//     });
//     return this;
//   }

//   public clockWipe(clockDirection: ClockDirection, direction: WipeDirection, duration: number = 2000, bg: PIXI.TextureSource | PIXI.ColorSource = "transparent"): this {
//     const filter = new ClockWipeFilter(clockDirection, direction, bg);
//     this.#sequence.push(async container => {
//       if (Array.isArray(container.filters)) container.filters.push(filter);
//       else container.filters = [filter];

//       // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
//       await TweenMax.to(filter.uniforms, { progress: 1, duration: duration / 1000 });
//       return;
//     })

//     return this;
//   }

//   public burn(duration: number = 1000, texture: PIXI.TextureSource): this {
//     const filter = new FireDissolveFilter(texture);
//     this.#sequence.push(async container => {
//       if (Array.isArray(container.filters)) container.filters.push(filter);
//       else container.filters = [filter];
//       // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
//       await TweenMax.to(filter.uniforms, { integrity: 0, duration: duration / 1000 });
//     })
//     return this;
//   }

//   public sound(file: string, loop: boolean = false): this {
//     // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
//     (foundry as any).audio.AudioHelper.preloadSound(file);
//     this.#sequence.push(async () => {
//       // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
//       const sound = await (foundry as any).audio.AudioHelper.play({ src: file, volume: 1, autoplay: true, loop }, true) as Sound;
//       this.#sounds.push(sound);
//     });

//     return this;
//   }


//   public video(file: string): this {
//     this.#sequence.push(async container => {

//       const texture: PIXI.Texture = await PIXI.Assets.load(file);
//       const resource: PIXI.VideoResource = texture.baseTexture.resource as PIXI.VideoResource;
//       const source = resource.source;

//       return new Promise<void>((resolve, reject) => {

//         const swapFilter = new TextureSwapFilter(texture.baseTexture);


//         if (Array.isArray(container.filters)) container.filters.push(swapFilter);
//         else container.filters = [swapFilter];

//         source.addEventListener("ended", () => {
//           // swapFilter.destroy();
//           // chromaFilter.destroy();
//           resolve();
//         });

//         source.addEventListener("error", e => {
//           // swapFilter.destroy();
//           // chromaFilter.destroy();
//           reject(e.error as Error);
//         });
//         void source.play();
//       })
//     });

//     return this;
//   }

//   public radial(direction: RadialDirection, duration: number = 1000, bg: PIXI.TextureSource | PIXI.ColorSource = "transparent"): this {
//     const filter = new RadialWipeFilter(direction, bg);
//     this.#sequence.push(async container => {
//       if (Array.isArray(container.filters)) container.filters.push(filter);
//       else container.filters = [filter];

//       // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
//       await TweenMax.to(filter.uniforms, { progress: 1, duration: duration / 1000 });
//     });
//     return this;
//   }

//   public spotlight(direction: WipeDirection, radial: RadialDirection, duration: number = 1000, bg: PIXI.ColorSource | PIXI.TextureSource = "transparent"): this {
//     const filter = new SpotlightWipeFilter(direction, radial, bg);
//     this.#sequence.push(async container => {
//       if (Array.isArray(container.filters)) container.filters.push(filter);
//       else container.filters = [filter];

//       // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
//       await TweenMax.to(filter.uniforms, { progress: 1, duration: duration / 1000 });
//     });
//     return this;
//   }

//   constructor(id: string)
//   constructor(name: string)
//   constructor(uuid: string)
//   constructor(sccene: Scene)
//   constructor(arg: unknown) {
//     try {
//       const scene = coerceScene(arg);
//       if (!(scene instanceof Scene)) throw new InvalidSceneError(typeof arg === "string" ? arg : "[Object object]");
//       if (!scene.canUserModify(game.users?.current as User, "update")) throw new PermissionDeniedError();
//       this.#scene = scene;
//     } catch (err) {
//       ui.notifications?.error((err as Error).message);
//       throw err;
//     }
//   }
// }