import { BattleTransition } from "../BattleTransition";
import { NotImplementedError } from "../errors";
import { TransitionSequence } from "../interfaces";
import { TransitionStep } from "./TransitionStep";
import { ParallelConfiguration } from "./types";

export class ParallelStep extends TransitionStep<ParallelConfiguration> {
  // #region Properties (5)

  public static DefaultSettings: ParallelConfiguration = {
    type: "parallel",
    version: "1.1.0",
    sequences: []
  };
  public static hidden: boolean = true;
  public static key = "parallel";
  public static name = "PARALLEL";
  public static template = "";

  // #endregion Properties (5)

  // #region Public Static Methods (5)

  public static RenderTemplate(config?: ParallelConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${ParallelStep.template}.hbs`, {
      id: foundry.utils.randomID(),
      ...ParallelStep.DefaultSettings,
      ...(config ? config : {})
    });
  }

  public static from(form: HTMLFormElement): ParallelStep
  public static from(form: JQuery<HTMLFormElement>): ParallelStep
  public static from(config: ParallelConfiguration): ParallelStep
  public static from(arg: unknown): ParallelStep {
    if (arg instanceof HTMLFormElement) throw new NotImplementedError()
    else if (Array.isArray(arg) && arg[0] instanceof HTMLFormElement) throw new NotImplementedError();
    else return new ParallelStep(arg as ParallelConfiguration);
  }

  // #endregion Public Static Methods (5)

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