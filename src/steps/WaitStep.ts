import { WaitConfiguration } from "./types";
import { TransitionStep } from "./TransitionStep";
import { parseConfigurationFormElements } from "../utils";

export class WaitStep extends TransitionStep<WaitConfiguration> {
  // #region Properties (3)

  public readonly template = "wait-config";

  public static DefaultSettings: WaitConfiguration = {
    type: "wait",
    duration: 0
  }

  public static name = "WAIT";

  // #endregion Properties (3)

  // #region Public Static Methods (5)

  public static from(config: WaitConfiguration): WaitStep
  public static from(form: HTMLFormElement): WaitStep
  public static from(form: JQuery<HTMLFormElement>): WaitStep
  public static from(arg: unknown): WaitStep {
    if (arg instanceof HTMLFormElement) return WaitStep.fromFormElement(arg);
    else if (Array.isArray(arg) && arg[0] instanceof HTMLFormElement) return WaitStep.fromFormElement(arg[0]);
    else return new WaitStep(arg as WaitConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): WaitStep {
    const elem = $(form) as JQuery<HTMLFormElement>;
    return new WaitStep({
      ...WaitStep.DefaultSettings,
      ...parseConfigurationFormElements(elem, "id", "duration")
    });
  }

  // #endregion Public Static Methods (5)

  // #region Public Methods (1)

  public execute(): Promise<void> {
    return new Promise<void>(resolve => { setTimeout(resolve, this.config.duration); });
  }

  // #endregion Public Methods (1)
}
