import { coerceMacro } from "../coercion";
import { InvalidMacroError } from "../errors";
import { TransitionSequence } from "../interfaces";
import { parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { MacroConfiguration } from "./types";

export class MacroStep extends TransitionStep<MacroConfiguration> {
  // #region Properties (3)

  public readonly template = "macro-config";

  public static DefaultSettings: MacroConfiguration = {
    type: "macro",
    macro: "",
    version: "1.1.0"
  }

  public static name = "MACRO";

  // #endregion Properties (3)

  // #region Public Static Methods (5)

  public static from(config: MacroConfiguration): MacroStep
  public static from(form: JQuery<HTMLFormElement>): MacroStep
  public static from(form: HTMLFormElement): MacroStep
  public static from(arg: unknown): MacroStep {
    if (arg instanceof HTMLFormElement) return MacroStep.fromFormElement(arg);
    else if (Array.isArray(arg) && arg[0] instanceof HTMLFormElement) return MacroStep.fromFormElement(arg[0]);

    return new MacroStep(arg as MacroConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): MacroStep {
    const elem = parseConfigurationFormElements($(form) as JQuery<HTMLFormElement>, "id", "macro");
    return new MacroStep({
      ...MacroStep.DefaultSettings,
      ...elem
    });
  }

  // #endregion Public Static Methods (5)

  // #region Public Methods (1)

  // public readonly defaultSettings: Partial<MacroConfiguration> = {};

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> | void {
    const macro = coerceMacro(this.config.macro);
    if (!(macro instanceof Macro)) throw new InvalidMacroError(typeof this.config.macro === "string" ? this.config.macro : typeof this.config.macro);
    return macro.execute() as void | Promise<void>;
  }

  // #endregion Public Methods (1)
}