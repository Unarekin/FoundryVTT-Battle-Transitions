import { coerceMacro } from "../coercion";
import { InvalidMacroError } from "../errors";
import { TransitionSequence } from "../interfaces";
import { TransitionStep } from "./TransitionStep";
import { MacroConfiguration } from "./types";

export class MacroStep extends TransitionStep<MacroConfiguration> {
  public readonly template = "macro-config";
  public readonly defaultSettings: Partial<MacroConfiguration> = {};

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    const macro = coerceMacro(this.config.macro);
    if (!(macro instanceof Macro)) throw new InvalidMacroError(typeof this.config.macro === "string" ? this.config.macro : typeof this.config.macro);
    const res = macro.execute();
    if (res instanceof Promise) await res;
    else return Promise.resolve();
  }
}