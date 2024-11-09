import { TransitionConfiguration } from '../steps';
import { getSortedSteps, getStepClassByKey, localize, shouldUseAppV2 } from '../utils';

import { EditTransitionStepDialog } from './EditTransitionStep';
import { InvalidTransitionError } from '../errors';


export class AddTransitionStepDialog {
  static add(): Promise<TransitionConfiguration | undefined> {
    if (shouldUseAppV2() && foundry.applications.api.DialogV2) return addStepV2();
    else return addStepV1();
    // return addStepV1();
  }
}

async function addStepV2(): Promise<TransitionConfiguration | undefined> {
  const steps = getSortedSteps().filter(step => !step.hidden);
  const content = await renderTemplate(`/modules/${__MODULE_ID__}/templates/config/add-step.hbs`, {
    transitionTypes: steps.map(step => ({ key: step.DefaultSettings.type, name: localize(`BATTLETRANSITIONS.TRANSITIONTYPES.${step.name}`), icon: step.icon, hasIcon: !!step.icon }))
  });

  const key = await new Promise<string | undefined>(resolve => {
    const dialog = new foundry.applications.api.DialogV2({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      window: { title: localize("BATTLETRANSITIONS.SCENECONFIG.ADDSTEPDIALOG.TITLE") } as any,
      content,
      buttons: [
        {
          action: "cancel",
          label: `<i class="fas fa-times"></i> ${localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.CANCEL")}`
        }
      ]
    })
    dialog.render(true).then(val => {
      addEventListeners($(val.element), resolve, val as unknown as Dialog);
    }).catch(console.error)

  })




  if (!key) return Promise.resolve(undefined);

  const stepType = getStepClassByKey(key);
  if (!stepType) throw new InvalidTransitionError(key);
  else if (stepType.skipConfig) return stepType.DefaultSettings;
  else return EditTransitionStepDialog.CreateStep(key);

}

async function addStepV1(): Promise<TransitionConfiguration | undefined> {
  try {
    const steps = getSortedSteps().filter(step => !step.hidden);

    const content = await renderTemplate(`/modules/${__MODULE_ID__}/templates/config/add-step.hbs`, {
      transitionTypes: steps.map(step => ({ key: step.DefaultSettings.type, name: localize(`BATTLETRANSITIONS.TRANSITIONTYPES.${step.name}`), icon: step.icon, hasIcon: !!step.icon }))
    });

    const key = await new Promise<string | undefined>((resolve) => {
      const dialog = new Dialog({
        title: localize("BATTLETRANSITIONS.SCENECONFIG.ADDSTEPDIALOG.TITLE"),
        content,
        render: (html: HTMLElement | JQuery<HTMLElement>) => { addEventListeners($(html), resolve, dialog); },
        buttons: {
          cancel: {
            label: localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.CANCEL"),
            icon: "<i class='fas fa-times'></i>"
          }
        }
      });
      dialog.render(true);
    });


    if (!key) return Promise.resolve(undefined);

    const stepType = getStepClassByKey(key);
    if (!stepType) throw new InvalidTransitionError(key);
    else if (stepType.skipConfig) return stepType.DefaultSettings;
    else return EditTransitionStepDialog.CreateStep(key);
  } catch (err) {
    ui.notifications?.error((err as Error).message, { console: false });
    throw err;
  }
}

function addEventListeners(html: JQuery<HTMLElement>, resolve: (key: string | undefined) => void, dialog: Dialog) {
  html.find("button[data-transition]").on("click", e => {
    void dialog.close();
    resolve(e.currentTarget.dataset.transition);
  });

  html.find(`button.dialog-button.cancel[data-button="cancel"]`).on("click", () => {
    resolve(undefined);
  });
}