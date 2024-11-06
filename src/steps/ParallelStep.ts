import { BattleTransition } from "../BattleTransition";
import { InvalidTransitionError, NotImplementedError } from "../errors";
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    else if (((arg as any)[0]) instanceof HTMLFormElement) throw new NotImplementedError();
    else return new ParallelStep(arg as ParallelConfiguration);
  }

  // #endregion Public Static Methods (5)

  // #region Public Methods (2)


  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    for (const prepared of this.#preparedSequences) {
      for (const step of prepared) {
        const res = step.execute(container, sequence);
        if (res instanceof Promise) await res;
      }
    }
  }

  #preparedSequences: TransitionStep[][] = [];

  public async prepare(sequence: TransitionSequence): Promise<void> {
    const config: ParallelConfiguration = {
      ...ParallelStep.DefaultSettings,
      ...this.config
    };

    if (!(Array.isArray(config.sequences) && config.sequences.length)) throw new InvalidTransitionError(typeof config.sequences);

    this.#preparedSequences = [];
    for (const step of config.sequences) {
      this.#preparedSequences.push(await BattleTransition.prepareSequence({
        ...sequence,
        sequence: step
      }));

    }
  }

  // #endregion Public Methods (2)
}