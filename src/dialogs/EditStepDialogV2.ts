import { InvalidTransitionError } from "../errors";
import { TransitionConfiguration } from "../steps";
import { getStepClassByKey, localize } from "../utils";

export class EditStepDialogV2 {
  static async prompt(config: TransitionConfiguration, oldScene?: Scene, newScene?: Scene): Promise<TransitionConfiguration | null> {
    const step = getStepClassByKey(config.type);
    if (!step) throw new InvalidTransitionError(typeof config.type === "string" ? config.type : typeof config.type);
    const content = await step.RenderTemplate(config, oldScene, newScene);

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
          const elem = $(dialog.element);
          addEventListeners(dialog, elem);
          step.addEventListeners(elem, config);

          const CLOSE_HOOK_ID = Hooks.on("closeDialogV2", (closedDialog: foundry.applications.api.DialogV2) => {
            if (closedDialog.id === dialog.id) {
              Hooks.off("closeDialogV2", CLOSE_HOOK_ID);
              step.editDialogClosed(elem);
            }
          });
        })
    });
  }
}

function checkFormValidity(html: JQuery<HTMLElement>) {
  const stepType = html.find("[data-transition-type]").data("transition-type") as string;
  const step = getStepClassByKey(stepType);
  if (!step) throw new InvalidTransitionError(stepType);
  const valid = step.validateForm(html) && (html.find("form")[0])?.checkValidity();

  if (valid) html.find("button[data-action='ok']").removeAttr("disabled");
  else html.find("button[data-action='ok']").attr("disabled", "true");
}

function addEventListeners(dialog: foundry.applications.api.DialogV2, html: JQuery<HTMLElement>) {
  // Select number and text fields on focus
  html.find("input[type='number'],input[type='text']").on("focus", e => { (e.currentTarget as HTMLInputElement).select(); })

  checkFormValidity(html);
  html.find("input,select").on("input", () => { checkFormValidity(html); });

  // log("Background image:", html.find("#backgroundImage"));

  html.find("#backgroundImage").on("input", () => {
    const val = (html.find("#backgroundImage").val() as string) ?? "";

    if (val) {
      const tag = document.createElement("img");
      const img = $(tag);
      img.addClass("bg-image-preview");
      img.attr("src", val);
      html.find("#backgroundImagePreview img").remove();
      html.find("#backgroundImagePreview").append(img);
    } else {
      html.find("#backgroundImagePreview img").remove();
    }

  });

  // Font selector
  html.find("[data-font-select] option").each((index, element) => {
    if (element instanceof HTMLOptionElement)
      element.style.fontFamily = element.value;
  })

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

  html.find(`[data-background-type]`).css("display", "none");
  html.find(`[data-background-type="${bgType}"]`).css("display", "block");
}