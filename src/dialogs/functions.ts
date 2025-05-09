import { BackgroundTransition, TransitionConfiguration } from '../steps';
import { getSortedSteps, getStepClassByKey, localize, shouldUseAppV2, uploadJSON } from '../utils';
import { AddStepDialogV2 } from './AddStepDialogV2';
import { EditStepDialogV1 } from './EditStepDialogV1';
import { StepContext } from './types';
import { EditStepDialogV2 } from './EditStepDialogV2';
import { InvalidTransitionError } from '../errors';
import { BackgroundType } from '../types';

export async function addStepDialog(): Promise<string | null> {
  // if (shouldUseAppV2()) return AddStepDialogV2.prompt();
  // else return AddStepDialogV1.prompt();
  return AddStepDialogV2.prompt();
}



export function getStepsForCategory(category: string, hidden: boolean = false): StepContext[] {
  return getSortedSteps().reduce((prev, curr) => curr.category === category && (hidden ? true : curr.hidden === false) ? [...prev, { key: curr.key, name: `BATTLETRANSITIONS.${curr.name}.NAME`, description: `BATTLETRANSITIONS.${curr.name}.DESCRIPTION`, icon: curr.icon, tooltip: "", hasIcon: !!curr.icon }] : prev, [] as StepContext[]);
}

export async function editStepDialog(config: TransitionConfiguration, oldScene?: Scene, newScene?: Scene): Promise<TransitionConfiguration | null> {
  if (shouldUseAppV2()) return EditStepDialogV2.prompt(config, oldScene, newScene);
  else return EditStepDialogV1.prompt(config, oldScene, newScene);
}

export async function confirm(title: string, content: string): Promise<boolean> {
  if (shouldUseAppV2()) {
    return foundry.applications.api.DialogV2.confirm({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      window: ({ title } as any),
      content
    });
  } else {
    return Dialog.confirm({
      title,
      content
    }).then(val => !!val);
  }
}

export function buildTransitionFromForm(html: JQuery<HTMLElement>) {
  const sequence: TransitionConfiguration[] = [];
  html.find(`select#stepList option`)
    .each((index, element) => {
      const serialized = element.dataset.serialized ?? "";
      if (serialized) {
        const step = JSON.parse(serialized) as TransitionConfiguration;
        sequence.push(step);
      }
    });

  return sequence
}

export async function importSequence(parent: HTMLElement): Promise<void> {
  const list = parent.querySelector(`#stepList`);
  if (!(list instanceof HTMLSelectElement)) return;

  const current = buildTransitionFromForm($(parent));
  if (current.length) {
    const confirmation = await confirm("BATTLETRANSITIONS.DIALOGS.IMPORTCONFIRM.TITLE", localize("BATTLETRANSITIONS.DIALOGS.IMPORTCONFIRM.MESSAGE"));
    if (!confirmation) return;
  }

  const sequence = await uploadJSON<TransitionConfiguration[]>();
  if (!sequence) return;

  list.innerHTML = "";

  for (const step of sequence) {
    const stepClass = getStepClassByKey(step.type);
    if (!stepClass) throw new InvalidTransitionError(step.type);
    const config = {
      ...stepClass.DefaultSettings,
      ...step
    };

    const option = createConfigurationOption(config);
    option.innerText = localize(`BATTLETRANSITIONS.${stepClass.name}.NAME`);
    list.appendChild(option);
  }
}



export function createConfigurationOption(config: TransitionConfiguration): HTMLOptionElement {
  const option = document.createElement("option");
  updateConfigurationOption(option, config);
  return option;
}

export function updateConfigurationOption(option: HTMLOptionElement, config: TransitionConfiguration) {
  option.dataset.serialized = JSON.stringify(config);
  option.dataset.type = config.type;
  option.dataset.id = config.id;
  option.value = option.dataset.serialized;
}

export async function customDialog(title: string, content: string, buttons: Record<string, DialogButton>, onRender?: (element: JQuery<HTMLElement>) => void, onClose?: (element: JQuery<HTMLElement>) => void): Promise<JQuery<HTMLElement>> {
  if (shouldUseAppV2()) return customDialogV2(title, content, buttons, onRender, onClose);
  else return customDialogV1(title, content, buttons, onRender, onClose);
}

async function customDialogV1(title: string, content: string, buttons: Record<string, DialogButton>, onRender?: (element: JQuery<HTMLElement>) => void, onClose?: (element: JQuery<HTMLElement>) => void): Promise<JQuery<HTMLElement>> {
  return new Promise<JQuery<HTMLElement>>((resolve) => {
    let CLOSE_HOOK_ID: number = 0;
    const dialog = new Dialog({
      title: localize(title),
      content,
      buttons,
      render(elem: HTMLElement | JQuery<HTMLElement>) {
        if (onRender) onRender($(elem));
      },
      close(elem: HTMLElement | JQuery<HTMLElement>) {
        const jq = $(elem);
        resolve(jq);
        if (onClose) onClose(jq);
        CLOSE_HOOK_ID = Hooks.on("closeDialog", (closed: Dialog) => {
          if (closed.id === dialog.id) {
            Hooks.off("closeDialog", CLOSE_HOOK_ID);
            if (onClose) onClose(jq);
          }
        })
      },
    });
    dialog.render(true);
  })
}

async function customDialogV2(title: string, content: string, buttons: Record<string, DialogButton>, onRender?: (element: JQuery<HTMLElement>) => void, onClose?: (element: JQuery<HTMLElement>) => void): Promise<JQuery<HTMLElement>> {
  return new Promise<JQuery<HTMLElement>>((resolve, reject) => {
    let CLOSE_HOOK_ID: number = 0;
    const dialog = new foundry.applications.api.DialogV2({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      window: ({ title: localize(title) } as any),
      content,
      buttons: Object.entries(buttons).map(([key, value]) => ({
        action: key,
        label: `${value.icon ? `${value.icon} ` : ""}${localize(value.label)}`,
        callback: () => {
          if (value.callback) value.callback($(dialog.element));
          return Promise.resolve();
        }
      }))
    });
    dialog.render(true).then(val => {
      if (onRender) onRender($(val.element));
      const elem = val.element;
      CLOSE_HOOK_ID = Hooks.on("closeDialogV2", (closedDialog: foundry.applications.api.DialogV2) => {
        if (closedDialog.id === dialog.id) {
          Hooks.off("closeDialogV2", CLOSE_HOOK_ID);
          resolve($(elem));

          if (onClose) onClose($(elem));
        }
      })
    }).catch(reject);
  });
}


export async function selectItem(parent: HTMLElement, id: string) {

  const configArea = parent.querySelector(`[data-role="transition-config"]`);
  if (!(configArea instanceof HTMLElement)) return;

  const option = parent.querySelector(`select#stepList option[data-id="${id}"]`);
  if (!(option instanceof HTMLOptionElement)) {
    // Nothing selected
    configArea.innerHTML = "";
    return;
  }

  const serialized = option.dataset.serialized as string;
  if (!serialized) throw new InvalidTransitionError(id);
  const deserialized = JSON.parse(serialized) as TransitionConfiguration;

  const step = getStepClassByKey(deserialized.type);
  if (!step) throw new InvalidTransitionError(deserialized.type);

  const content = await step.RenderTemplate({
    ...deserialized,
    isV1: false
  } as TransitionConfiguration);

  configArea.innerHTML = content;
  setEnabledButtons(parent);
  setBackgroundType(parent, (deserialized as unknown as BackgroundTransition).backgroundType ?? "");
  setTargetConfig(parent);

  setConfigEventListeners(parent);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  ColorPicker.install();
}

function setConfigEventListeners(parent: HTMLElement) {
  const targetType = parent.querySelector(`[name="step.targetType"]`);
  if (targetType instanceof HTMLElement) {
    targetType.addEventListener("change", () => { setTargetConfig(parent); });
  }
}

export function setBackgroundType(parent: HTMLElement, backgroundType: BackgroundType) {
  const bgTypes = parent.querySelectorAll(`[data-background-type]`) as unknown as HTMLElement[];
  for (const elem of bgTypes)
    elem.style.display = elem.dataset.backgroundType === backgroundType ? "block" : "none";
}

export function setEnabledButtons(parent: HTMLElement) {
  // empty
  const sequence = buildTransitionFromForm($(parent));

  const exportButton = parent.querySelector(`[data-action="exportJson"]`);
  if (exportButton instanceof HTMLElement) {
    if (sequence.length) exportButton.classList.remove("disabled");
    else exportButton.classList.add("disabled");
  }

  const clearButton = parent.querySelector(`[data-action="clearSteps"]`);
  if (clearButton instanceof HTMLElement) {
    if (sequence.length) clearButton.classList.remove("disabled");
    else clearButton.classList.add("disabled");
  }

  const deleteButton = parent.querySelector(`[data-action="deleteStep"]`);
  if (deleteButton instanceof HTMLButtonElement) {
    const id = parent.querySelector(`[data-role="transition-config"] input[name="step.id"]`);
    deleteButton.disabled = !id;
  }
}

export async function deleteSelectedStep(parent: HTMLElement) {
  const idElem = parent.querySelector(`[data-role="transition-config"] input[name="step.id"]`);
  if (!(idElem instanceof HTMLInputElement)) return;
  const id = idElem.value;
  const option = parent.querySelector(`#stepList option[data-id="${id}"]`);
  if (!(option instanceof HTMLOptionElement)) throw new InvalidTransitionError(id);
  const serialized = option.dataset.serialized as string;
  const deserialized = JSON.parse(serialized) as TransitionConfiguration;
  const step = getStepClassByKey(deserialized.type);
  if (!step) throw new InvalidTransitionError(deserialized.type);

  const confirmed = await confirm(
    localize("BATTLETRANSITIONS.DIALOGS.REMOVECONFIRM.TITLE", { name: localize(`BATTLETRANSITIONS.${step.name}.NAME`) }),
    localize("BATTLETRANSITIONS.DIALOGS.REMOVECONFIRM.CONTENT", { name: localize(`BATTLETRANSITIONS.${step.name}.NAME`) })
  )
  if (!confirmed) return;

  option.remove();

  const config = parent.querySelector(`[data-role="transition-config"]`);
  if (config instanceof HTMLElement) config.innerHTML = "";
  setEnabledButtons(parent);
}

export function setTargetConfig(html: HTMLElement) {
  const select = html.querySelector(`[name="step.targetType"]`);
  if (!(select instanceof HTMLSelectElement)) return;
  const targetType = select.value;

  const configs = html.querySelectorAll(`[data-target-type]`) as unknown as HTMLElement[];

  for (const elem of configs)
    elem.style.display = elem.dataset.targetType === targetType ? "block" : "none";
}

export async function addStep(html: HTMLElement): Promise<TransitionConfiguration | undefined> {
  const key = await addStepDialog();
  if (!key) return;
  const step = getStepClassByKey(key);
  if (!step) throw new InvalidTransitionError(key);

  // Inject step
  const config = {
    ...step.DefaultSettings,
    id: foundry.utils.randomID()
  };
  const option = createConfigurationOption(config);

  option.innerText = localize(`BATTLETRANSITIONS.${step.name}.NAME`);

  const stepList = html.querySelector(`#stepList`)
  if (stepList instanceof HTMLSelectElement) stepList.options.add(option);
  return config;
}