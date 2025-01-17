
import { InvalidTransitionError } from '../errors';
import { TransitionConfiguration } from '../steps/types';
import { getStepClassByKey, localize, mimeType } from '../utils';

export class EditStepDialogV1 {
  static async prompt(config: TransitionConfiguration, oldScene?: Scene, newScene?: Scene): Promise<TransitionConfiguration | null> {
    const step = getStepClassByKey(config.type);
    if (!step) throw new InvalidTransitionError(typeof config.type === "string" ? config.type : typeof config.type);

    const content = await step.RenderTemplate({
      ...config,
      isV1: true
    } as TransitionConfiguration, oldScene, newScene);

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
          step.addEventListeners($(html), config);
          const CLOSE_HOOK_ID = Hooks.on("closeDialog", (closed: Dialog) => {
            if (closed.id === dialog.id) {
              Hooks.off("closeDialog", CLOSE_HOOK_ID);
              step.editDialogClosed(html);
            }
          })

        }
      });

      dialog.render(true, { classes: ["dialog", "bt"], resizable: true, width: 500 });
    })
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

function setBackgroundImage(html: JQuery<HTMLElement>) {
  const val = (html.find("#backgroundImage,input[name='backgroundImage']").val() as string) ?? "";

  if (val) {
    html.find("#backgroundImagePreview").children().remove();

    const mime = mimeType(val);
    const fileType = mime.split("/")[0];

    if (fileType === "image") {
      const tag = document.createElement("img");
      const img = $(tag);
      img.addClass("bg-image-preview");
      img.attr("src", val);
      html.find("#backgroundImagePreview img").remove();
      html.find("#backgroundImagePreview").append(img);
    } else if (fileType === "video") {
      const tag = document.createElement("video");
      const vid = $(tag);
      vid.addClass("bg-image-preview");
      vid.attr("controls", "true");
      vid.attr("muted", "true");
      vid.append(`<source src="${val}" type="${mime}">`);

      html.find("#backgroundImagePreview").append(vid);
    }
  } else {
    html.find("#backgroundImagePreview img").remove();
  }
}

function addEventListeners(dialog: Dialog, html: JQuery<HTMLElement>) {
  // Select number and text fields on focus
  html.find("input[type='number'],input[type='text']").on("focus", e => { (e.currentTarget as HTMLInputElement).select(); })

  // Disable ok button
  checkFormValidity(html);
  html.find("input").on("input", () => { checkFormValidity(html); });

  // Font selector
  html.find("[data-font-select] option").each((index, element) => {
    if (element instanceof HTMLOptionElement)
      element.style.fontFamily = element.value;
  });

  html.find("[data-font-select]").css("font-family", html.find("[data-font-select]").val() as string);
  html.find("[data-font-select]").on("input", e => {
    $(e.currentTarget).css("font-family", $(e.currentTarget).val() as string);
  });

  // log("Background image:", html.find("#backgroundImage"));
  setBackgroundImage(html);
  html.find("#backgroundImage").on("input", () => {
    setBackgroundImage(html);
  });

  // Set up tabs
  const tabs = new Tabs({
    contentSelector: ".tab-content",
    navSelector: ".tabs[data-group='primary-tabs']",
    initial: "wipes",
  });
  tabs.bind(html[0]);

  // Background type
  setBackgroundType(html);
  html.find("#backgroundType").on("change", () => { setBackgroundType(html) });

  // Enable file picker
  html.find("#file + button.file-picker").on("click", () => {
    new FilePicker({
      callback: (file) => { $("#file").val(file); }
    }).render(true);
  });

  html.find("#backgroundImage + button.file-picker").on("click", () => {
    new FilePicker({
      callback: (file) => {
        $("#backgroundImage").val(file);
        setBackgroundImage(html);
      }
    }).render(true);
  })

  html.find("input[type='range']").on("input", e => {
    if (e.currentTarget instanceof HTMLInputElement) {
      $(e.currentTarget).siblings("span.range-value").text(e.currentTarget.value);
    }
  })

  // Color picker
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  ColorPicker.install();
}

function setBackgroundType(html: JQuery<HTMLElement>) {
  const bgType = html.find("#backgroundType").val() as string;

  html.find(`[data-background-type]`).css("display", "none");
  html.find(`[data-background-type="${bgType}"]`).css("display", "block");
}
