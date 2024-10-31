import { NotImplementedError } from '../errors';
import { TransitionSequence } from '../interfaces';
import { parseConfigurationFormElements } from '../utils';
import { TransitionStep } from './TransitionStep';
import { RestoreOverlayConfiguration } from './types';

export class RestoreOverlayStep extends TransitionStep<RestoreOverlayConfiguration> {
  // #region Properties (6)

  public static readonly template = "";

  public static DefaultSettings: RestoreOverlayConfiguration = {
    type: "restoreoverlay",
    version: "1.1.0"
  };
  public static hidden: boolean = false;
  public static key = "restoreoverlay";
  public static name = "RESTOREOVERLAY";
  public static skipConfig = true;

  // #endregion Properties (6)

  // #region Public Static Methods (6)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static RenderTemplate(config?: RestoreOverlayConfiguration): Promise<string> {
    throw new NotImplementedError();
  }

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

  // #endregion Public Static Methods (6)

  // #region Public Methods (1)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public execute(container: PIXI.Container, sequence: TransitionSequence): void {
    container.alpha = 1;
  }

  // #endregion Public Methods (1)
}