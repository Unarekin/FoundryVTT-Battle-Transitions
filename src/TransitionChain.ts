import { coerceMacro, coerceScene } from "./coercion";
import { CanvasNotFoundError, InvalidMacroError, InvalidSceneError } from "./errors";
import { ScreenSpaceCanvasGroup } from "./ScreenSpaceCanvasGroup";
import { getCanvasGroup } from "./utils";
import { activateScene, cleanupTransition, hideLoadingBar, hideTransitionCover, setupTransition, showLoadingBar } from "./transitionUtils";

export class TransitionChain {

  #sequence: ((container?: PIXI.Container) => Promise<void>)[] = [];
  #containers: PIXI.Container[] = [];

  private get currentContainer() { return this.#containers.length ? this.#containers[this.#containers.length - 1] : undefined; }

  public async execute() {
    for (const step of this.#sequence) {
      await step(this.currentContainer);
    }
    // Clean up
    if (this.currentContainer) cleanupTransition(this.currentContainer);
  }

  public to(name: string): TransitionChain
  public to(id: string): TransitionChain
  public to(uuid: string): TransitionChain
  public to(scene: Scene): TransitionChain
  public to(arg: unknown): TransitionChain {
    const scene = coerceScene(arg);
    if (!(scene instanceof Scene)) throw new InvalidSceneError(typeof arg === "string" ? arg : "[Object object]");

    this.#sequence.push(async outer => {
      const container = await setupTransition(outer);
      this.#containers.push(container);
      hideLoadingBar();
      await activateScene(scene);
      showLoadingBar();
      hideTransitionCover();
      container.destroy();
    });
    return this;
  }

  public wait(time: number): TransitionChain {
    this.#sequence.push(async () => new Promise(resolve => { setTimeout(resolve, time) }));
    return this;
  }

  public call(func: () => Promise<void>): TransitionChain {
    this.#sequence.push(func);
    return this;
  }

  public macro(id: string): TransitionChain
  public macro(name: string): TransitionChain
  public macro(uuid: string): TransitionChain
  public macro(macro: Macro): TransitionChain
  public macro(arg: unknown): TransitionChain {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    const macro = coerceMacro(arg as any);
    if (!(macro instanceof Macro)) throw new InvalidMacroError(typeof arg === "string" ? arg : "[Object object]");
    this.#sequence.push(() => new Promise((resolve, reject) => {
      const res = macro.execute() as unknown;
      if (res instanceof Promise) res.then(() => { resolve(); }).catch(reject);
      else resolve();
    }));
    return this;
  }

  constructor() {
    const canvasGroup = getCanvasGroup();
    if (!(canvasGroup instanceof ScreenSpaceCanvasGroup)) throw new CanvasNotFoundError();
    const container = new PIXI.Container();
    this.#containers.push(container);
  }
}