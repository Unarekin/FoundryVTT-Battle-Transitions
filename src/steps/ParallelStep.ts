import { BattleTransition } from "../BattleTransition";
import { addStepDialog, confirm } from "../dialogs";
import { InvalidTransitionError } from "../errors";
import { PreparedTransitionHash, TransitionSequence } from "../interfaces";
import { sequenceDuration } from "../transitionUtils";
import { formatDuration, getStepClassByKey, localize, parseConfigurationFormElements, renderTemplateFunc } from "../utils";
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
    return renderTemplateFunc(`/modules/${__MODULE_ID__}/templates/config/${ParallelStep.template}.hbs`, {
      ...ParallelStep.DefaultSettings,
      id: foundry.utils.randomID(),
      ...(config ? config : {}),
      oldScene: oldScene?.id ?? "",
      newScene: newScene?.id ?? ""
    });
  }

  public static async addEventListeners(html: JQuery<HTMLElement>, config?: ParallelConfiguration) {
    if (Array.isArray(config?.sequences) && config.sequences.length) {
      for (const sequence of config.sequences)
        await addSequence(html, sequence)
    } else {
      await addSequence(html, []);
      await addSequence(html, []);
    }
    void selectSequence(html, 0);
    html.find(`button[data-action="add-sequence"]`).on("click", e => {
      e.preventDefault();
      addSequence(html, [])
        .then(() => {
          const index = html.find("#sequence-list .sequence-item").length - 1;
          void selectSequence(html, index);
        }).catch((err: Error) => {
          ui.notifications?.error(err.message, { console: false });
          console.error(err);
        })
    });

    html.find("[data-action='add-step']").on("click", e => {
      e.preventDefault();
      void addStep(html);
    });

    // Step sorting
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    (html.find("#selected-sequence-steps") as any).sortable({
      handle: ".drag-handle",
      containment: "parent",
      axis: "y",
      update: () => {
        const index = html.find("#selected-sequence").data("index") as number;
        updateSequenceConfiguration(html, index);
      }
    })
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

async function addSequence(html: JQuery<HTMLElement>, sequence: TransitionConfiguration[] = []) {
  const index = html.find("#sequence-list .sequence-item").length;

  const content = await renderTemplateFunc(`/modules/${__MODULE_ID__}/templates/config/sequence-item.hbs`, {
    index,
    sequence,
    serialized: JSON.stringify(sequence),
    name: localize("BATTLETRANSITIONS.SCENECONFIG.PARALLEL.SEQUENCE", { index: index + 1 })
  })

  const item = $(content);
  html.find("button[data-action='add-sequence']").before(item);
  addSequenceItemEventListeners(item);
}

function addSequenceItemEventListeners(html: JQuery<HTMLElement>) {
  // Cpnfigure button
  html.find("[data-action='configure']").on("click", () => {
    const index = html.data("index") as number;
    void selectSequence(html.parents("[data-transition-type='parallel']"), index);
  });

  // Remove button
  html.find("[data-action='remove']").on("click", e => {
    e.preventDefault();

    const index = html.data("index") as number;

    confirm(
      localize("BATTLETRANSITIONS.DIALOGS.REMOVECONFIRM.TITLE", { name: localize("BATTLETRANSITIONS.SCENECONFIG.PARALLEL.SEQUENCE", { index }) }),
      localize("BATTLETRANSITIONS.DIALOGS.REMOVECONFIRM.CONTENT", { name: localize("BATTLETRANSITIONS.SCENECONFIG.PARALLEL.SEQUENCE", { index }) })
    ).then(val => {
      if (val) {
        const parent = html.parents("#sequence-list");
        html.remove();
        renumberSequences(parent);
      }
    }).catch((err: Error) => {
      ui.notifications?.error(err.message, { console: false });
      console.error(err);
    })
  })
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function addStep(html: JQuery<HTMLElement>) {
  const key = await addStepDialog();
  if (!key) return;

  const step = getStepClassByKey(key);
  if (!step) throw new InvalidTransitionError(key);

  // TODO: Implement add step

  // const oldScene = html.find("#oldScene").val() as string ?? "";
  // const newScene = html.find("#newScene").val() as string ?? "";

  // const config = step.skipConfig ? { ...step.DefaultSettings, id: foundry.utils.randomID() } : await editStepDialog(step.DefaultSettings, game.scenes?.get(oldScene), game.scenes?.get(newScene));
  // if (!config) return;

  // void upsertStepButton(html, config);
}

function addStepEventListeners(html: JQuery<HTMLElement>, button: JQuery<HTMLElement>, config: TransitionConfiguration) {
  // Remove button
  button.find("[data-action='remove']").on("click", () => {
    const step = getStepClassByKey(config.type);
    if (!step) throw new InvalidTransitionError(config.type);
    confirm(
      localize("BATTLETRANSITIONS.DIALOGS.REMOVECONFIRM.TITLE", { name: localize(`BATTLETRANSITIONS.${step.name}.NAME`) }),
      localize("BATTLETRANSITIONS.DIALOGS.REMOVECONFIRM.CONTENT", { name: localize(`BATTLETRANSITIONS.${step.name}.NAME`) })
    )
      .then(confirm => {
        if (confirm) {
          button.remove();
        }
      }).catch(err => {
        ui.notifications?.error((err as Error).message, { console: false });
        console.error(err);
      });
  });

  // Configure button
  button.find("[data-action='configure']").on("click", () => {
    // const oldScene = html.find("#oldScene").val() as string ?? "";
    // const newScene = html.find("#newScene").val() as string ?? "";
    // TODO: Embedded config
    // editStepDialog(config, game.scenes?.get(oldScene), game.scenes?.get(newScene))
    //   .then(newConfig => {
    //     if (newConfig) {
    //       // Replace button
    //       return upsertStepButton(html, newConfig)
    //     }
    //   }).then(() => {
    //   }).catch(err => {
    //     ui.notifications?.error((err as Error).message, { console: false })
    //     console.error(err);
    //   })
  });
}

function buildTransition(html: JQuery<HTMLElement>): TransitionConfiguration[] {
  const sequence: TransitionConfiguration[] = [];

  html.find("#selected-sequence-steps [data-transition-type]").each((index, element) => {
    const flag = element.dataset.flag ?? "";
    if (!flag) return;
    const step = JSON.parse(flag) as TransitionConfiguration;
    sequence.push(step);
  });
  return sequence;
}

function renumberSequences(html: JQuery<HTMLElement>) {
  html.find("[data-sequence]").each((i, elem) => {
    $(elem).data("index", i);
    $(elem).find("[data-action='configure']").text(localize("BATTLETRANSITIONS.SCENECONFIG.PARALLEL.SEQUENCE", { index: i + 1 }));
  })
}

async function selectSequence(html: JQuery<HTMLElement>, index: number) {

  const elem = html.find(`.sequence-item[data-index="${index}"]`);
  const serialized = elem.attr("data-sequence") as string;
  const sequence = JSON.parse(serialized) as TransitionConfiguration[];
  // const sequence = elem.attr("data-sequence") as TransitionConfiguration[];

  const sequenceContainer = html.find("#selected-sequence");

  sequenceContainer.data("index", index);
  sequenceContainer.find("#sequence-name").text(localize(`BATTLETRANSITIONS.SCENECONFIG.PARALLEL.SEQUENCE`, { index: index + 1 }));

  const stepContainer = sequenceContainer.find("#selected-sequence-steps");
  stepContainer.children().remove();

  for (const step of sequence) {
    const stepClass = getStepClassByKey(step.type);
    if (!stepClass) throw new InvalidTransitionError(typeof step.type === "string" ? step.type : typeof step.type);

    await upsertStepButton(html, step)
  }
}

async function upsertStepButton(html: JQuery<HTMLElement>, config: TransitionConfiguration) {
  const step = getStepClassByKey(config.type);
  if (!step) throw new InvalidTransitionError(config.type);


  const outerSequence = [...buildTransition(html), config];
  const durationRes = step.getDuration(config, outerSequence);
  const calculatedDuration = (durationRes instanceof Promise) ? (await durationRes) : durationRes;

  const totalDuration = await sequenceDuration(outerSequence);
  html.find("#total-duration").text(localize("BATTLETRANSITIONS.SCENECONFIG.TOTALDURATION", { duration: formatDuration(totalDuration) }));

  const buttonContent = await renderTemplateFunc(`/modules/${__MODULE_ID__}/templates/config/step-item.hbs`, {
    ...step.DefaultSettings,
    ...config,
    name: localize(`BATTLETRANSITIONS.${step.name}.NAME`),
    description: localize(`BATTLETRANSITIONS.${step.name}.DESCRIPTION`),
    type: step.key,
    calculatedDuration,
    flag: JSON.stringify({
      ...step.DefaultSettings,
      ...config
    })
  });

  const button = $(buttonContent);

  const extant = html.find(`[data-id="${config.id}"]`);
  if (extant.length) extant.replaceWith(button);
  else html.find("#selected-sequence-steps").append(button);

  addStepEventListeners(html, button, config);

  // Update serialized version on parent

  const index = button.parents("[data-index]").data("index") as number;
  updateSequenceConfiguration(html, index);
}

function updateSequenceConfiguration(html: JQuery<HTMLElement>, index: number) {
  const sequence = buildTransition(html);
  html.find(`#sequence-list [data-index="${index}"]`).attr("data-sequence", JSON.stringify(sequence));
}

// #endregion Functions (8)