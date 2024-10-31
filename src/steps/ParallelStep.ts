import { BattleTransition } from "../BattleTransition";
import { NotImplementedError } from "../errors";
import { TransitionSequence } from "../interfaces";
import { TransitionStep } from "./TransitionStep";
import { ParallelConfiguration } from "./types";

export class ParallelStep extends TransitionStep<ParallelConfiguration> {
  // #region Properties (3)

  public readonly template = "";

  public static DefaultSettings: ParallelConfiguration = {
    type: "parallel",
    version: "1.1.0",
    sequences: []
  };
  public static name = "PARALLEL";

  // #endregion Properties (3)

  // #region Public Static Methods (4)

  public static from(form: HTMLFormElement): ParallelStep
  public static from(form: JQuery<HTMLFormElement>): ParallelStep
  public static from(config: ParallelConfiguration): ParallelStep
  public static from(arg: unknown): ParallelStep {
    if (arg instanceof HTMLFormElement) throw new NotImplementedError()
    else if (Array.isArray(arg) && arg[0] instanceof HTMLFormElement) throw new NotImplementedError();
    else return new ParallelStep(arg as ParallelConfiguration);
  }

  // #endregion Public Static Methods (4)

  // #region Public Methods (2)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    await new BattleTransition().executeParallelSequence(container, this.config);
  }

  public async prepare(): Promise<void> {
    // Prepare our sub-sequences
    const battleTransition = new BattleTransition();

    for (const sequence of this.config.sequences) {
      sequence.prepared = await battleTransition.prepareSequence(sequence.sequence);
    }
  }

  // #endregion Public Methods (2)
}