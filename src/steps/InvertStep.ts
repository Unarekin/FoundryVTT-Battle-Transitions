import { InvertFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { InvertConfiguration } from "./types";

export class InvertStep extends TransitionStep<InvertConfiguration> {
  // #region Properties (4)

  public readonly skipConfig = true;
  public readonly template = "";

  public static DefaultSettings: InvertConfiguration = {
    type: "invert",
    version: "1.1.0"
  }

  public static name = "INVERT";

  // #endregion Properties (4)

  // #region Public Static Methods (5)

  public static from(config: InvertConfiguration): InvertStep
  public static from(form: JQuery<HTMLFormElement>): InvertStep
  public static from(form: HTMLFormElement): InvertStep
  public static from(arg: unknown): InvertStep {
    if (arg instanceof HTMLFormElement) return InvertStep.fromFormElement(arg);
    else if (Array.isArray(arg) && arg[0] instanceof HTMLFormElement) return InvertStep.fromFormElement(arg[0]);
    else return new InvertStep(arg as InvertConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): InvertStep {
    const elem = parseConfigurationFormElements($(form) as JQuery<HTMLFormElement>, "id");
    return new InvertStep({
      ...InvertStep.DefaultSettings,
      ...elem
    })
  }

  // #endregion Public Static Methods (5)

  // #region Public Methods (1)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public execute(container: PIXI.Container, sequence: TransitionSequence): void {
    const filter = new InvertFilter();
    this.addFilter(container, filter);
  }

  // #endregion Public Methods (1)
}