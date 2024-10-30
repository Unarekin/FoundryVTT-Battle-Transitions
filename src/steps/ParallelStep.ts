import { BattleTransition } from "../BattleTransition";
import { TransitionSequence } from "../interfaces";
import { TransitionStep } from "./TransitionStep";
import { ParallelConfiguration } from "./types";

export class ParallelStep extends TransitionStep<ParallelConfiguration> {
  static name = "PARALLEL";
  public readonly template = "";
  public readonly defaultSettings: Partial<ParallelConfiguration> = {
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

}