import { NotImplementedError } from "../errors";
import { WaveWipeFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { createColorTexture } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { WaveWipeConfiguration } from "./types";

export class WaveWipeStep extends TransitionStep<WaveWipeConfiguration> {
  // #region Properties (3)

  public readonly template = "wave-wipe-config";

  public static DefaultSettings: WaveWipeConfiguration = {
    type: "wavewipe",
    duration: 1000,
    easing: "none",
    direction: "inside",
    version: "1.1.0",
    bgSizingMode: "stretch"
  }

  public static name: string = "WAVEWIPE";

  // #endregion Properties (3)

  // #region Public Static Methods (4)

  // @TODO: Implement fromFormElement
  public static from(config: WaveWipeConfiguration): WaveWipeStep
  public static from(form: HTMLFormElement): WaveWipeStep
  public static from(form: JQuery<HTMLFormElement>): WaveWipeStep
  public static from(arg: unknown): WaveWipeStep {
    if (arg instanceof HTMLFormElement) throw new NotImplementedError();
    else if (Array.isArray(arg) && arg[0] instanceof HTMLFormElement) throw new NotImplementedError();
    else return new WaveWipeStep(arg as WaveWipeConfiguration);
  }

  // #endregion Public Static Methods (4)

  // #region Public Methods (1)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new WaveWipeFilter(this.config.direction, background.baseTexture);
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }

  // #endregion Public Methods (1)
}