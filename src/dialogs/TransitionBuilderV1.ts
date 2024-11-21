import { SceneChangeConfiguration, TransitionConfiguration } from "../steps";
import { getStepClassByKey, localize } from "../utils";
import { InvalidSceneError, InvalidTransitionError } from "../errors";
import { addStepDialog, editStepDialog, confirm, buildTransitionFromForm } from "./functions";

export class TransitionBuilderV1 {
  static async prompt(scene?: Scene): Promise<TransitionConfiguration[] | null> {

    const content = await renderTemplate(`/modules/${__MODULE_ID__}/templates/dialogs/TransitionBuilder.hbs`, {
      newScene: scene?.id,
      oldScene: game.scenes?.current?.id ?? "",
      scenes: game.scenes?.contents.map(scene => ({ id: scene.id, name: scene.name })) ?? []
    });

    return new Promise<TransitionConfiguration[] | null>(resolve => {
      const dialog = new Dialog({
        title: localize("BATTLETRANSITIONS.DIALOGS.TRANSITIONBUILDER.TITLE"),
        content,
        render: (html) => {
          addEventListeners(dialog, $(html));
        },
        default: "ok",
        buttons: {
          ok: {
            icon: `<i class="fas fa-play"></i>`,
            label: localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.TRANSITION"),
            callback: (html) => {
              const elem = $(html);
              const sequence = buildTransitionFromForm(elem);

              const sceneId = scene ? scene.id : elem.find("#newScene").val() as string;
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
            }
          },
          cancel: {
            icon: `<i class="fas fa-times"></i>`,
            label: localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.CANCEL"),
            callback: () => { resolve(null); }
          }
        }
      });

      dialog.render(true, { resizable: true });
    })
  }
}

function addEventListeners(dialog: Dialog, html: JQuery<HTMLElement>) {
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


async function addStep(dialog: Dialog, html: JQuery<HTMLElement>) {
  const key = await addStepDialog();
  if (!key) return;
  const step = getStepClassByKey(key);
  if (!step) throw new InvalidTransitionError(key);

  let config: TransitionConfiguration | null = null;
  if (!step.skipConfig) {
    // Edit form
    config = await editStepDialog(step.DefaultSettings)
  } else {
    config = {
      ...step.DefaultSettings,
      id: foundry.utils.randomID()
    };
  }
  if (!config) return;

  // Inject step
  await upsertStepButton(dialog, html, config);

  dialog.setPosition();
}


async function upsertStepButton(dialog: Dialog, html: JQuery<HTMLElement>, config: TransitionConfiguration) {
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

function addStepEventListeners(dialog: Dialog, html: JQuery<HTMLElement>, button: JQuery<HTMLElement>, config: TransitionConfiguration) {
  // Remove button
  button.find("[data-action='remove']").on("click", () => {
    const step = getStepClassByKey(config.type);
    if (!step) throw new InvalidTransitionError(config.type);
    confirm(
      localize("BATTLETRANSITIONS.DIALOGS.REMOVECONFIRM.TITLE", { name: localize(`BATTLETRANSITIONS.${step.name}.NAME`) }),
      localize("BATTLETRANSITIONS.DIALOGS.REMOVECONFIRM.CONTENT", { name: localize(`BATTLETRANSITIONS.${step.name}.NAME`) })
    )
      .then(confirm => {
        if (confirm) {
          button.remove();
          dialog.setPosition();
        }
      }).catch(err => {
        ui.notifications?.error((err as Error).message, { console: false });
        console.error(err);
      });
  });

  // Configure button
  button.find("[data-action='configure']").on("click", () => {
    const oldScene = html.find("#oldScene").val() as string ?? "";
    const newScene = html.find("#newScene").val() as string ?? "";

    editStepDialog(config, game.scenes?.get(oldScene), game.scenes?.get(newScene))
      .then(newConfig => {
        if (newConfig) {
          // Replace button
          return upsertStepButton(dialog, html, newConfig)
        }
      }).then(() => {

      }).catch(err => {
        ui.notifications?.error((err as Error).message, { console: false })
        console.error(err);
      })
  });
}
