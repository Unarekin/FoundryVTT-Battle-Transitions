import { TransitionConfiguration } from "../steps";
import { formDataExtendedClass, getStepClassByKey, localize, renderTemplateFunc } from "../utils";
import { addStep, deleteSelectedStep, selectItem, setEnabledButtons, setupSequenceList } from "./functions";
import { InvalidTransitionError } from "../errors";
import { DeepPartial } from "./types";



export async function addSequence(): Promise<TransitionConfiguration[] | undefined> {
  return sequenceEditDialog([], {
    window: {
      title: localize("BATTLETRANSITIONS.DIALOGS.SEQUENCE.ADD")
    }
  });
}

export async function editSequence(sequence: TransitionConfiguration[]): Promise<TransitionConfiguration[] | undefined> {
  return sequenceEditDialog(sequence, {
    window: {
      title: localize("BATTLETRANSITIONS.DIALOGS.SEQUENCE.EDIT")
    }
  })
}


async function sequenceEditDialog(sequence: TransitionConfiguration[], options?: DeepPartial<foundry.applications.api.DialogV2.Configuration>): Promise<TransitionConfiguration[] | undefined> {

  const actualOptions: DeepPartial<foundry.applications.api.DialogV2.Configuration> = {
    position: {
      width: 500
    },
    actions: {
      addStep: AddStep,
      selectStep: SelectStep,
      deleteStep: DeleteStep
    },
    classes: ["transition-builder"],
    buttons: [
      {
        action: "cancel",
        icon: "fas fa-fw fa-times",
        label: localize("Cancel")
      },
      {
        action: "ok",
        icon: "fas fa-fw fa-check",
        label: localize("Save"),
        // eslint-disable-next-line @typescript-eslint/require-await
        callback: async (event: PointerEvent | SubmitEvent, button: HTMLButtonElement, dialog: foundry.applications.api.DialogV2 | HTMLElement) => {
          const elem = dialog instanceof foundry.applications.api.DialogV2 ? dialog.element : dialog;
          const stepList = elem.querySelector(`select#stepList`);
          if (stepList instanceof HTMLSelectElement) {
            const sequence: TransitionConfiguration[] = [];
            for (let i = 0; i < stepList.options.length; i++) {
              const option = stepList.options.item(i);
              if (option) sequence.push(JSON.parse(option.value) as TransitionConfiguration);
            }

            return sequence;
          } else {
            return [];
          }
        }
      }
    ]
  }

  foundry.utils.mergeObject(actualOptions, options);
  foundry.utils.mergeObject(actualOptions, {
    render(event: Event, dialog: foundry.applications.api.DialogV2 | HTMLElement) {

      const elem = dialog instanceof foundry.applications.api.DialogV2 ? dialog.element : dialog;
      addEventListeners(elem);
      setupSequenceList(elem, sequence);
    }
  })

  const content = await (renderTemplateFunc())(`modules/${__MODULE_ID__}/templates/dialogs/EditSequence.hbs`, {
    sequence
  })

  foundry.utils.mergeObject(actualOptions, { content });

  return foundry.applications.api.DialogV2.wait(actualOptions as any)
    .then(val => {
      if (!val || val === "cancel") return undefined;
      else return val;
    })
}


function addEventListeners(parent: HTMLElement) {
  const form = parent.querySelector("form");
  if (form instanceof HTMLFormElement) {
    form.addEventListener("change", () => { onFormChange(form); });
  }
}

function SelectStep(this: foundry.applications.api.DialogV2, e: PointerEvent, elem: HTMLElement) {
  try {
    if (elem instanceof HTMLSelectElement) {
      const selectedItem = elem.options[elem.selectedIndex];
      if (selectedItem instanceof HTMLOptionElement && selectedItem.dataset.id) void selectItem(this.element, selectedItem.dataset.id);
    }
  } catch (err) {
    console.error(err);
    if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
  }
}

async function DeleteStep(this: foundry.applications.api.DialogV2) {
  try {
    await deleteSelectedStep(this.element);
  } catch (err) {
    console.error(err);
    if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
  }
}

async function AddStep(this: foundry.applications.api.DialogV2) {
  try {
    const config = await addStep(this.element);
    if (config) await selectItem(this.element, config.id);
    setEnabledButtons(this.element);
  } catch (err) {
    console.error(err);
    if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
  }
}


function onFormChange(form: HTMLFormElement) {
  try {
    const data = foundry.utils.expandObject(new (formDataExtendedClass())(form).object) as Record<string, unknown>;

    const currentStep = data.step as Record<string, unknown>;
    if (currentStep) {
      // process current step
      const typeElem = form.querySelector(`[data-role="transition-config"] [data-transition-type]`);
      if (typeElem instanceof HTMLElement) {
        const stepType = typeElem.dataset.transitionType as string;
        const step = getStepClassByKey(stepType);
        if (!step) throw new InvalidTransitionError(stepType);

        const { config } = step.from(form);

        const option = form.querySelector(`select#stepList [data-id="${config.id}"]`);
        if (option instanceof HTMLOptionElement) {
          option.dataset.serialized = JSON.stringify(config);
          option.value = JSON.stringify(config);
        }
      }
    }

  } catch (err) {
    console.error(err);
    if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
  }

}

