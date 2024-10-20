import { coerceMacro, coerceScene } from "./coercion";
import { InvalidMacroError, InvalidSceneError } from "./errors";
import { LinearWipeFilter } from "./filters/LinearWipe/LinearWipeFilter";
import { activateScene, cleanupTransition, hideLoadingBar, hideTransitionCover, removeFilter, setupTransition, showLoadingBar } from "./transitionUtils";
import { WipeDirection } from "./types";
import { createColorTexture } from "./utils";


export class TransitionChain {
  #scene: Scene;
  #sequence: ((container: PIXI.Container) => Promise<void>)[] = [];

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
    const wipe = new LinearWipeFilter(direction, bg ?? createColorTexture("transparent").baseTexture);
    this.#sequence.push(async container => {
      if (Array.isArray(container.filters)) container.filters.push(wipe);
      else container.filters = [wipe];

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await TweenMax.to(wipe.uniforms, { progress: 1, duration: duration / 1000 });
      wipe.destroy();
      removeFilter(container, wipe);
      return;
    });
    return this;
  }

  public async execute() {
    const container = await setupTransition();
    hideLoadingBar();
    await activateScene(this.#scene);
    showLoadingBar();
    hideTransitionCover();
    for (const step of this.#sequence) {
      console.log("Step:", step.toString())
      await step(container)
    }

    cleanupTransition(container);
  }


  constructor(id: string)
  constructor(name: string)
  constructor(uuid: string)
  constructor(sccene: Scene)
  constructor(arg: unknown) {
    const scene = coerceScene(arg);
    console.log("Scene:", scene);
    if (!(scene instanceof Scene)) throw new InvalidSceneError(typeof arg === "string" ? arg : "[Object object]");
    this.#scene = scene;
  }
}