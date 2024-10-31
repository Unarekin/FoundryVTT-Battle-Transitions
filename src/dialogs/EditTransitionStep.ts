import { InvalidTransitionError } from "../errors";
import { TransitionConfiguration } from "../steps";
import { getStepClassByKey, localize, log } from "../utils";



export class EditTransitionStepDialog {
  static async CreateStep(key: string): Promise<TransitionConfiguration | undefined> {
    const stepType = getStepClassByKey(key);
    if (!stepType) throw new InvalidTransitionError(key);
    return editStepV1(key, stepType.DefaultSettings);
  }
}

async function editStepV1<t extends TransitionConfiguration>(key: string, config: t): Promise<t | undefined> {
  const stepClass = getStepClassByKey(key);
  if (!stepClass) throw new InvalidTransitionError(key);

  const content = await stepClass.RenderTemplate(config);

  const step = await Dialog.wait({
    title: localize("BATTLETRANSITIONS.SCENECONFIG.EDITSTEPDIALOG.TITLE", { name: localize(stepClass.name) }),
    content,

    default: "ok",
    buttons: {
      cancel: {
        icon: "<i class='fas fa-times'></i>",
        label: localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.CANCEL")
      },
      ok: {
        icon: "<i class='fas fa-check'></i>",
        label: localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.OK"),
        callback: () => {
          return "testypoo"
        }
      }
    }
  });

  log("Step:", step);

  return undefined;
  // if (!config) return undefined;
  // else return config;
}

//   const key = await new Promise<string | undefined>((resolve) => {
//     const dialog = new Dialog({
//       title: localize("BATTLETRANSITIONS.SCENECONFIG.ADDSTEPDIALOG.TITLE"),
//       content,
//       render: (html: HTMLElement | JQuery<HTMLElement>) => { addEventListeners($(html), resolve, dialog); },
//       buttons: {
//         cancel: {
//           label: localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.CANCEL"),
//           icon: "<i class='fas fa-times'></i>"
//         }
//       }
//     });
//     dialog.render(true);
//   });

//   if (!key) return Promise.resolve(undefined);
//   else return EditTransitionStepDialog.CreateStep(key);
// }