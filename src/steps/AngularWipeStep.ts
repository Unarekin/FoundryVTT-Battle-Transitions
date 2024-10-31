import { AngularWipeConfiguration } from './types';
import { TransitionStep } from './TransitionStep';
import { createColorTexture, parseConfigurationFormElements } from '../utils';
import { AngularWipeFilter } from '../filters';

export class AngularWipeStep extends TransitionStep<AngularWipeConfiguration> {
  // #region Properties (3)

  public readonly template = "angular-wipe-config";

  public static DefaultSettings: AngularWipeConfiguration = {
    type: "angularwipe",
    duration: 1000,
    easing: "none",
    version: "1.1.0",
    bgSizingMode: "stretch"
  }

  public static name = "ANGULARWIPE";

  // #endregion Properties (3)

  // #region Public Static Methods (5)

  public static from(config: AngularWipeConfiguration): AngularWipeStep
  public static from(form: HTMLFormElement): AngularWipeStep
  public static from(form: JQuery<HTMLFormElement>): AngularWipeStep
  public static from(arg: unknown): AngularWipeStep {
    if (arg instanceof HTMLFormElement) return AngularWipeStep.fromFormElement(arg);
    else if (Array.isArray(arg) && arg[0] instanceof HTMLFormElement) return AngularWipeStep.fromFormElement(arg[0]);
    return new AngularWipeStep(arg as AngularWipeConfiguration);
  }

  public static fromFormElement(formElement: HTMLFormElement): AngularWipeStep {
    const backgroundImage = $(formElement).find("#backgroundImage").val() as string ?? "";
    const elem = parseConfigurationFormElements($(formElement) as JQuery<HTMLFormElement>, "id", "duration", "easing", "backgroundType", "backgroundColor");
    return new AngularWipeStep({
      ...AngularWipeStep.DefaultSettings,
      ...elem,
      serializedTexture: backgroundImage
    });
  }

  // #endregion Public Static Methods (5)

  // #region Public Methods (1)

  public async execute(container: PIXI.Container): Promise<void> {
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new AngularWipeFilter(background.baseTexture);
    this.addFilter(container, filter);

    await this.simpleTween(filter);
  }

  // #endregion Public Methods (1)
}
