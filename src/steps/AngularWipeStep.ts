import { AngularWipeConfiguration } from './types';
import { TransitionStep } from './TransitionStep';
import { createColorTexture, parseConfigurationFormElements } from '../utils';
import { AngularWipeFilter } from '../filters';

export class AngularWipeStep extends TransitionStep<AngularWipeConfiguration> {
  static name = "ANGULARWIPE";
  public readonly template = "angular-wipe-config";
  static DefaultSettings: AngularWipeConfiguration = {
    type: "angularwipe",
    duration: 1000,
    easing: "none"
  }

  static from(config: AngularWipeConfiguration): AngularWipeStep
  static from(form: HTMLFormElement): AngularWipeStep
  static from(form: JQuery<HTMLFormElement>): AngularWipeStep
  static from(arg: unknown): AngularWipeStep {
    if (arg instanceof HTMLFormElement) return AngularWipeStep.fromFormElement(arg);
    else if (Array.isArray(arg) && arg[0] instanceof HTMLFormElement) return AngularWipeStep.fromFormElement(arg[0]);
    return new AngularWipeStep(arg as AngularWipeConfiguration);
  }

  static fromFormElement(formElement: HTMLFormElement): AngularWipeStep {
    const backgroundImage = $(formElement).find("#backgroundImage").val() as string ?? "";
    const elem = parseConfigurationFormElements($(formElement) as JQuery<HTMLFormElement>, "id", "duration", "easing", "backgroundType", "backgroundColor");
    return new AngularWipeStep({
      ...AngularWipeStep.DefaultSettings,
      ...elem,
      serializedTexture: backgroundImage
    });
  }


  public async execute(container: PIXI.Container): Promise<void> {
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new AngularWipeFilter(background.baseTexture);
    this.addFilter(container, filter);

    await this.simpleTween(filter);

  }



}
