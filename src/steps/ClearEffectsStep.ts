import { PreparedTransitionHash, TransitionSequence } from '../interfaces';
import { TransitionStep } from './TransitionStep';
import { ClearEffectsConfiguration } from './types';

export class ClearEffectsStep extends TransitionStep<ClearEffectsConfiguration> {
  public static DefaultSettings: ClearEffectsConfiguration = {
    id: "",
    type: "cleareffects",
    version: "1.1.0",
  }

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

  public execute(container: PIXI.Container, sequence: TransitionSequence, prepared: PreparedTransitionHash): void {
    const nonOverlayChildren = container.children.filter(child => !prepared.overlay.includes(child));

    for (const child of nonOverlayChildren) child.destroy();
    for (const child of container.children) {
      if (Array.isArray(child.filters) && child.filters.length) {
        const filters = [...child.filters];
        child.filters = [];

        for (const filter of filters) filter.destroy();
      }
    }
    if (Array.isArray(container.filters) && container.filters.length) {
      const filters = [...container.filters];
      for (const filter of filters) filter.destroy();
      container.filters = [];
    }
  }
}