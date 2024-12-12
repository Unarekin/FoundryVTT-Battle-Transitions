import { BattleTransition } from "../BattleTransition";
import { addStepDialog, editStepDialog, confirm, buildTransitionFromForm } from "../dialogs";
import { InvalidTransitionError, NoPreviousStepError } from "../errors";
import { PreparedTransitionHash, TransitionSequence } from "../interfaces";
import { sequenceDuration } from "../transitionUtils";
import { formatDuration, getStepClassByKey, localize, parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { RepeatConfiguration, TransitionConfiguration, WaitConfiguration } from './types';
import { WaitStep } from "./WaitStep";

// #region Classes (1)

export class RepeatStep extends TransitionStep<RepeatConfiguration> {
  // #region Properties (8)

  #preparedSequence: TransitionStep[] = [];

  public static DefaultSettings: RepeatConfiguration = {
    id: "",
    type: "repeat",
    version: "1.1.0",
    style: "previous",
    delay: 0,
    iterations: 2
  }

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
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${RepeatStep.template}.hbs`, {
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

  public static addEventListeners(elem: HTMLElement | JQuery<HTMLElement>, config?: RepeatConfiguration): void {
    const html = $(elem);
    setStyle(html);

    html.find("#style").on("input", () => {
      setStyle(html);
    });

    html.find("[data-action='add-step']").on("click", e => {
      e.preventDefault();
      void addStep(html);
    });


    html.find("[data-action='clear-steps']").on("click", e => {
      if ($(e.currentTarget).is(":visible")) {
        e.preventDefault();
        void clearButtonhandler(html);
      }
    })
    setClearDisabled(html);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    (html.find("#transition-step-list") as any).sortable({
      handle: ".drag-handle",
      containment: "parent",
      axis: "y"
    });

    // upsert sequence
    void addSequence(html, config?.sequence ?? []);
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

    const sequence = buildTransition(elem);

    return new RepeatStep({
      ...RepeatStep.DefaultSettings,
      id: foundry.utils.randomID(),
      ...parseConfigurationFormElements(elem, "id", "iterations", "style", "delay", "label"),
      sequence
    });
  }

  // #endregion Public Static Methods (7)

  public static async getDuration(config: RepeatConfiguration, sequence: TransitionConfiguration[]): Promise<number> {
    if (config.style === "previous") {
      const index = sequence.findIndex(item => item.id === config.id);
      if (index === -1) throw new InvalidTransitionError(RepeatStep.key);
      else if (index === 0) throw new NoPreviousStepError();

      const prev = sequence[index - 1];
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

    const currentStep = sequence.sequence.findIndex(step => step.id === config.id);
    if (currentStep === -1) throw new InvalidTransitionError(RepeatStep.key);
    const previousStep = sequence.sequence[currentStep - 1];

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

async function addStep(html: JQuery<HTMLElement>) {
  const key = await addStepDialog();
  if (!key) return;

  const step = getStepClassByKey(key);
  if (!step) throw new InvalidTransitionError(key);

  const oldScene = html.find("#oldScene").val() as string ?? "";
  const newScene = html.find("#newScene").val() as string ?? "";

  const config = step.skipConfig ? { ...step.DefaultSettings, id: foundry.utils.randomID() } : await editStepDialog(step.DefaultSettings, game.scenes?.get(oldScene), game.scenes?.get(newScene));
  if (!config) return;

  void upsertStepButton(html, config);
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
    editStepDialog(config)
      .then(newConfig => {
        if (newConfig) {
          // Replace button
          return upsertStepButton(html, newConfig)
        }
      }).then(() => {
      }).catch(err => {
        ui.notifications?.error((err as Error).message, { console: false })
        console.error(err);
      })
  });
}

function buildTransition(html: JQuery<HTMLElement>): TransitionConfiguration[] {
  const sequence: TransitionConfiguration[] = [];

  html.find("#transition-step-list [data-transition-type]").each((index, element) => {
    const flag = element.dataset.flag ?? "";
    if (!flag) return;
    const step = JSON.parse(flag) as TransitionConfiguration;
    sequence.push(step);
  });
  return sequence;
}

function setStyle(html: JQuery<HTMLElement>) {
  const style = html.find("#style").val() as string;

  html.find("[data-repeat-style='previous']").css("display", style === "previous" ? "block" : "none");
  html.find("[data-repeat-style='sequence']").css("display", style === "sequence" ? "block" : "none");
  html.find("#sequenceContainer").css("display", style === "sequence" ? "block" : "none");
}

async function upsertStepButton(html: JQuery<HTMLElement>, config: TransitionConfiguration) {
  const step = getStepClassByKey(config.type);
  if (!step) throw new InvalidTransitionError(config.type);

  const outerSequence = [...buildTransitionFromForm(html), config];
  const durationRes = step.getDuration(config, outerSequence);
  const calculatedDuration = (durationRes instanceof Promise) ? (await durationRes) : durationRes;

  const totalDuration = await sequenceDuration(outerSequence);
  html.find("#total-duration").text(localize("BATTLETRANSITIONS.SCENECONFIG.TOTALDURATION", { duration: formatDuration(totalDuration) }));

  const buttonContent = await renderTemplate(`/modules/${__MODULE_ID__}/templates/config/step-item.hbs`, {
    ...step.DefaultSettings,
    ...config,
    name: localize(`BATTLETRANSITIONS.${step.name}.NAME`),
    description: localize(`BATTLETRANSITIONS.${step.name}.DESCRIPTION`),
    calculatedDuration,
    type: step.key,
    flag: JSON.stringify({
      ...step.DefaultSettings,
      ...config
    })
  });

  const button = $(buttonContent);

  const extant = html.find(`[data-id="${config.id}"]`);
  if (extant.length) extant.replaceWith(button);
  else html.find("#transition-step-list").append(button);

  addStepEventListeners(html, button, config);

  // Update serialized version on parent
  const index = button.parents("[data-index]").data("index") as number;

  const sequence = buildTransition(html);
  html.find(`#sequence-list [data-index="${index}"]`).attr("data-sequence", JSON.stringify(sequence));
  setClearDisabled(html);
}

// #endregion Functions (5)

async function clearButtonhandler(html: JQuery<HTMLElement>) {
  const confirmed = await confirm("BATTLETRANSITIONS.DIALOGS.CLEARSTEPS.TITLE", localize("BATTLETRANSITIONS.DIALOGS.CLEARSTEPS.MESSAGE"));
  if (!confirmed) return;
  html.find("#transition-step-list").children().remove();
  await updateTotalDuration(html);
  setClearDisabled(html);
}

function setClearDisabled(html: JQuery<HTMLElement>) {
  const sequence = buildTransitionFromForm(html);
  if (!sequence.length) html.find("#clear-steps").attr("disabled", "true");
  else html.find("#clear-steps").removeAttr("disabled");
}

async function updateTotalDuration(html: JQuery<HTMLElement>) {
  const sequence = buildTransitionFromForm(html);
  const totalDuration = await sequenceDuration(sequence);
  html.find("#total-duration").text(localize("BATTLETRANSITIONS.SCENECONFIG.TOTALDURATION", { duration: formatDuration(totalDuration) }));
}


async function addSequence(html: JQuery<HTMLElement>, sequence: TransitionConfiguration[]) {
  for (const item of sequence) {
    await upsertStepButton(html, item);
  }
}