import { NotImplementedError } from "../errors";
import { InvertFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { InvertConfiguration } from "./types";

export class InvertStep extends TransitionStep<InvertConfiguration> {
  // #region Properties (6)

  public static DefaultSettings: InvertConfiguration = {
    type: "invert",
    version: "1.1.0"
  }

  public static hidden: boolean = false;
  public static key = "invert";
  public static name = "INVERT";
  public static skipConfig = true;
  public static template = "";

  // #endregion Properties (6)

  // #region Public Static Methods (6)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static RenderTemplate(config?: InvertConfiguration): Promise<string> {
    throw new NotImplementedError();
  }

  public static from(config: InvertConfiguration): InvertStep
  public static from(form: JQuery<HTMLFormElement>): InvertStep
  public static from(form: HTMLFormElement): InvertStep
  public static from(arg: unknown): InvertStep {
    if (arg instanceof HTMLFormElement) return InvertStep.fromFormElement(arg);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    else if (((arg as any)[0]) instanceof HTMLFormElement) return InvertStep.fromFormElement((arg as any)[0] as HTMLFormElement);
    else return new InvertStep(arg as InvertConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): InvertStep {
    const elem = parseConfigurationFormElements($(form) as JQuery<HTMLFormElement>, "id");
    return new InvertStep({
      id: foundry.utils.randomID(),
      ...InvertStep.DefaultSettings,
      ...elem
    })
  }

  // #endregion Public Static Methods (6)

  // #region Public Methods (1)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public execute(container: PIXI.Container, sequence: TransitionSequence): void {
    const filter = new InvertFilter();
    this.addFilter(container, filter);
  }

  // #endregion Public Methods (1)
}