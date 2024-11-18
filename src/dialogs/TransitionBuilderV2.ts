import { InvalidSceneError, InvalidTransitionError } from "../errors";
import { SceneChangeConfiguration, TransitionConfiguration } from "../steps";
import { getStepClassByKey, localize } from "../utils";
import { addStepDialog, editStepDialog, confirm, buildTransitionFromForm } from "./functions";

export class TransitionBuilderV2 {
  static async prompt(scene?: Scene): Promise<TransitionConfiguration[] | null> {
    const content = await renderTemplate(`/modules/${__MODULE_ID__}/templates/dialogs/TransitionBuilder.hbs`, {
      scene: scene?.id,
      scenes: game.scenes?.contents.map(scene => ({ id: scene.id, name: scene.name })) ?? []
    });

    return new Promise<TransitionConfiguration[] | null>(resolve => {

      const dialog = new foundry.applications.api.DialogV2({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        window: ({ title: localize("BATTLETRANSITIONS.DIALOGS.TRANSITIONBUILDER.TITLE") } as any),
        content,
        buttons: [
          {
            label: `<i class="fas fa-play"></i> ${localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.TRANSITION")}`,
            default: true,
            action: "ok",
            callback: (e, button, html) => {
              const elem = $(html);
              const sequence = buildTransitionFromForm(elem);

              const sceneId = scene ? scene.id : elem.find("#scene").val() as string;
              if (!sceneId) throw new InvalidSceneError(typeof sceneId === "string" ? sceneId : typeof sceneId);
              const step = getStepClassByKey("scenechange");
              if (!step) throw new InvalidTransitionError("scenechange");
              const sceneChange: SceneChangeConfiguration = {
                ...step.DefaultSettings,
                scene: sceneId
              };
              resolve([
                sceneChange,
                ...sequence
              ]);
              return Promise.resolve();
            }
          },
          {
            label: `<I class="fas fa-times"></i> ${localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.CANCEL")}`,
            action: 'cancel',
            callback: () => {
              resolve(null);
              return Promise.resolve();
            }
          }
        ]
      })
      void dialog.render(true)
        .then(dialog => {
          addEventListeners(dialog, $(dialog.element))
        })
    });
  }
}

function addEventListeners(dialog: foundry.applications.api.DialogV2, html: JQuery<HTMLElement>) {
  html.find("button[data-action='add-step']").on("click", e => {
    e.preventDefault();
    void addStep(dialog, html);
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  (html.find("#transition-step-list") as any).sortable({
    handle: ".drag-handle",
    containment: "parent",
    axis: "y"
  });
}

async function addStep(dialog: foundry.applications.api.DialogV2, html: JQuery<HTMLElement>) {
  const key = await addStepDialog();
  if (!key) return;

  const step = getStepClassByKey(key);
  if (!step) throw new InvalidTransitionError(key);

  let config: TransitionConfiguration | null = null;

  if (!step.skipConfig) {
    config = await editStepDialog(step.DefaultSettings);
  } else {
    config = {
      ...step.DefaultSettings,
      id: foundry.utils.randomID()
    };
  }

  if (!config) return;

  await upsertStepButton(dialog, html, config);
}

async function upsertStepButton(dialog: foundry.applications.api.DialogV2, html: JQuery<HTMLElement>, config: TransitionConfiguration) {
  const step = getStepClassByKey(config.type);
  if (!step) throw new InvalidTransitionError(config.type);

  const buttonContent = await renderTemplate(`/modules/${__MODULE_ID__}/templates/config/step-item.hbs`, {
    ...step.DefaultSettings,
    ...config,
    name: localize(`BATTLETRANSITIONS.${step.name}.NAME`),
    description: localize(`BATTLETRANSITIONS.${step.name}.DESCRIPTION`),
    type: step.key,
    flag: JSON.stringify({
      ...step.DefaultSettings,
      ...config
    })
  });

  const button = $(buttonContent);

  const extant = html.find(`[data-id="${config.id}"]`);
  if (extant.length) extant.replaceWith(button);
  else html.find("#transition-step-list").append(button);

  addStepEventListeners(dialog, html, button, config);
}

function addStepEventListeners(dialog: foundry.applications.api.DialogV2, html: JQuery<HTMLElement>, button: JQuery<HTMLElement>, config: TransitionConfiguration) {
  button.find("[data-action='remove']").on("click", () => {
    const step = getStepClassByKey(config.type);
    if (!step) throw new InvalidTransitionError(config.type);
    confirm(
      localize(`BATTLETRANSITIONS.DIALOGS.REMOVECONFIRM.TITLE`, { name: localize(`BATTLETRANSITIONS.${step.name}.NAME`) }),
      localize("BATTLETRANSITIONS.DIALOGS.REMOVECONFIRM.CONTENT", { name: localize(`BATTLETRANSITIONS.${step.name}.NAME`) })
    )
      .then(confirm => {
        if (confirm)
          button.remove();
      }).catch((err: Error) => {
        ui.notifications?.error(err.message, { console: false });
        console.error(err);
      });
  });

  button.find("[data-action='configure']").on("click", () => {
    editStepDialog(config)
      .then(newConfig => {
        if (newConfig) return upsertStepButton(dialog, html, newConfig);
      }).catch((err: Error) => {
        ui.notifications?.error(err.message, { console: false });
        console.error(err);
      })
  })
}