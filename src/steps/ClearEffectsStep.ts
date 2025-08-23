import { PreparedTransitionHash, TransitionSequence } from '../interfaces';
import { removeFilterFromScene } from '../transitionUtils';
import { TransitionStep } from './TransitionStep';
import { ClearEffectsConfiguration } from './types';

export class ClearEffectsStep extends TransitionStep<ClearEffectsConfiguration> {
  public static DefaultSettings: ClearEffectsConfiguration = Object.freeze({
    id: "",
    type: "cleareffects",
    version: "1.1.0",
    applyToOverlay: true,
    applyToScene: false
  });

  public static hidden: boolean = false;
  public static key = "cleareffects";
  public static name = "CLEAREFFECTS";
  public static skipConfig = true;
  public static icon = `<i class="fas fa-fw fa-eraser"></i>`;
  public static category = "technical";

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static from(arg: unknown) {
    return new ClearEffectsStep({
      ...ClearEffectsStep.DefaultSettings,
      id: foundry.utils.randomID()
    });
  }

  #sceneFilter: PIXI.Filter | null = null;

  public teardown(): void {
    if (this.#sceneFilter) {
      if (Array.isArray(canvas?.stage?.filters) && canvas.stage.filters.includes(this.#sceneFilter)) canvas.stage.filters.splice(canvas.stage.filters.indexOf(this.#sceneFilter), 1);
      this.#sceneFilter.destroy();
      this.#sceneFilter = null;
    }
  }

  public execute(container: PIXI.Container, sequence: TransitionSequence, prepared: PreparedTransitionHash): void {

    const config: ClearEffectsConfiguration = {
      ...ClearEffectsStep.DefaultSettings,
      ...this.config
    }

    // Apply to overlay
    if (config.applyToOverlay) {
      const overlayChildren = [...prepared.overlay];
      for (const child of overlayChildren) {
        if (Array.isArray(child.filters)) {
          for (const filter of child.filters) {
            if (child.filters.includes(filter)) child.filters.splice(child.filters.indexOf(filter), 1);
            filter.destroy();
          }
        }
      }
    }

    // Apply to scene
    if (config.applyToScene && canvas?.environment) {
      const filters = prepared.prepared.sceneFilters;
      for (const filter of filters) {
        removeFilterFromScene(filter);
      }
    }
  }
}