import { TransitionSequence } from '../interfaces';
import { parseConfigurationFormElements } from '../utils';
import { TransitionStep } from './TransitionStep';
import { RestoreOverlayConfiguration } from './types';

export class RestoreOverlayStep extends TransitionStep<RestoreOverlayConfiguration> {
  static name = "RESTOREOVERLAY";
  public readonly template = "";
  public readonly skipConfig = true;

  static DefaultSettings: RestoreOverlayConfiguration = { type: "restoreoverlay" };

  static from(config: RestoreOverlayConfiguration): RestoreOverlayStep
  static from(form: JQuery<HTMLFormElement>): RestoreOverlayStep
  static from(form: HTMLFormElement): RestoreOverlayStep
  static from(arg: unknown): RestoreOverlayStep {
    if (arg instanceof HTMLFormElement) return RestoreOverlayStep.fromFormElement(arg);
    else if (Array.isArray(arg) && arg[0] instanceof HTMLFormElement) return RestoreOverlayStep.fromFormElement(arg[0]);
    else return new RestoreOverlayStep(arg as RestoreOverlayConfiguration);
  }

  static fromFormElement(form: HTMLFormElement): RestoreOverlayStep {
    return new RestoreOverlayStep({
      ...RestoreOverlayStep.DefaultSettings,
      ...parseConfigurationFormElements($(form) as JQuery<HTMLFormElement>, "id")
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public execute(container: PIXI.Container, sequence: TransitionSequence): void {
    container.alpha = 1;
  }

}