import { ConfigurationHandler } from "../ConfigurationHandler";
import { InvalidTransitionError } from "../errors";
import { SceneConfiguration } from "../interfaces";
import { TransitionConfiguration } from "../steps";
import { sequenceDuration } from "../transitionUtils";
import { formatDuration, getStepClassByKey, localize } from "../utils";

import { addStepDialog, editStepDialog, confirm, buildTransitionFromForm } from "./functions";

export class SceneConfigV12 extends SceneConfig {
  static async inject(app: SceneConfig, html: JQuery<HTMLElement>, options: any, config: SceneConfiguration) {
    const navElement = await renderTemplate(`/modules/${__MODULE_ID__}/templates/config/scene-nav-bar.hbs`, {});
    const navBar = html.find("nav.sheet-tabs.tabs[data-group='main']");
    navBar.append(navElement);

    const navContent = await renderTemplate(`/modules/${__MODULE_ID__}/templates/scene-config.hbs`, config);
    html.find("footer.sheet-footer").before(`<div class="tab" data-group="main" data-tab="${__MODULE_ID__}">${navContent}</div>`);

    // Insert sequence steps
    for (const step of config.sequence) {
      await upsertStepButton(app, html, step);
    }

    addEventListeners(app, html);
  }
}

function addEventListeners(app: SceneConfig, html: JQuery<HTMLElement>) {
  // Add step button
  html.find(`button[data-action="add-step"]`).on("click", e => {
    e.preventDefault();
    void addStep(app, html);
  });

  // Drag reorder
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  (html.find("#transition-step-list") as any).sortable({
    handle: ".drag-handle",
    containment: "parent",
    axis: "y"
  });

  // Save button
  html.find(".sheet-footer button[type='submit']").on("click", () => {
    const autoTrigger = html.find("#auto-trigger").is(":checked") ?? false;
    const sequence = buildTransitionFromForm(html);

    void ConfigurationHandler.SetSceneConfiguration(
      app.document,
      {
        version: "1.1.0",
        autoTrigger,
        isTriggered: false,
        sequence
      });
  });
}


async function addStep(app: SceneConfig, html: JQuery<HTMLElement>) {
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
    }
  }
  if (!config) return;

  // Inject step
  await upsertStepButton(app, html, config);

  app.setPosition();
}

async function upsertStepButton(app: SceneConfig, html: JQuery<HTMLElement>, config: TransitionConfiguration) {
  const step = getStepClassByKey(config.type);
  if (!step) throw new InvalidTransitionError(config.type);

  const sequence = [...buildTransitionFromForm(html), config];
  const durationRes = step.getDuration(config, sequence);
  const calculatedDuration = durationRes instanceof Promise ? await durationRes : durationRes;

  const totalDuration = await sequenceDuration(sequence);
  html.find("#total-duration").text(localize("BATTLETRANSITIONS.SCENECONFIG.TOTALDURATION", { duration: formatDuration(totalDuration) }));

  const buttonContent = await renderTemplate(`/modules/${__MODULE_ID__}/templates/config/step-item.hbs`, {
    ...step.DefaultSettings,
    ...config,
    name: localize(`BATTLETRANSITIONS.${step.name}.NAME`),
    description: localize(`BATTLETRANSITIONS.${step.name}.DESCRIPTION`),
    type: step.key,
    calculatedDuration,
    skipConfig: step.skipConfig,
    flag: JSON.stringify({
      ...step.DefaultSettings,
      ...config
    })
  });

  const button = $(buttonContent);

  const extant = html.find(`[data-id="${config.id}"]`);
  if (extant.length) extant.replaceWith(button);
  else html.find("#transition-step-list").append(button);

  addStepEventListeners(app, html, button, config);
}

function addStepEventListeners(app: SceneConfig, html: JQuery<HTMLElement>, button: JQuery<HTMLElement>, config: TransitionConfiguration) {
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
          app.setPosition();
        }
      }).catch(err => {
        ui.notifications?.error((err as Error).message, { console: false });
        console.error(err);
      });
  })

  // Configure button
  button.find("[data-action='configure']").on("click", () => {
    editStepDialog(config)
      .then(newConfig => {
        if (newConfig) {
          // Replace button
          return upsertStepButton(app, html, newConfig)
        }
      }).then(() => {

      }).catch(err => {
        ui.notifications?.error((err as Error).message, { console: false })
        console.error(err);
      })
  });
}