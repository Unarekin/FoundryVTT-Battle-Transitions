import { FireDissolveFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { FireDissolveConfiguration } from "./types";


export class FireDissolveStep extends TransitionStep<FireDissolveConfiguration> {
  static name = "FIREDISSOLVE";
  public readonly template = "fire-dissolve-config";

  static DefaultSettings: FireDissolveConfiguration = {
    type: "firedissolve",
    duration: 1000,
    easing: "none",
    burnSize: 1.3
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    const filter = new FireDissolveFilter(this.config.burnSize);
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }

  static from(config: FireDissolveConfiguration): FireDissolveStep
  static from(form: JQuery<HTMLFormElement>): FireDissolveStep
  static from(form: HTMLFormElement): FireDissolveStep
  static from(arg: unknown): FireDissolveStep {
    if (arg instanceof HTMLFormElement) return FireDissolveStep.fromFormElement(arg);
    if (Array.isArray(arg) && arg[0] instanceof HTMLFormElement) return FireDissolveStep.fromFormElement(arg[0]);
    else return new FireDissolveStep(arg as FireDissolveConfiguration);
  }

  static fromFormElement(form: HTMLFormElement): FireDissolveStep {
    const elem = parseConfigurationFormElements<FireDissolveConfiguration>($(form) as JQuery<HTMLFormElement>, "id", "duration", "easing", "burnSize");
    return new FireDissolveStep({
      ...FireDissolveStep.DefaultSettings,
      ...elem,
    });
  }

}