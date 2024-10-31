import { TransitionSequence } from '../interfaces';
import { parseConfigurationFormElements } from '../utils';
import { TransitionStep } from './TransitionStep';
import { RemoveOverlayConfiguration } from './types';

export class RemoveOverlayStep extends TransitionStep<RemoveOverlayConfiguration> {
  // #region Properties (4)

  public readonly skipConfig = true;
  public readonly template = "";

  public static DefaultSettings: RemoveOverlayConfiguration = {
    type: "removeoverlay",
    version: "1.1.0"
  };
  public static name = "REMOVEOVERLAY";

  // #endregion Properties (4)

  // #region Public Static Methods (5)

  public static from(config: RemoveOverlayConfiguration): RemoveOverlayStep
  public static from(form: JQuery<HTMLFormElement>): RemoveOverlayStep
  public static from(form: HTMLFormElement): RemoveOverlayStep
  public static from(arg: unknown): RemoveOverlayStep {
    if (arg instanceof HTMLFormElement) return RemoveOverlayStep.fromFormElement(arg);
    else if (Array.isArray(arg) && arg[0] instanceof HTMLFormElement) return RemoveOverlayStep.fromFormElement(arg[0]);
    else return new RemoveOverlayStep(arg as RemoveOverlayConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): RemoveOverlayStep {
    return new RemoveOverlayStep({
      ...RemoveOverlayStep.DefaultSettings,
      ...parseConfigurationFormElements($(form) as JQuery<HTMLFormElement>, "id")
    });
  }

  // #endregion Public Static Methods (5)

  // #region Public Methods (1)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public execute(container: PIXI.Container, sequence: TransitionSequence): void {
    container.alpha = 0;
  }

  // #endregion Public Methods (1)
}