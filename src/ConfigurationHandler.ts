/* eslint-disable @typescript-eslint/no-unused-vars */
import { InvalidSceneError, InvalidTransitionError } from "./errors";
import { SceneChangeConfiguration, TransitionConfiguration } from "./steps";
import { confirmDialog, getStepClassByKey, localize, log, shouldUseAppV2 } from "./utils";
import { AddTransitionStepDialog, EditTransitionStepDialog } from "./dialogs";
import { SceneConfiguration } from "./interfaces";
import { DataMigration } from "./DataMigration";
import { BattleTransition } from "./BattleTransition";

// #region Classes (1)

export class ConfigurationHandler {
  // #region Public Static Methods (4)

  public static AddToNavigationBar(buttons: any[]) {
    buttons.push(
      {
        name: "BATTLETRANSITIONS.NAVIGATION.TRIGGER",
        icon: `<i class="fas bt-icon fa-fw crossed-swords"></i>`,
        condition: (li: JQuery<HTMLLIElement>) => {
          try {
            const scene = getScene(li);
            if (!scene) return false;

            if (scene.id === canvas?.scene?.id) return false;
            const steps = this.GetSceneTransition(scene) ?? [];
            return Array.isArray(steps) && steps.length;
          } catch (err) {
            ui.notifications?.error((err as Error).message, { console: false });
            console.error(err as Error)
          }
        },
        callback: (li: JQuery<HTMLLIElement>) => {
          const scene = getScene(li);
          if (!scene) throw new InvalidSceneError(typeof li.data("sceneId") === "string" ? li.data("sceneId") as string : typeof li.data("sceneId"));
          const sequence = this.GetSceneTransition(scene) ?? [];
          if (!(Array.isArray(sequence) && sequence.length)) return;

          void new BattleTransition(scene).execute({
            caller: game.user?.id ?? "",
            remote: false,
            sequence
            // sequence: [
            //   { type: "scenechange", scene: scene.id } as SceneChangeConfiguration,
            //   ...sequence
            // ]
          });
        }
      },
      {
        name: "BATTLETRANSITIONS.NAVIGATION.CUSTOM",
        icon: "<i class='fas fa-fw fa-hammer'></i>",
        condition: (li: JQuery<HTMLLIElement>) => {
          const scene = getScene(li);
          if (!scene) return false;
          return scene.id !== canvas?.scene?.id;
        },
        callback: (li: JQuery<HTMLLIElement>) => {
          const sceneId = li.data("sceneId") as string;
          const scene = game.scenes?.get(sceneId);
          if (!(scene instanceof Scene)) throw new InvalidSceneError(typeof sceneId === "string" ? sceneId : typeof sceneId)
          if (scene.canUserModify(game.user as User, "update"))
            void ConfigurationHandler.BuildTransition(scene);

        }
      }
    )
  }

  public static GetSceneConfiguration(scene: Scene): SceneConfiguration {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const flags = scene.flags[__MODULE_ID__] as any;
    // Check for data migration
    if (DataMigration.SceneConfiguration.NeedsMigration(flags)) return DataMigration.SceneConfiguration.Migrate(flags);
    else return flags as SceneConfiguration;
  }

  public static GetSceneTransition(scene: Scene): TransitionConfiguration[] {
    const config = ConfigurationHandler.GetSceneConfiguration(scene);
    return config.sequence;
  }

  public static async InjectSceneConfig(app: SceneConfig, html: JQuery<HTMLElement>, options: any) {
    if (game.release?.isNewer("12")) await injectV12(app, html, options);
    else await injectV11(app, html, options);
  }


  static async BuildTransition(scene?: Scene): Promise<void> {
    if (shouldUseAppV2() && foundry.applications.api.DialogV2) return buildTransitionV2(scene);
    else return buildTransitionV1(scene);
  }

  // #endregion Public Static Methods (4)
}

// #endregion Classes (1)

// #region Functions (10)

function addMainDialogEventListeners(app: SceneConfig, html: JQuery<HTMLElement>) {
  // Add step dialog
  html.find(`button[data-action="add-step"]`).on("click", e => {
    e.preventDefault();
    AddTransitionStepDialog.add()
      .then(config => {
        if (config) {
          addTransitionStep(config, html, app).then(() => { resizeDialog(app); }).catch(console.error);
        }
      })
      .catch((err: Error) => {
        ui.notifications?.error(err.message, { console: false });
        throw err;
      })
  });

  // Drag-and-drop sorting
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  (html.find("#transition-step-list") as any).sortable({
    handle: ".drag-handle",
    containment: "parent",
    axis: "y"
  });

  // Scene config save button
  html.find(`.sheet-footer button[type="submit"]`).on("click", () => {
    // Update
    void saveHandler(html, app);
  });

}

function addStepEventListeners(button: JQuery<HTMLElement>, config: TransitionConfiguration, app: Application) {
  // Remove button
  button.find(`[data-action="remove"]`).on("click", () => { void removeStepHandler(button, config, app); });

  // Configure button
  button.find(`[data-action="configure"]`).on("click", () => { void configureStepHandler(button, config, app); })
}

async function addTransitionStep(config: TransitionConfiguration, html: JQuery<HTMLElement>, app: Application) {
  const stepClass = getStepClassByKey(config.type);
  if (!stepClass) throw new InvalidTransitionError(typeof config.type === "string" ? config.type : typeof config.type);

  const content = await renderTemplate(`/modules/${__MODULE_ID__}/templates/config/step-item.hbs`, {
    ...config,
    name: localize(`BATTLETRANSITIONS.TRANSITIONTYPES.${stepClass.name}`),
    type: config.type,
    flag: JSON.stringify(config)
  });

  const button = $(content);
  html.find("#transition-step-list").append(button);
  addStepEventListeners(button, config, app);
}

async function configureStepHandler(button: JQuery<HTMLElement>, config: TransitionConfiguration, app: Application) {
  const newConfig = await EditTransitionStepDialog.EditStep(config);
  if (!newConfig) return;

  const stepClass = getStepClassByKey(config.type);
  if (!stepClass) throw new InvalidTransitionError(typeof config.type === "string" ? config.type : typeof config.type);

  const content = await renderTemplate(`/modules/${__MODULE_ID__}/templates/config/step-item.hbs`, {
    ...config,
    name: localize(`BATTLETRANSITIONS.TRANSITIONTYPES.${stepClass.name}`),
    type: config.type,
    flag: JSON.stringify(newConfig)
  });

  const appended = $(content);
  button.replaceWith(appended);
  addStepEventListeners(appended, newConfig, app);
}

function getScene(li: JQuery<HTMLLIElement>): Scene | undefined {
  const sceneId = li.data("sceneId") as string | undefined;
  if (!sceneId) return undefined;
  if (!sceneId) throw new InvalidSceneError(typeof sceneId === "string" ? sceneId : typeof sceneId);
  const scene = game.scenes?.get(sceneId);
  if (!(scene instanceof Scene)) throw new InvalidSceneError(typeof sceneId === "string" ? sceneId : typeof sceneId);
  return scene;
}

async function injectV11(app: SceneConfig, html: JQuery<HTMLElement>, options: any) {
  const navElement = await renderTemplate(`/modules/${__MODULE_ID__}/templates/config/scene-nav-bar.hbs`, {});
  const navBar = html.find("nav.sheet-tabs.tabs");
  navBar.append(navElement);

  const config = ConfigurationHandler.GetSceneConfiguration(app.document);

  const navContent = await renderTemplate(`/modules/${__MODULE_ID__}/templates/scene-config.hbs`, config);
  html.find(`button[type="submit"]`).before(`<div class="tab" data-tab="battle-transitions">${navContent}</div>`);
  addMainDialogEventListeners(app, html);
}

async function injectV12(app: SceneConfig, html: JQuery<HTMLElement>, options: any) {
  const navElement = await renderTemplate(`/modules/${__MODULE_ID__}/templates/config/scene-nav-bar.hbs`, {});
  const navBar = html.find("nav.sheet-tabs.tabs[data-group='main']");
  navBar.append(navElement);

  const config = ConfigurationHandler.GetSceneConfiguration(app.document);

  const navContent = await renderTemplate(`/modules/${__MODULE_ID__}/templates/scene-config.hbs`, config);
  html.find("footer.sheet-footer").before(`<div class="tab" data-group="main" data-tab="battle-transitions">${navContent}</div>`);

  // Add step handlers
  if (Array.isArray(config.sequence) && config.sequence.length) {
    for (const step of config.sequence) {
      await addTransitionStep(step, html, app)
    }
  }

  addMainDialogEventListeners(app, html);
}

async function removeStepHandler(button: JQuery<HTMLElement>, config: TransitionConfiguration, app: Application) {
  const stepClass = getStepClassByKey(config.type);
  if (!stepClass) throw new InvalidTransitionError(typeof config.type === "string" ? config.type : typeof config.type);
  const localizedName = localize(`BATTLETRANSITIONS.TRANSITIONTYPES.${stepClass.name}`);
  const confirm = await confirmDialog(localize("BATTLETRANSITIONS.SCENECONFIG.REMOVECONFIRM.TITLE", { name: localizedName }), localize("BATTLETRANSITIONS.SCENECONFIG.REMOVECONFIRM.CONTENT", { name: localizedName }));
  if (confirm) {
    button.remove();
    resizeDialog(app);
  }
}

function resizeDialog(app: Application) {
  app.setPosition();
}

function buildTransitionFromForm(html: JQuery<HTMLElement>) {
  const sequence: TransitionConfiguration[] = [];
  html.find("#transition-step-list [data-transition-type]").each((index, element) => {
    const flag = element.dataset.flag ?? "";
    const step = JSON.parse(flag) as TransitionConfiguration;
    sequence.push(step);
  });
  return sequence;
}

async function saveHandler(html: JQuery<HTMLElement>, app: SceneConfig) {
  // Build our configuration
  const tab = html.find(".tab[data-tab='battle-transitions']");
  const autoTrigger = tab.find(("#auto-trigger")).val() === "on";


  const config: { [x: string]: unknown } = {
    autoTrigger,
    version: CURRENT_VERSION,
    sequence: buildTransitionFromForm(tab)
  }

  const oldConfigKeys = Object.keys(app.document.flags[__MODULE_ID__]);
  for (const key of oldConfigKeys) {
    if (!Object.prototype.hasOwnProperty.call(config, key))
      config[`-=${key}`] = null
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  await app.document.update({
    flags: {
      "battle-transitions": config
    }
  } as any);
}

// #endregion Functions (10)

// #region Variables (1)

const CURRENT_VERSION = "1.1.0";

// #endregion Variables (1)

async function buildTransitionV2(scene?: Scene): Promise<void> {
  const content = await renderTemplate(`/modules/${__MODULE_ID__}/templates/transition-builder.hbs`, {
    scene: scene?.id,
    scenes: game.scenes?.contents.reduce((prev, curr) => {
      if (curr.id === game.scenes?.current?.id) return prev;
      return [
        ...prev,
        { id: curr.id, name: curr.name }
      ]
    }, [] as { id: string, name: string }[]) ?? []
  });

  const dialog = new foundry.applications.api.DialogV2({
    window: { title: localize("BATTLETRANSITIONS.TRANSITIONBUILDER.TITLE") },
    content,
    buttons: [
      {
        action: "cancel",
        label: `<i class="fas fa-times"></i> ${localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.CANCEL")}`
      },
      {
        action: "ok",
        label: `<i class="fas fa-check"></i> ${localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.OK")}`,
        default: true,
        // eslint-disable-next-line @typescript-eslint/require-await
        callback: async (e, button, dialog) => {
          e.preventDefault();
          const sceneId = $(dialog).find("#scene").val() as string;
          if (!sceneId) return;
          const sequence = buildTransitionFromForm($(dialog));
          void new BattleTransition(sceneId).execute({
            caller: game.user?.id ?? "",
            remote: false,
            sequence
            // sequence: [
            //   { type: "scenechange", version: "1.1.0", scene: sceneId } as SceneChangeConfiguration,
            //   ...sequence
            // ]
          })
        }
      }
    ]
  });
  await dialog.render(true);
  addMainDialogEventListeners(dialog as unknown as SceneConfig, $(dialog.element));
}


async function buildTransitionV1(scene?: Scene): Promise<void> {
  const content = await renderTemplate(`/modules/${__MODULE_ID__}/templates/transition-builder.hbs`, {
    scene: scene?.id,
    scenes: game.scenes?.contents.reduce((prev, curr) => {
      if (curr.id === game.scenes?.current?.id) return prev;
      return [
        ...prev,
        { id: curr.id, name: curr.name }
      ]
    }, [] as { id: string, name: string }[]) ?? []
  });

  const dialog = new Dialog({
    title: localize("BATTLETRANSITIONS.TRANSITIONBUILDER.TITLE"),
    content,
    render: (html: HTMLElement | JQuery<HTMLElement>) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      addMainDialogEventListeners(dialog as any, $(html));
    },
    buttons: {
      cancel: {
        icon: "<i class='fas fa-times'></i>",
        label: localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.CANCEL")
      },
      ok: {
        icon: "<i class='fas fa-check'></i>",
        label: localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.OK"),
        callback: (html: HTMLElement | JQuery<HTMLElement>) => {
          const sceneId = scene ? scene.id : $(html).find("#scene").val() as string;
          if (!sceneId) return;

          const sequence = buildTransitionFromForm($(html));
          if (Array.isArray(sequence) && sequence.length) {
            void new BattleTransition(sceneId).execute({
              caller: game.user?.id ?? "",
              remote: false,
              sequence
              // sequence: [
              //   { type: "scenechange", scene: sceneId, version: "1.1.0" } as SceneChangeConfiguration,
              //   ...sequence
              // ]
            })
          }
        }
      }
    }
  });

  dialog.render(true, { resizable: true, classes: ["dialog", "transition-builder"] });
}

// async function buildTransitioNV2(scene?: Scene): Promise<void> {

// }