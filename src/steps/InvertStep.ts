import { InvertFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { TransitionStep } from "./TransitionStep";
import { InvertConfiguration, TransitionConfiguration } from "./types";

export class InvertStep extends TransitionStep<InvertConfiguration> {
  static name = "INVERT";
  public readonly template = "";
  public readonly defaultSettings: Partial<TransitionConfiguration> = {};
  public readonly skipConfig = true;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    const filter = new InvertFilter();
    this.addFilter(container, filter);
    await Promise.resolve();
  }
}