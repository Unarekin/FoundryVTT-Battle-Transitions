import { InvalidMacroError } from "../errors";
import { TransitionSequence } from "../interfaces";
import { getCompendiumFromUUID, getMacros, log, parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { MacroConfiguration } from "./types";

export class MacroStep extends TransitionStep<MacroConfiguration> {
  // #region Properties (5)

  public static DefaultSettings: MacroConfiguration = {
    type: "macro",
    macro: "",
    version: "1.1.0"
  }

  public static hidden: boolean = false;
  public static key = "macro";
  public static name = "MACRO";
  public static template = "macro-config";

  // #endregion Properties (5)

  // #region Public Static Methods (6)

  public static RenderTemplate(config?: MacroConfiguration): Promise<string> {
    log("Macros:", getMacros().sort(sortMacro).map(formatMacro))
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${MacroStep.template}.hbs`, {
      id: foundry.utils.randomID(),
      ...MacroStep.DefaultSettings,
      ...(config ? config : {}),
      macros: getMacros().sort(sortMacro).map(formatMacro)
    });
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
    const elem = parseConfigurationFormElements($(form) as JQuery<HTMLFormElement>, "id", "macro");
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
    const macro = fromUuidSync(this.config.macro);
    if (!(macro instanceof Macro)) throw new InvalidMacroError(this.config.macro);
    return macro.execute() as void | Promise<void>
    // const macro = coerceMacro(this.config.macro);
    // if (!(macro instanceof Macro)) throw new InvalidMacroError(typeof this.config.macro === "string" ? this.config.macro : typeof this.config.macro);
    // return macro.execute() as void | Promise<void>;
  }

  // #endregion Public Methods (1)
}

type MacroLike = { name: string, uuid: string };

function sortMacro(first: MacroLike, second: MacroLike): number {
  const firstPack = getCompendiumFromUUID(first.uuid);
  const secondPack = getCompendiumFromUUID(second.uuid);

  if (firstPack !== secondPack) return firstPack.localeCompare(secondPack);
  return first.name.localeCompare(second.name);
}

function formatMacro(macro: MacroLike): { name: string, uuid: string, pack: string } {
  const retVal = {
    name: macro.name,
    uuid: macro.uuid,
    pack: ""
  }
  if (game.packs) {
    const parsed = macro.uuid.split(".");
    if (parsed[0] === "Compendium") {
      const packId = parsed.slice(1, 3).join(".");
      const pack = game.packs.get(packId);
      if (pack?.documentName === "Macro")
        retVal.pack = pack.title
    }
  }
  return retVal;
}