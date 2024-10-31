import { BattleTransition } from "../BattleTransition";
import { NotImplementedError } from "../errors";
import { TransitionSequence } from "../interfaces";
import { TransitionStep } from "./TransitionStep";
import { ParallelConfiguration } from "./types";

export class ParallelStep extends TransitionStep<ParallelConfiguration> {
  static name = "PARALLEL";
  public readonly template = "";

  static DefaultSettings: ParallelConfiguration = {
    type: "parallel",
    sequences: []
  };


  public async prepare(): Promise<void> {
    // Prepare our sub-sequences
    const battleTransition = new BattleTransition();

    for (const sequence of this.config.sequences) {
      sequence.prepared = await battleTransition.prepareSequence(sequence.sequence);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    await new BattleTransition().executeParallelSequence(container, this.config);
  }

  static from(config: ParallelConfiguration): ParallelStep {
    if (config instanceof HTMLFormElement) throw new NotImplementedError()
    else if (Array.isArray(config) && config[0] instanceof HTMLFormElement) throw new NotImplementedError();
    else return new ParallelStep(config);
  }

}