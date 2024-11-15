import { BattleTransition } from "../BattleTransition";
import { NotImplementedError } from "../errors";
import { TransitionSequence } from "../interfaces";
import { log } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { ParallelConfiguration } from "./types";

export class ParallelStep extends TransitionStep<ParallelConfiguration> {
  // #region Properties (5)

  public static DefaultSettings: ParallelConfiguration = {
    type: "parallel",
    version: "1.1.0",
    sequences: []
  };
  public static hidden: boolean = false;
  public static key = "parallel";
  public static name = "PARALLEL";
  public static template = "parallel-config";
  public static category = "technical";
  public static icon = `<i class="fas fa-fw fa-arrows-down-to-line"></i>`

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

  private async executeSequence(container: PIXI.Container, sequence: TransitionSequence, steps: TransitionStep[]): Promise<void> {
    for (const step of steps) {
      const res = step.execute(container, sequence);
      if (res instanceof Promise) await res;
    }
  }


  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    await Promise.all(this.#preparedSequences.map(prepared => this.executeSequence(container, sequence, prepared)));
  }

  #preparedSequences: TransitionStep[][] = [];

  public async prepare(sequence: TransitionSequence): Promise<void> {
    const config: ParallelConfiguration = {
      ...ParallelStep.DefaultSettings,
      ...this.config
    };

    this.#preparedSequences = [];
    for (const step of config.sequences) {
      const prepared = await BattleTransition.prepareSequence({
        ...sequence,
        sequence: step
      });
      log(prepared);
      this.#preparedSequences.push(prepared);
    }
  }

  // #endregion Public Methods (2)
}