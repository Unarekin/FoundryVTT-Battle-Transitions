import { BattleTransition } from "../BattleTransition";
import { addSequence, deleteSequenceItem, editSequenceItem, renderSequenceItem } from "../dialogs";
import { InvalidElementError } from "../errors";
import { PreparedTransitionHash, TransitionSequence } from "../interfaces";
import { sequenceDuration } from "../transitionUtils";
import { parseConfigurationFormElements, renderTemplateFunc } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { ParallelConfiguration, TransitionConfiguration } from './types';

// #region Classes (1)

export class ParallelStep extends TransitionStep<ParallelConfiguration> {
  // #region Properties (8)

  #preparedSequences: TransitionStep[][] = [];

  public static DefaultSettings: ParallelConfiguration = {
    id: "",
    type: "parallel",
    version: "1.1.0",
    sequences: []
  };
  public static category = "technical";
  public static hidden: boolean = false;
  public static icon = `<i class="fas fa-fw fa-arrows-down-to-line"></i>`
  public static key = "parallel";
  public static name = "PARALLEL";
  public static template = "parallel-config";

  public get preparedSequences() { return this.#preparedSequences; }

  // #endregion Properties (8)

  // #region Public Static Methods (6)

  public static RenderTemplate(config?: ParallelConfiguration, oldScene?: Scene, newScene?: Scene): Promise<string> {
    return (renderTemplateFunc())(`modules/${__MODULE_ID__}/templates/config/${ParallelStep.template}.hbs`, {
      ...ParallelStep.DefaultSettings,
      id: foundry.utils.randomID(),
      ...(config ? config : {}),
      oldScene: oldScene?.id ?? "",
      newScene: newScene?.id ?? ""
    });
  }

  public static addEventListeners(html: HTMLElement, config?: ParallelConfiguration) {
    if (config) void addSequenceItems(html, config.sequences);
    addEventListeners(html);
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

// #endregion Classes (1)

// #region Functions (8)

// #endregion Functions (8)


async function addSequenceItems(parent: HTMLElement, sequences: TransitionConfiguration[][]) {
  const container = parent.querySelector(`[data-role="sequence-list"]`);
  if (!(container instanceof HTMLElement)) return;

  container.innerHTML = "";
  let index = 0;
  for (const sequence of sequences) {
    const element = await renderSequenceItem(sequence, index);
    container.appendChild(element);
    addSequenceItemEventListeners(parent, index);
    index++;
  }


  // addEventListeners(parent);
}

function addSequenceItemEventListeners(parent: HTMLElement, index: number) {
  try {
    const element = parent.querySelector(`[data-role="sequence-item"][data-index="${index}"]`);
    if (!(element instanceof HTMLElement)) throw new InvalidElementError();
    const deleteButton = element.querySelectorAll(`[data-action="deleteSequence"]`);

    for (const button of deleteButton)
      button.addEventListener("click", () => { void deleteSequenceItem(parent, index); });

    const editButton = element.querySelectorAll(`[data-action="editSequence"]`);
    for (const button of editButton)
      button.addEventListener("click", () => { void editSequenceItem(parent, index); });
  } catch (err) {
    console.error(err);
    if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
  }
}

function addEventListeners(html: HTMLElement) {
  const addButtons = html.querySelectorAll(`[data-action="addSequence"]`);
  for (const button of addButtons) {
    button.addEventListener("click", () => { void addSequenceItem(html); });
  }
}

async function addSequenceItem(parent: HTMLElement) {
  try {
    const sequence = await addSequence();
    // If it is canceled, or an empty sequence is submitted, bail.
    if (!sequence || !sequence.length) return;


    const container = parent.querySelector(`[data-role="sequence-list"]`);
    if (container instanceof HTMLElement) {
      const count = parent.querySelectorAll(`[data-role="sequence-item"]`).length;
      const elem = await renderSequenceItem(sequence, count);
      container.appendChild(elem);
      addSequenceItemEventListeners(parent, count);
    }
  } catch (err) {
    console.error(err);
    if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
  }
}