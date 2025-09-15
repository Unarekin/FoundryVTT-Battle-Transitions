import { RepeatConfigApplication } from "../applications";
import { BattleTransition } from "../BattleTransition";
import { InvalidTransitionError, NoPreviousStepError } from "../errors";
import { PreparedTransitionHash, TransitionSequence } from "../interfaces";
import { sequenceDuration } from "../transitionUtils";
import { getStepClassByKey, localize, parseConfigurationFormElements } from "../utils";
import { getPreviousStep } from "./functions";
import { TransitionStep } from "./TransitionStep";
import { RepeatConfiguration, TransitionConfiguration, WaitConfiguration } from './types';
import { WaitStep } from "./WaitStep";

// #region Classes (1)

export class RepeatStep extends TransitionStep<RepeatConfiguration> {
  // #region Properties (8)

  #preparedSequence: TransitionStep[] = [];

  public static DefaultSettings: RepeatConfiguration = Object.freeze({
    id: "",
    type: "repeat",
    version: "1.1.0",
    style: "previous",
    delay: 0,
    iterations: 2,
    sequence: []
  });

  public static category = "technical";
  public static hidden: boolean = false;
  public static icon = `<i class="fas fa-fw fa-repeat"></i>`
  public static key = "repeat";
  public static name = "REPEAT";
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public static ConfigurationApplication = RepeatConfigApplication as any;

  public get preparedSequence() { return this.#preparedSequence; }

  public async teardown(container: PIXI.Container): Promise<void> {
    for (const step of this.#preparedSequence) {
      await step.teardown(container);
    }
  }

  // #endregion Properties (8)

  // #region Public Static Methods (7)

  public static getListDescription(config?: RepeatConfiguration): string {
    if (config) {
      if (config.style === "previous") return localize("BATTLETRANSITIONS.REPEAT.LABELPREV", { iterations: config.iterations });
      else return localize("BATTLETRANSITIONS.REPEAT.LABELSEQUENCE", { iterations: config.iterations })
    } else {
      return "";
    }
  }




  public static from(config: RepeatConfiguration): RepeatStep
  public static from(form: JQuery<HTMLFormElement>): RepeatStep
  public static from(form: HTMLFormElement): RepeatStep
  public static from(arg: unknown): RepeatStep {
    if (arg instanceof HTMLFormElement) return RepeatStep.fromFormElement(arg);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    else if ((arg as any)[0] instanceof HTMLFormElement) return RepeatStep.fromFormElement((arg as any)[0] as HTMLFormElement);
    else return new RepeatStep(arg as RepeatConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): RepeatStep {
    const elem = $(form) as JQuery<HTMLFormElement>;
    const parsed = parseConfigurationFormElements<RepeatConfiguration>(elem, "id", "iterations", "style", "delay", "label");
    return new RepeatStep({
      ...RepeatStep.DefaultSettings,
      id: foundry.utils.randomID(),
      ...parsed,
      sequence: buildTransition(form)
    });
  }

  // #endregion Public Static Methods (7)

  public static async getDuration(config: RepeatConfiguration, sequence: TransitionConfiguration[]): Promise<number> {
    if (config.style === "previous") {
      const prev = getPreviousStep(config.id, sequence);
      if (!prev) throw new NoPreviousStepError();

      const step = getStepClassByKey(prev.type);
      if (!step) throw new InvalidTransitionError(typeof prev.type === "string" ? prev.type : typeof prev.type);
      const res = step.getDuration(prev, sequence);
      const duration = res instanceof Promise ? await res : res;
      return ((duration + config.delay) * (config.iterations - 1)) + config.delay;
    } else {
      const duration = await sequenceDuration(config.sequence ?? []);
      return duration + (config.delay * config.iterations);
    }
  }


  // #region Public Methods (2)

  public async execute(container: PIXI.Container, sequence: TransitionSequence, prepared: PreparedTransitionHash): Promise<void> {
    for (const step of this.#preparedSequence) {
      const res = step.execute(container, sequence, prepared);
      if (res instanceof Promise) await res;
    }
  }

  public async prepare(sequence: TransitionSequence): Promise<void> {
    const config: RepeatConfiguration = {
      ...RepeatStep.DefaultSettings,
      ...this.config
    };

    if (config.style === "sequence" && !config.sequence?.length) throw new InvalidTransitionError(RepeatStep.key);

    const previousStep = getPreviousStep(config.id, sequence.sequence);

    // const currentStep = sequence.sequence.findIndex(step => step.id === config.id);
    // if (currentStep === -1) throw new InvalidTransitionError(RepeatStep.key);
    // const previousStep = sequence.sequence[currentStep - 1];

    if (!previousStep) throw new InvalidTransitionError(RepeatStep.key);

    const waitConfig: WaitConfiguration = {
      ...WaitStep.DefaultSettings,
      duration: config.delay
    };

    const hydratedSequence: TransitionConfiguration[] = [];
    if (config.delay && config.style === "previous") hydratedSequence.push(waitConfig);

    if (config.style === "previous") {
      for (let i = 0; i < (config.iterations - 1); i++) {
        hydratedSequence.push({
          ...previousStep,
          id: foundry.utils.randomID()
        });
        if (config.delay) hydratedSequence.push(waitConfig);
      }
    } else if (config.style === "sequence") {
      hydratedSequence.push(...config.sequence ?? []);
      if (config.delay) hydratedSequence.push(waitConfig);
    }

    this.#preparedSequence = await BattleTransition.prepareSequence({
      ...sequence,
      sequence: hydratedSequence
    });
  }

  // #endregion Public Methods (2)
}

// #endregion Classes (1)

// #region Functions (5)

function buildTransition(html: HTMLElement): TransitionConfiguration[] {
  const sequenceItem = html.querySelector(`[data-role="sequence-item"]`);
  if (sequenceItem instanceof HTMLElement) return JSON.parse(sequenceItem.dataset.sequence ?? "[]") as TransitionConfiguration[];
  else return [];
}
