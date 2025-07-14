import { BackgroundTransition, TransitionConfiguration } from '../steps';
import { getSortedSteps, getStepClassByKey, localize, renderTemplateFunc, uploadJSON } from '../utils';
import { AddStepDialog } from './AddStepDialog';
import { StepContext } from './types';
import { InvalidTransitionError } from '../errors';
import { BackgroundType } from '../types';
import { editSequence } from './EditSequence';
import { coerceScene, coerceUser } from '../coercion';
import { LOG_ICON } from '../constants';

export async function addStepDialog(): Promise<string | null> {
  return AddStepDialog.prompt();
}



export function getStepsForCategory(category: string, hidden: boolean = false): StepContext[] {
  return getSortedSteps().reduce((prev, curr) => curr.category === category && (hidden ? true : curr.hidden === false) ? [...prev, { key: curr.key, name: `BATTLETRANSITIONS.${curr.name}.NAME`, description: `BATTLETRANSITIONS.${curr.name}.DESCRIPTION`, icon: curr.icon, tooltip: "", hasIcon: !!curr.icon }] : prev, [] as StepContext[]);
}

export async function confirm(title: string, content: string): Promise<boolean> {
  return foundry.applications.api.DialogV2.confirm({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    window: ({ title } as any),
    content
  });
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

  if (!step.skipConfig) {
    const content = await step.RenderTemplate({
      ...deserialized,
      isV1: false
    } as TransitionConfiguration);

    configArea.innerHTML = content;

    step.addEventListeners(configArea, deserialized);
  } else {
    configArea.innerHTML = "";
  }
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

  // Set up tabs for config

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const tabs = new (game?.release?.isNewer("13") ? (foundry.applications as any).ux.Tabs as typeof Tabs : Tabs)({
    contentSelector: ".tab-content",
    navSelector: `.tabs[data-group="config"]`,
    initial: "basics"
  });
  tabs.bind(parent);
}

export function setBackgroundType(parent: HTMLElement, backgroundType: BackgroundType) {
  const bgTypes = parent.querySelectorAll(`[data-background-type]`) as unknown as HTMLElement[];
  for (const elem of bgTypes)
    elem.style.display = elem.dataset.backgroundType === backgroundType ? "block" : "none";
}

export function setEnabledButtons(parent: HTMLElement) {
  // empty
  const sequence = buildTransitionFromForm($(parent));

  const enabledWithSteps = parent.querySelectorAll(`[data-action="exportJson"],[data-action="clearSteps"],[data-action="saveMacro"]`);

  for (const elem of enabledWithSteps) {
    if (sequence.length) {
      if (elem instanceof HTMLButtonElement) elem.disabled = false;
      else elem.classList.remove("disabled")
    } else {
      if (elem instanceof HTMLButtonElement) elem.disabled = true;
      else elem.classList.add("disabled");
    }
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

export function generateMacro(sequence: TransitionConfiguration[], users: string[] = [], scene: unknown = undefined): string {
  const generated = new Intl.DateTimeFormat("default", Object.fromEntries(["year", "month", "day", "hour", "minute", "second"].map(elem => [elem, "numeric"]))).format(new Date());



  const macro = [
    "/**",
    ` * ${LOG_ICON} ${__MODULE_TITLE__} Auto-Generated Macro`,
    ` * Generated: ${generated}`,
    ` * Version: ${__MODULE_VERSION__}`,
    ` * User: ${game?.user?.name ?? typeof undefined}`,
    ' */',
    ``,
    `try {`
  ];

  const actualScene = scene ? coerceScene(scene) : undefined;
  if (!(actualScene instanceof Scene)) {
    macro.push(
      `  const scene = await BattleTransition.SelectScene();`,
      `  if (!(scene instanceof Scene)) return;`
    )
  } else {
    macro.push(`  const scene = "${actualScene.id}";`);
  }

  macro.push("");

  if (Array.isArray(users) && users.length) {
    const actualUsers = users.reduce((prev, curr) => {
      const user = coerceUser(curr);
      if (!(user instanceof User)) return prev;
      return [...prev, user.id ?? ""];
    }, [] as string[]);
    macro.push(`  await new BattleTransition(scene).addSequence(${JSON.stringify(sequence, null, 2)}).execute(${JSON.stringify(actualUsers)})`);
  } else {
    macro.push(`  await new BattleTransition(scene).addSequence(${JSON.stringify(sequence, null, 2)}).execute();`);
  }

  macro.push(
    `} catch (err) {`,
    `  console.error(err);`,
    `  if (err instanceof Error) ui.notifications.error(err.message, { console: false, localize: true });`,
    `}`
  )

  return macro.join("\n");
}

export async function renderSequenceItem(sequence: TransitionConfiguration[], index: number): Promise<HTMLElement> {
  const content = await (renderTemplateFunc())(`modules/${__MODULE_ID__}/templates/config/sequence-item.hbs`, {
    index,
    name: localize("BATTLETRANSITIONS.DIALOGS.SEQUENCE.NAME", { index: index + 1 }),
    serialized: JSON.stringify(sequence)
  });
  const elem = document.createElement("section");
  elem.innerHTML = content;
  return elem;
}

export async function deleteSequenceItem(parent: HTMLElement, index: number): Promise<void> {
  const name = localize("BATTLETRANSITIONS.DIALOGS.SEQUENCE.NAME", { index: index + 1 });
  const confirmed = await confirm(
    localize("BATTLETRANSITIONS.DIALOGS.REMOVECONFIRM.TITLE", { name }),
    localize("BATTLETRANSITIONS.DIALOGS.REMOVECONFIRM.CONTENT", { name })
  );
  if (!confirmed) return;

  const seqElem = parent.querySelector(`[data-role="sequence-item"][data-index="${index}"]`);
  if (seqElem instanceof HTMLElement) seqElem.remove();

  // Trigger form change
  const formElem = parent.querySelector("input");
  if (formElem instanceof HTMLInputElement) formElem.dispatchEvent(new Event("change", { bubbles: true }));
}

export async function editSequenceItem(parent: HTMLElement, index: number): Promise<void> {
  const sequenceElem = parent.querySelector(`[data-role="sequence-item"][data-index="${index.toString()}"]`);

  if (!(sequenceElem instanceof HTMLElement)) return

  const sequence = JSON.parse(sequenceElem.dataset.sequence as string ?? "") as TransitionConfiguration[];

  const edited = await editSequence(sequence);
  if (!edited) return;

  sequenceElem.dataset.sequence = JSON.stringify(edited);
  // Update parent item?
  // if (parent instanceof HTMLFormElement) parent.dispatchEvent(new Event("change"));

}

export function setupSequenceList(parent: HTMLElement, sequence: TransitionConfiguration[]) {
  const stepList = parent.querySelector(`#stepList`);
  if (stepList instanceof HTMLSelectElement) {
    stepList.innerHTML = "";
    for (const step of sequence) {
      const stepClass = getStepClassByKey(step.type);
      if (!stepClass) throw new InvalidTransitionError(step.type);
      const option = createConfigurationOption({
        ...stepClass.DefaultSettings,
        ...step
      });
      option.innerText = localize(`BATTLETRANSITIONS.${stepClass.name}.NAME`);
      stepList.options.add(option);
    }
  }
}


export function iterateElements(parent: HTMLElement, selector: string, func: (elem: HTMLElement) => void) {
  const elements = parent.querySelectorAll(selector);
  for (const element of elements) {
    if (element instanceof HTMLElement) func(element);
  }
}

export function showElements(parent: HTMLElement, selector: string) {
  iterateElements(parent, selector, elem => { elem.style.display = "block"; });
}

export function hideElements(parent: HTMLElement, selector: string) {
  iterateElements(parent, selector, elem => { elem.style.display = "none"; });
}

export function addClassToElements(parent: HTMLElement, selector: string, className: string) {
  iterateElements(parent, selector, elem => { elem.classList.add(className); });
}

export function removeClassFromElements(parent: HTMLElement, selector: string, className: string) {
  iterateElements(parent, selector, elem => { elem.classList.remove(className); });
}

export function enableElements(parent: HTMLElement, selector: string) {
  iterateElements(parent, selector, elem => {
    if (elem instanceof HTMLInputElement) elem.disabled = false;
    else elem.classList.remove("disabled");
  });
}

export function disableElements(parent: HTMLElement, selector: string) {
  iterateElements(parent, selector, elem => {
    if (elem instanceof HTMLInputElement) elem.disabled = true;
    else elem.classList.add("disabled");
  })
}
