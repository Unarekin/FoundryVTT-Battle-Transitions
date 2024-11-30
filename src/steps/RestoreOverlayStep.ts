import { NotImplementedError } from '../errors';
import { PreparedTransitionHash, TransitionSequence } from '../interfaces';
import { parseConfigurationFormElements } from '../utils';
import { TransitionStep } from './TransitionStep';
import { RestoreOverlayConfiguration } from './types';

export class RestoreOverlayStep extends TransitionStep<RestoreOverlayConfiguration> {
  // #region Properties (6)

  public static readonly template = "";

  public static DefaultSettings: RestoreOverlayConfiguration = {
    id: "",
    type: "restoreoverlay",
    version: "1.1.0"
  };
  public static hidden: boolean = false;
  public static key = "restoreoverlay";
  public static name = "SHOWOVERLAY";
  public static skipConfig = true;
  public static icon = "<i class='bt-icon show-overlay fa-fw fas'></i>"
  public static category = "technical";

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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    else if (((arg as any)[0]) instanceof HTMLFormElement) return RestoreOverlayStep.fromFormElement((arg as any)[0] as HTMLFormElement);
    else return new RestoreOverlayStep(arg as RestoreOverlayConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): RestoreOverlayStep {
    return new RestoreOverlayStep({
      ...RestoreOverlayStep.DefaultSettings,
      id: foundry.utils.randomID(),
      ...parseConfigurationFormElements($(form) as JQuery<HTMLFormElement>, "id")
    });
  }

  // #endregion Public Static Methods (6)

  // #region Public Methods (1)

  public execute(container: PIXI.Container, sequence: TransitionSequence, prepared: PreparedTransitionHash): Promise<void> | void {
    prepared.overlay.forEach(child => child.alpha = 1);
  }

  // #endregion Public Methods (1)
}