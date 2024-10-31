import { InvertFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { InvertConfiguration } from "./types";

export class InvertStep extends TransitionStep<InvertConfiguration> {
  static name = "INVERT";
  public readonly template = "";
  static DefaultSettings: InvertConfiguration = {
    type: "invert"
  }

  public readonly skipConfig = true;

  static from(config: InvertConfiguration): InvertStep
  static from(form: JQuery<HTMLFormElement>): InvertStep
  static from(form: HTMLFormElement): InvertStep
  static from(arg: unknown): InvertStep {
    if (arg instanceof HTMLFormElement) return InvertStep.fromFormElement(arg);
    else if (Array.isArray(arg) && arg[0] instanceof HTMLFormElement) return InvertStep.fromFormElement(arg[0]);
    else return new InvertStep(arg as InvertConfiguration);
  }

  static fromFormElement(form: HTMLFormElement): InvertStep {
    const elem = parseConfigurationFormElements($(form) as JQuery<HTMLFormElement>, "id");
    return new InvertStep({
      ...InvertStep.DefaultSettings,
      ...elem
    })
  }


  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public execute(container: PIXI.Container, sequence: TransitionSequence): void {
    const filter = new InvertFilter();
    this.addFilter(container, filter);
  }
}