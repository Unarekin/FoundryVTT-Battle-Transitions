import { NotImplementedError } from "../errors";
import { WaveWipeFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { createColorTexture } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { WaveWipeConfiguration } from "./types";

export class WaveWipeStep extends TransitionStep<WaveWipeConfiguration> {
  static name: string = "WAVEWIPE";
  public readonly template = "wave-wipe-config";

  static DefaultSettings: WaveWipeConfiguration = {
    type: "wavewipe",
    duration: 1000,
    easing: "none",
    direction: "inside"
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new WaveWipeFilter(this.config.direction, background.baseTexture);
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }

  // @TODO: Implement fromFormElement
  static from(config: WaveWipeConfiguration): WaveWipeStep
  static from(form: HTMLFormElement): WaveWipeStep
  static from(form: JQuery<HTMLFormElement>): WaveWipeStep
  static from(arg: unknown): WaveWipeStep {
    if (arg instanceof HTMLFormElement) throw new NotImplementedError();
    else if (Array.isArray(arg) && arg[0] instanceof HTMLFormElement) throw new NotImplementedError();
    else return new WaveWipeStep(arg);
  }


}