import { AngularWipeConfiguration } from './types';
import { TransitionStep } from './TransitionStep';
import { Easing } from '../types';
import { createColorTexture } from '../utils';
import { AngularWipeFilter } from '../filters';

export class AngularWipeStep extends TransitionStep<AngularWipeConfiguration> {
  static name = "ANGULARWIPE";
  public readonly template = "angular-wipe-config";

  public readonly defaultSettings = {
    type: "angularwipe",
    duration: 1000,
    easing: "none" as Easing,
  }

  public async execute(container: PIXI.Container): Promise<void> {
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new AngularWipeFilter(background.baseTexture);
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }


}