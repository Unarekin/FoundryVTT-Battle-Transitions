import { cleanupTransition, setupTransition } from "./transitionUtils";
import { SceneStep, ChainableStep } from './steps';
import { coerceScene } from "./coercion";
import { InvalidSceneError } from "./errors";

/**
 * 
 */
export class ChainableTransition {
  #sequence: ChainableStep[] = [];


  public to(name: string): ChainableTransition
  public to(id: string): ChainableTransition
  public to(scene: Scene): ChainableTransition
  public to(arg: unknown): ChainableTransition {
    const scene = coerceScene(arg);
    if (!scene) throw new InvalidSceneError(arg as string);
    this.#sequence.push(new SceneStep(scene));
    return this;
  }


  public async execute() {
    const container = await setupTransition();
    for (const step of this.#sequence) {
      await step.execute(container);
    }
    cleanupTransition(container);
    this.#sequence = [];
  }
}