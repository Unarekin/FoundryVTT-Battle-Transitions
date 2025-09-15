import { ParallelConfigApplication } from "../applications";
import { BattleTransition } from "../BattleTransition";
import { PreparedTransitionHash, TransitionSequence } from "../interfaces";
import { sequenceDuration } from "../transitionUtils";
import { localize, parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { ParallelConfiguration, TransitionConfiguration } from './types';

// #region Classes (1)

export class ParallelStep extends TransitionStep<ParallelConfiguration> {
  // #region Properties (8)

  #preparedSequences: TransitionStep[][] = [];

  public static DefaultSettings: ParallelConfiguration = Object.freeze({
    id: "",
    type: "parallel",
    version: "1.1.0",
    sequences: []
  });

  public static category = "technical";
  public static hidden: boolean = false;
  public static icon = `<i class="fas fa-fw fa-arrows-down-to-line"></i>`
  public static key = "parallel";
  public static name = "PARALLEL";
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public static ConfigurationApplication = ParallelConfigApplication as any;
  public get preparedSequences() { return this.#preparedSequences; }

  // #endregion Properties (8)

  // #region Public Static Methods (6)

  public static getListDescription(config?: ParallelConfiguration): string {
    if (config) {
      return localize("BATTLETRANSITIONS.PARALLEL.LABEL", { count: config.sequences.length })
    } else {
      return ""
    }
  }

  public static from(form: HTMLFormElement): ParallelStep
  public static from(form: JQuery<HTMLFormElement>): ParallelStep
  public static from(config: ParallelConfiguration): ParallelStep
  public static from(arg: unknown): ParallelStep {
    if (arg instanceof HTMLFormElement) return ParallelStep.fromFormElement(arg);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    else if (((arg as any)[0]) instanceof HTMLFormElement) return ParallelStep.fromFormElement((arg as any)[0] as HTMLFormElement);
    else return new ParallelStep(arg as ParallelConfiguration);
  }

  public static async getDuration(config: ParallelConfiguration): Promise<number> {
    let highest: number = 0;
    for (const sequence of config.sequences) {
      const duration = await sequenceDuration(sequence);
      if (duration > highest) highest = duration;
    }
    return highest;
  }

  public static fromFormElement(form: HTMLFormElement): ParallelStep {
    const sequences: TransitionConfiguration[][] = [];

    const elem = $(form) as JQuery<HTMLFormElement>;
    elem.find(".sequence-item").each((i, item) => {
      if (!item.dataset.sequence) return;

      const sequence = JSON.parse(item.dataset.sequence) as TransitionConfiguration[];
      sequences.push(sequence);
    });

    const config: ParallelConfiguration = {
      ...ParallelStep.DefaultSettings,
      ...parseConfigurationFormElements(elem, "id", "label"),
      sequences
    };

    return new ParallelStep(config);
  }

  // #endregion Public Static Methods (6)

  // #region Public Methods (2)

  public async execute(container: PIXI.Container, sequence: TransitionSequence, prepared: PreparedTransitionHash): Promise<void> {
    await Promise.all(this.#preparedSequences.map(seq => this.executeSequence(container, sequence, seq, prepared)));
  }

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
      this.#preparedSequences.push(prepared);
    }
  }

  // #endregion Public Methods (2)

  // #region Private Methods (1)

  public async teardown(container: PIXI.Container): Promise<void> {
    for (const sequence of this.#preparedSequences) {
      for (const step of sequence) {
        await step.teardown(container);
      }
    }
  }

  private async executeSequence(container: PIXI.Container, sequence: TransitionSequence, steps: TransitionStep[], prepared: PreparedTransitionHash): Promise<void> {
    for (const step of steps) {
      const res = step.execute(container, sequence, prepared);
      if (res instanceof Promise) await res;
    }
  }

  // #endregion Private Methods (1)
}
