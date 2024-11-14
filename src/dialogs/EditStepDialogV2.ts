import { InvalidTransitionError } from "../errors";
import { TransitionConfiguration } from "../steps";
import { getStepClassByKey, localize } from "../utils";

export class EditStepDialogV2 {
  static async prompt(config: TransitionConfiguration): Promise<TransitionConfiguration | null> {
    const step = getStepClassByKey(config.type);
    if (!step) throw new InvalidTransitionError(typeof config.type === "string" ? config.type : typeof config.type);

    const content = await step.RenderTemplate(config);
    return new Promise<TransitionConfiguration | null>(resolve => {
      const dialog = new foundry.applications.api.DialogV2({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        window: ({ title: localize(`BATTLETRANSITIONS.DIALOGS.EDITSTEP.TITLE`, { name: localize(`BATTLETRANSITIONS.${step.name}.NAME`) }) } as any),
        content,
        buttons: [
          {
            label: `<i class="fas fa-check"></i> ${localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.OK")}`,
            default: true,
            action: "ok",
            callback: (e, button: HTMLButtonElement, html: HTMLDialogElement) => {
              const config = step.from($(html).find("form"))?.config ?? null;
              if (config) {
                resolve({
                  ...step.DefaultSettings,
                  ...config
                });
              } else {
                resolve(null);
              }
              return Promise.resolve();
            }
          },
          {
            label: `<i class="fas fa-times"></i> ${localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.CANCEL")}`,
            action: "cancel"
          }
        ]
      })
      void dialog.render(true)
        .then(dialog => {
          dialog.position.width = 500;
          addEventListeners(dialog, $(dialog.element));
        })
    });
  }
}

function addEventListeners(dialog: foundry.applications.api.DialogV2, html: JQuery<HTMLElement>) {
  // Select number and text fields on focus
  html.find("input[type='number'],input[type='text']").on("focus", e => { (e.currentTarget as HTMLInputElement).select(); })

  // Set up tabs
  const tabs = new Tabs({
    contentSelector: ".tab-content",
    navSelector: ".tabs[data-group='primary-tabs']",
    initial: "wipes",
  });
  tabs.bind(dialog.element);

  // Background type
  setBackgroundType(html);
  html.find("#backgroundType").on("change", () => { setBackgroundType(html) });

  // Color picker
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  ColorPicker.install();
}

function setBackgroundType(html: JQuery<HTMLElement>) {
  const bgType = html.find("#backgroundType").val() as string;
  if (bgType === "color") {
    html.find("#backgroundColor").css("display", "block");
    html.find("#backgroundImage").css("display", "none");
  } else if (bgType === "image") {
    html.find("#backgroundImage").css("display", "");
    html.find("#backgroundColor").css("display", "none");
  }
}