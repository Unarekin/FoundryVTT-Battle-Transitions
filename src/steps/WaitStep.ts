import { WaitConfiguration } from "./types";
import { TransitionStep } from "./TransitionStep";

export class WaitStep extends TransitionStep<WaitConfiguration> {
  // #region Properties (2)

  static name = "WAIT";

  public readonly defaultSettings = {
    type: "wait",
    duration: 0
  }

  public readonly template = "wait-config";

  // #endregion Properties (2)

  // #region Public Methods (1)

  public execute(): Promise<void> {
    return new Promise<void>(resolve => { setTimeout(resolve, this.config.duration); });
  }

  // #endregion Public Methods (1)
}
