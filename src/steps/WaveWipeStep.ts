import { NotImplementedError } from "../errors";
import { WaveWipeFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { createColorTexture } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { WaveWipeConfiguration } from "./types";

export class WaveWipeStep extends TransitionStep<WaveWipeConfiguration> {
  // #region Properties (5)

  public readonly template = "wavewipe-config";

  public static DefaultSettings: WaveWipeConfiguration = {
    type: "wavewipe",
    duration: 1000,
    easing: "none",
    direction: "inside",
    version: "1.1.0",
    bgSizingMode: "stretch",
    backgroundType: "color",
    backgroundImage: "",
    backgroundColor: "#00000000"
  }

  public static hidden: boolean = false;
  public static key = "wavewipe";
  public static name: string = "WAVEWIPE";

  // #endregion Properties (5)

  // #region Public Static Methods (5)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/require-await
  public static async RenderTemplate(config?: WaveWipeConfiguration): Promise<string> {
    throw new NotImplementedError();
  }

  // @TODO: Implement fromFormElement
  public static from(config: WaveWipeConfiguration): WaveWipeStep
  public static from(form: HTMLFormElement): WaveWipeStep
  public static from(form: JQuery<HTMLFormElement>): WaveWipeStep
  public static from(arg: unknown): WaveWipeStep {
    if (arg instanceof HTMLFormElement) throw new NotImplementedError();
    else if (Array.isArray(arg) && arg[0] instanceof HTMLFormElement) throw new NotImplementedError();
    else return new WaveWipeStep(arg as WaveWipeConfiguration);
  }

  // #endregion Public Static Methods (5)

  // #region Public Methods (1)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    const config: WaveWipeConfiguration = {
      ...WaveWipeStep.DefaultSettings,
      ...this.config
    }
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new WaveWipeFilter(config.direction, background.baseTexture);
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }

  // #endregion Public Methods (1)
}