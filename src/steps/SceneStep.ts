import { hideLoadingBar, showLoadingBar } from "../transitionUtils";
import { ChainableStep } from "./ChainableStep";

export class SceneStep extends ChainableStep {
  #scene: Scene;

  public async execute(container: PIXI.DisplayObject) {
    hideLoadingBar();
    await this.#scene.activate();
    showLoadingBar();
  }

  constructor(scene: Scene) {
    super();
    this.#scene = scene;
  }
}