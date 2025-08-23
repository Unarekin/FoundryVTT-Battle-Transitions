import { BattleTransition } from "../BattleTransition";
import { addSequence, hideElements, iterateElements, renderSequenceItem, showElements } from "../dialogs";
import { InvalidTransitionError, NoPreviousStepError } from "../errors";
import { PreparedTransitionHash, TransitionSequence } from "../interfaces";
import { sequenceDuration } from "../transitionUtils";
import { getStepClassByKey, log, parseConfigurationFormElements, renderTemplateFunc } from "../utils";
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
  public static template = "repeat-config";

  public get preparedSequence() { return this.#preparedSequence; }

  public async teardown(container: PIXI.Container): Promise<void> {
    for (const step of this.#preparedSequence) {
      await step.teardown(container);
    }
  }

  // #endregion Properties (8)

  // #region Public Static Methods (7)

  public static RenderTemplate(config?: RepeatConfiguration, oldScene?: Scene, newScene?: Scene): Promise<string> {
    return (renderTemplateFunc())(`modules/${__MODULE_ID__}/templates/config/${RepeatStep.template}.hbs`, {
      ...RepeatStep.DefaultSettings,
      id: foundry.utils.randomID(),
      ...(config ? config : {}),
      oldScene: oldScene?.id ?? "",
      newScene: newScene?.id ?? "",
      styleSelect: {
        sequence: "BATTLETRANSITIONS.SCENECONFIG.REPEAT.SEQUENCE.LABEL",
        previous: "BATTLETRANSITIONS.SCENECONFIG.REPEAT.PREVIOUS.LABEL"
      }
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static addEventListeners(parent: HTMLElement, config?: RepeatConfiguration): void {
    setStyle(parent);

    const styleSelect = parent.querySelector(`select[name="step.style"]`);
    if (styleSelect instanceof HTMLSelectElement) {
      styleSelect.addEventListener("change", () => { setStyle(parent); });
    }

    iterateElements(parent, `[data-action="addSequence"]`, elem => {
      elem.addEventListener("click", () => { void addSequenceItem(parent); });
    });

    // const html = $(elem);
    // setStyle(html);

    // html.find("#style").on("input", () => {
    //   setStyle(html);
    // });

    // html.find("[data-action='add-step']").on("click", e => {
    //   e.preventDefault();
    //   void addStep(html);
    // });


    // html.find("[data-action='clear-steps']").on("click", e => {
    //   if ($(e.currentTarget).is(":visible")) {
    //     e.preventDefault();
    //     void clearButtonhandler(html);
    //   }
    // })
    // setClearDisabled(html);

    // // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    // (html.find("#transition-step-list") as any).sortable({
    //   handle: ".drag-handle",
    //   containment: "parent",
    //   axis: "y"
    // });

    // // upsert sequence
    // void addSequence(html, config?.sequence ?? []);
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


function setStyle(parent: HTMLElement) {
  const select = parent.querySelector(`select[name="step.style"]`);
  if (select instanceof HTMLSelectElement) {
    if (select.value === "sequence") showElements(parent, `[data-role="sequence-container"]`);
    else hideElements(parent, `[data-role="sequence-container"]`);
  }
}

function addSequenceItemEventListeners(parent: HTMLElement, index: number) {
  try {
    log("Adding sequence item event listeners:", index);
    // const element = parent.querySelector(`[data-role="sequence-item"][data-index="${index}"]`);
    // if (!(element instanceof HTMLElement)) throw new InvalidElementError();
    // const deleteButton = element.querySelectorAll(`[data-action="deleteSequence"]`);

    // for (const button of deleteButton)
    //   button.addEventListener("click", () => { void deleteSequenceItem(parent, index); });

    // const editButton = element.querySelectorAll(`[data-action="editSequence"]`);
    // for (const button of editButton)
    //   button.addEventListener("click", () => { void editSequenceItem(parent, index); });
  } catch (err) {
    console.error(err);
    if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
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