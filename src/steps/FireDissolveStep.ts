import { FireDissolveFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { TransitionStep } from "./TransitionStep";
import { FireDissolveConfiguration } from "./types";


export class FireDissolveStep extends TransitionStep<FireDissolveConfiguration> {
  static name = "FIREDISSOLVE";
  public readonly template = "fire-dissolve-config";
  public readonly defaultSettings: Partial<FireDissolveConfiguration> = {
    burnSize: 1.3,
    duration: 1000,
    easing: "none"
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    const filter = new FireDissolveFilter(this.config.burnSize);
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }
}