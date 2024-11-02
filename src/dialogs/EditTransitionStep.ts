import { InvalidTransitionError } from "../errors";
import { TransitionConfiguration } from "../steps";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { getStepClassByKey, localize, log, shouldUseAppV2 } from "../utils";



export class EditTransitionStepDialog {
  static async CreateStep(key: string): Promise<TransitionConfiguration | undefined> {
    const stepType = getStepClassByKey(key);
    if (!stepType) throw new InvalidTransitionError(key);
    if (shouldUseAppV2() && foundry.applications.api.DialogV2) return editStepV2(key, stepType.DefaultSettings);
    else return editStepV1(key, stepType.DefaultSettings);
  }

  static async EditStep(config: TransitionConfiguration): Promise<TransitionConfiguration | undefined> {
    if (shouldUseAppV2() && foundry.applications.api.DialogV2) return editStepV2(config.type, config);
    else return editStepV1(config.type, config);
  }
}

async function editStepV2<t extends TransitionConfiguration>(key: string, config: t): Promise<t | undefined> {
  const stepClass = getStepClassByKey(key);
  if (!stepClass) throw new InvalidTransitionError(key);
  const content = await stepClass.RenderTemplate(config);

  return foundry.applications.api.DialogV2.wait({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    window: ({
      title: localize("BATTLETRANSITIONS.SCENECONFIG.EDITSTEPDIALOG.TITLE", { name: localize(`BATTLETRANSITIONS.TRANSITIONTYPES.${stepClass.name}`) })
    } as any),
    content,
    render: (e, dialog: HTMLDialogElement) => { addEventListeners($(dialog)); },
    buttons: [
      {
        label: `<i class="fas fa-check"></i> ${localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.OK")}`,
        callback: (e, button, dialog: HTMLDialogElement) => {
          return Promise.resolve(stepClass.from($(dialog).find("form")).config);
        },
        default: true,
        action: "ok"
      },
      {
        label: `<i class="fas fa-times"></i> ${localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.CANCEL")}`,
        callback: () => Promise.resolve(""),
        action: "cancel"
      }
    ]
  }).then(val => val ? val : undefined).catch(() => undefined) as Promise<t | undefined>
}

async function editStepV1<t extends TransitionConfiguration>(key: string, config: t): Promise<t | undefined> {
  const stepClass = getStepClassByKey(key);
  if (!stepClass) throw new InvalidTransitionError(key);

  const content = await stepClass.RenderTemplate(config);

  return Dialog.wait({
    title: localize("BATTLETRANSITIONS.SCENECONFIG.EDITSTEPDIALOG.TITLE", { name: localize(`BATTLETRANSITIONS.TRANSITIONTYPES.${stepClass.name}`) }),
    content,
    default: "ok",
    render: (html: JQuery<HTMLElement>) => {
      addEventListeners(html);
    },
    buttons: {
      cancel: {
        icon: "<i class='fas fa-times'></i>",
        label: localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.CANCEL")
      },
      ok: {
        icon: "<i class='fas fa-check'></i>",
        label: localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.OK"),
        callback: (html: JQuery<HTMLElement>) => {
          return stepClass.from(html.find("form")).config;
        }
      }
    }
  }).then(val => val === "cancel" ? undefined : val).catch(() => undefined) as Promise<t | undefined>;
}

function setBackgroundElements(html: JQuery<HTMLElement>) {
  const bgType = html.find("#backgroundType").val() as string;
  if (bgType === "image") {
    html.find("#backgroundColor").css("display", "none");
    html.find("#backgroundImage").css("display", "");
  } else if (bgType === "color") {
    html.find("#backgroundColor").css("display", "");
    html.find("#backgroundImage").css("display", "none");
  }
}

function addEventListeners(html: JQuery<HTMLElement>) {
  // Select contents of text and number inputs on focus
  html.find(`input[type="text"],input[type="number"]`).on("focus", e => {
    (e.currentTarget as HTMLInputElement).select();
  });

  setBackgroundElements(html);
  html.find("#backgroundType").on("input", () => { setBackgroundElements(html); });

  // Set up color picker elements
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  ColorPicker.install();
}