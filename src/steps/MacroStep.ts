import { coerceMacro } from "../coercion";
import { InvalidMacroError } from "../errors";
import { TransitionSequence } from "../interfaces";
import { parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { MacroConfiguration } from "./types";

export class MacroStep extends TransitionStep<MacroConfiguration> {
  static name = "MACRO";
  public readonly template = "macro-config";
  static DefaultSettings: MacroConfiguration = {
    type: "macro",
    macro: ""
  }
  // public readonly defaultSettings: Partial<MacroConfiguration> = {};



  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> | void {
    const macro = coerceMacro(this.config.macro);
    if (!(macro instanceof Macro)) throw new InvalidMacroError(typeof this.config.macro === "string" ? this.config.macro : typeof this.config.macro);
    return macro.execute() as void | Promise<void>;
  }

  static from(config: MacroConfiguration): MacroStep
  static from(form: JQuery<HTMLFormElement>): MacroStep
  static from(form: HTMLFormElement): MacroStep
  static from(arg: unkown): MacroStep {
    if (arg instanceof HTMLFormElement) return MacroStep.fromFormElement(arg);
    else if (Array.isArray(arg) && arg[0] instanceof HTMLFormElement) return MacroStep.fromFormElement(arg[0]);

    return new MacroStep(arg as MacroConfiguration);
  }

  static fromFormElement(form: HTMLFormElement): MacroStep {
    const elem = parseConfigurationFormElements($(form) as JQuery<HTMLFormElement>, "id", "macro");
    return new MacroStep({
      ...MacroStep.DefaultSettings,
      ...elem
    });
  }
}