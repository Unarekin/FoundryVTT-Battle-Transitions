import { InvalidTransitionError } from '../errors';
import { TransitionConfiguration } from '../steps/types';
import { getStepClassByKey, localize } from '../utils';

export class EditStepDialogV1 {
  static async prompt(config: TransitionConfiguration): Promise<TransitionConfiguration | null> {
    const step = getStepClassByKey(config.type);
    if (!step) throw new InvalidTransitionError(typeof config.type === "string" ? config.type : typeof config.type);

    const content = await step.RenderTemplate(config);

    return new Promise<TransitionConfiguration | null>(resolve => {
      const dialog = new Dialog({
        title: localize(`BATTLETRANSITIONS.DIALOGS.EDITSTEP.TITLE`, { name: localize(`BATTLETRANSITIONS.${step.name}.NAME`) }),
        content,
        buttons: {
          ok: {
            icon: `<i class="fas fa-check"></i>`,
            label: localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.OK"),
            callback: (html: HTMLElement | JQuery<HTMLElement>) => {
              const config = step.from($(html).find("form"))?.config ?? null;
              if (config) resolve({
                ...step.DefaultSettings,
                ...config
              } as TransitionConfiguration);
              else resolve(null);
            }
          },
          cancel: {
            icon: `<i class="fas fa-times"></i>`,
            label: localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.CANCEL"),
            callback: () => { resolve(null); }
          }
        },
        render: (html: HTMLElement | JQuery<HTMLElement>) => {
          addEventListeners(dialog, $(html));
        }
      });

      dialog.render(true, { classes: ["dialog", "bt"], resizable: true });
    })
  }
}


function addEventListeners(dialog: Dialog, html: JQuery<HTMLElement>) {
  // Select number and text fields on focus
  html.find("input[type='number'],input[type='text']").on("focus", e => { (e.currentTarget as HTMLInputElement).select(); })


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