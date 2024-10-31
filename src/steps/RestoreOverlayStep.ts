import { TransitionSequence } from '../interfaces';
import { parseConfigurationFormElements } from '../utils';
import { TransitionStep } from './TransitionStep';
import { RestoreOverlayConfiguration } from './types';

export class RestoreOverlayStep extends TransitionStep<RestoreOverlayConfiguration> {
  // #region Properties (4)

  public readonly skipConfig = true;
  public readonly template = "";

  public static DefaultSettings: RestoreOverlayConfiguration = {
    type: "restoreoverlay",
    version: "1.1.0"
  };
  public static name = "RESTOREOVERLAY";

  // #endregion Properties (4)

  // #region Public Static Methods (5)

  public static from(config: RestoreOverlayConfiguration): RestoreOverlayStep
  public static from(form: JQuery<HTMLFormElement>): RestoreOverlayStep
  public static from(form: HTMLFormElement): RestoreOverlayStep
  public static from(arg: unknown): RestoreOverlayStep {
    if (arg instanceof HTMLFormElement) return RestoreOverlayStep.fromFormElement(arg);
    else if (Array.isArray(arg) && arg[0] instanceof HTMLFormElement) return RestoreOverlayStep.fromFormElement(arg[0]);
    else return new RestoreOverlayStep(arg as RestoreOverlayConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): RestoreOverlayStep {
    return new RestoreOverlayStep({
      ...RestoreOverlayStep.DefaultSettings,
      ...parseConfigurationFormElements($(form) as JQuery<HTMLFormElement>, "id")
    });
  }

  // #endregion Public Static Methods (5)

  // #region Public Methods (1)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public execute(container: PIXI.Container, sequence: TransitionSequence): void {
    container.alpha = 1;
  }

  // #endregion Public Methods (1)
}