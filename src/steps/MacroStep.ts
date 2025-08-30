import { MacroConfigApplication } from "../applications";
import { InvalidMacroError } from "../errors";
import { TransitionSequence } from "../interfaces";
import { localize, parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { MacroConfiguration } from "./types";

export class MacroStep extends TransitionStep<MacroConfiguration> {
  // #region Properties (5)

  public static DefaultSettings: MacroConfiguration = Object.freeze({
    id: "",
    type: "macro",
    macro: "",
    version: "1.1.0"
  });

  public static hidden: boolean = false;
  public static key = "macro";
  public static name = "MACRO";
  public static icon = "<i class='bt-icon bt-macro fa-fw fas'></i>"
  public static category = "technical";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public static ConfigurationApplication = MacroConfigApplication as any;

  // #endregion Properties (5)

  // #region Public Static Methods (6)

  static getListDescription(config?: MacroConfiguration): string {
    if (config) {
      const macro = fromUuidSync(config.macro) as Macro;
      return localize("BATTLETRANSITIONS.MACRO.LABEL", { macro: macro?.name ?? typeof undefined });
    } else {
      return "";
    }

  }

  public static from(config: MacroConfiguration): MacroStep
  public static from(form: JQuery<HTMLFormElement>): MacroStep
  public static from(form: HTMLFormElement): MacroStep
  public static from(arg: unknown): MacroStep {
    if (arg instanceof HTMLFormElement) return MacroStep.fromFormElement(arg);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    else if (((arg as any)[0]) instanceof HTMLFormElement) return MacroStep.fromFormElement((arg as any)[0] as HTMLFormElement);

    return new MacroStep(arg as MacroConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): MacroStep {
    const elem = parseConfigurationFormElements($(form) as JQuery<HTMLFormElement>, "id", "macro", "label");
    return new MacroStep({
      ...MacroStep.DefaultSettings,
      ...elem
    });
  }

  // #endregion Public Static Methods (6)

  // #region Public Methods (1)

  // public readonly defaultSettings: Partial<MacroConfiguration> = {};

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> | void {
    const config: MacroConfiguration = {
      ...MacroStep.DefaultSettings,
      ...this.config
    }
    const macro = fromUuidSync(config.macro);
    if (!(macro instanceof Macro)) throw new InvalidMacroError(config.macro);
    return macro.execute() as void | Promise<void>
  }

  // #endregion Public Methods (1)
}
