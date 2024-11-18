import { BattleTransition } from "../BattleTransition";
import { addStepDialog, editStepDialog, confirm } from "../dialogs";
import { InvalidTransitionError } from "../errors";
import { TransitionSequence } from "../interfaces";
import { getStepClassByKey, localize, parseConfigurationFormElements } from "../utils";
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

  // #endregion Properties (8)

  // #region Public Static Methods (7)

  public static RenderTemplate(config?: RepeatConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${RepeatStep.template}.hbs`, {
      ...RepeatStep.DefaultSettings,
      id: foundry.utils.randomID(),

      ...(config ? config : {}),
      styleSelect: {
        sequence: "BATTLETRANSITIONS.SCENECONFIG.REPEAT.SEQUENCE.LABEL",
        previous: "BATTLETRANSITIONS.SCENECONFIG.REPEAT.PREVIOUS.LABEL"
      }
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static addEventListeners(elem: HTMLElement | JQuery<HTMLElement>, config?: TransitionConfiguration): void {
    const html = $(elem);
    setStyle(html);

    html.find("#style").on("input", () => {
      setStyle(html);
    });

    html.find("[data-action='add-step']").on("click", e => {
      e.preventDefault();
      void addStep(html);
    })
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
      ...parseConfigurationFormElements(elem, "id", "iterations", "style", "delay"),
      id: foundry.utils.randomID(),
      sequence
    })
  }

  // #endregion Public Static Methods (7)

  // #region Public Methods (2)

  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    for (const step of this.#preparedSequence) {
      const res = step.execute(container, sequence);
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

  const config = step.skipConfig ? step.DefaultSettings : await editStepDialog(step.DefaultSettings);
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

  const buttonContent = await renderTemplate(`/modules/${__MODULE_ID__}/templates/config/step-item.hbs`, {
    ...step.DefaultSettings,
    ...config,
    name: localize(`BATTLETRANSITIONS.${step.name}.NAME`),
    description: localize(`BATTLETRANSITIONS.${step.name}.DESCRIPTION`),
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
}

// #endregion Functions (5)
