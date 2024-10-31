import { TransitionSequence } from '../interfaces';
import { parseConfigurationFormElements } from '../utils';
import { TransitionStep } from './TransitionStep';
import { RemoveOverlayConfiguration } from './types';

export class RemoveOverlayStep extends TransitionStep<RemoveOverlayConfiguration> {
  static name = "REMOVEOVERLAY";
  public readonly template = "";
  public readonly skipConfig = true;

  static DefaultSettings: RemoveOverlayConfiguration = { type: "removeoverlay" };

  static from(config: RemoveOverlayConfiguration): RemoveOverlayStep
  static from(form: JQuery<HTMLFormElement>): RemoveOverlayStep
  static from(form: HTMLFormElement): RemoveOverlayStep
  static from(arg: unknown): RemoveOverlayStep {
    if (arg instanceof HTMLFormElement) return RemoveOverlayStep.fromFormElement(arg);
    else if (Array.isArray(arg) && arg[0] instanceof HTMLFormElement) return RemoveOverlayStep.fromFormElement(arg[0]);
    else return new RemoveOverlayStep(arg as RemoveOverlayConfiguration);
  }

  static fromFormElement(form: HTMLFormElement): RemoveOverlayStep {
    return new RemoveOverlayStep({
      ...RemoveOverlayStep.DefaultSettings,
      ...parseConfigurationFormElements($(form) as JQuery<HTMLFormElement>, "id")
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public execute(container: PIXI.Container, sequence: TransitionSequence): void {
    container.alpha = 0;
  }

}