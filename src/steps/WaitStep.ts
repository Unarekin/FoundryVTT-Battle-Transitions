import { WaitConfiguration } from "./types";
import { TransitionStep } from "./TransitionStep";
import { parseConfigurationFormElements, renderTemplateFunc } from "../utils";

const CURRENT_VERSION = "1.1.0";

export class WaitStep extends TransitionStep<WaitConfiguration> {
  // #region Properties (7)

  public static DefaultSettings: WaitConfiguration = {
    id: "",
    type: "wait",
    duration: 0,
    version: CURRENT_VERSION
  }

  public static category = "technical";
  public static hidden: boolean = false;
  public static icon = "<i class='bt-icon bt-wait fa-fw fas'></i>"
  public static key = "wait";
  public static name = "WAIT";
  public static template = "wait-config";

  // #endregion Properties (7)

  // #region Public Static Methods (7)

  public static async RenderTemplate(config?: WaitConfiguration): Promise<string> {
    return (renderTemplateFunc())(`modules/${__MODULE_ID__}/templates/config/${WaitStep.template}.hbs`, {
      ...WaitStep.DefaultSettings,
      id: foundry.utils.randomID(),
      ...(config ? config : {})
    });
  }

  public static from(config: WaitConfiguration): WaitStep
  public static from(form: HTMLFormElement): WaitStep
  public static from(form: JQuery<HTMLFormElement>): WaitStep
  public static from(arg: unknown): WaitStep {
    if (arg instanceof HTMLFormElement) return WaitStep.fromFormElement(arg);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    else if (((arg as any)[0]) instanceof HTMLFormElement) return WaitStep.fromFormElement((arg as any)[0] as HTMLFormElement);
    else return new WaitStep(arg as WaitConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): WaitStep {
    const elem = $(form) as JQuery<HTMLFormElement>;
    return new WaitStep({
      ...WaitStep.DefaultSettings,
      ...parseConfigurationFormElements(elem, "id", "duration", "label")
    });
  }

  public static getDuration(config: WaitConfiguration): number | Promise<number> { return { ...WaitStep.DefaultSettings, ...config }.duration }

  // #endregion Public Static Methods (7)

  // #region Public Methods (1)

  public execute(): Promise<void> {
    const config: WaitConfiguration = {
      ...WaitStep.DefaultSettings,
      ...this.config
    }
    return new Promise<void>(resolve => { setTimeout(resolve, config.duration); });
  }

  // #endregion Public Methods (1)
}
