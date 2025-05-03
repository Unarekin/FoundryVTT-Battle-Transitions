import { TransitionConfiguration } from '../steps';
import { getSortedSteps, getStepClassByKey, localize, shouldUseAppV2, uploadJSON } from '../utils';
import { AddStepDialogV1 } from './AddStepDialogV1';
import { AddStepDialogV2 } from './AddStepDialogV2';
import { EditStepDialogV1 } from './EditStepDialogV1';
import { StepContext } from './types';
import { EditStepDialogV2 } from './EditStepDialogV2';
import { InvalidTransitionError } from '../errors';

export async function addStepDialog(): Promise<string | null> {
  if (shouldUseAppV2()) return AddStepDialogV2.prompt();
  else return AddStepDialogV1.prompt();
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