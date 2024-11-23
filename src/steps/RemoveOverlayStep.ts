import { NotImplementedError } from '../errors';
import { PreparedTransitionHash, TransitionSequence } from '../interfaces';
import { parseConfigurationFormElements } from '../utils';
import { TransitionStep } from './TransitionStep';
import { RemoveOverlayConfiguration } from './types';

export class RemoveOverlayStep extends TransitionStep<RemoveOverlayConfiguration> {
  // #region Properties (6)

  public static DefaultSettings: RemoveOverlayConfiguration = {
    id: "",
    type: "removeoverlay",
    version: "1.1.0"
  };
  public static hidden: boolean = false;
  public static key = "removeoverlay";
  public static name = "REMOVEOVERLAY";
  public static skipConfig = true;
  public static template = "";
  public static icon = "<i class='bt-icon remove-overlay fa-fw fas'></i>"
  public static category = "technical";

  // #endregion Properties (6)

  // #region Public Static Methods (6)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static RenderTemplate(config?: RemoveOverlayConfiguration): Promise<string> {
    throw new NotImplementedError();
  }

  public static from(config: RemoveOverlayConfiguration): RemoveOverlayStep
  public static from(form: JQuery<HTMLFormElement>): RemoveOverlayStep
  public static from(form: HTMLFormElement): RemoveOverlayStep
  public static from(arg: unknown): RemoveOverlayStep {
    if (arg instanceof HTMLFormElement) return RemoveOverlayStep.fromFormElement(arg);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    else if (((arg as any)[0]) instanceof HTMLFormElement) return RemoveOverlayStep.fromFormElement((arg as any)[0] as HTMLFormElement);
    else return new RemoveOverlayStep(arg as RemoveOverlayConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): RemoveOverlayStep {
    return new RemoveOverlayStep({
      ...RemoveOverlayStep.DefaultSettings,
      id: foundry.utils.randomID(),
      ...parseConfigurationFormElements($(form) as JQuery<HTMLFormElement>, "id")
    });
  }

  // #endregion Public Static Methods (6)

  // #region Public Methods (1)

  public execute(container: PIXI.Container, sequence: TransitionSequence, prepared: PreparedTransitionHash): Promise<void> | void {
    prepared.overlay.forEach(child => child.alpha = 0);
  }

  // #endregion Public Methods (1)
}