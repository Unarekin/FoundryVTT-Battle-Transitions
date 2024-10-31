import { WaitConfiguration } from "./types";
import { TransitionStep } from "./TransitionStep";
import { parseConfigurationFormElements } from "../utils";

export class WaitStep extends TransitionStep<WaitConfiguration> {
  // #region Properties (5)

  public static DefaultSettings: WaitConfiguration = {
    type: "wait",
    duration: 0,
    version: "1.1.0"
  }

  public static hidden: boolean = false;
  public static key = "wait";
  public static name = "WAIT";
  public static template = "wait-config";

  // #endregion Properties (5)

  // #region Public Static Methods (6)

  public static async RenderTemplate(config?: WaitConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${WaitStep.template}.hbs`, {
      id: foundry.utils.randomID(),
      ...WaitStep.DefaultSettings,
      ...(config ? config : {})
    });
  }

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

  // #endregion Public Static Methods (6)

  // #region Public Methods (1)

  public execute(): Promise<void> {
    return new Promise<void>(resolve => { setTimeout(resolve, this.config.duration); });
  }

  // #endregion Public Methods (1)
}
