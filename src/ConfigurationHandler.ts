/* eslint-disable @typescript-eslint/no-unused-vars */
import { InvalidSceneError, InvalidTransitionError } from "./errors";
import { TransitionConfiguration } from "./steps";
import { confirmDialog, getStepClassByKey, localize, log } from "./utils";
import { AddTransitionStepDialog, EditTransitionStepDialog } from "./dialogs";
import { SceneConfiguration } from "./interfaces";
import { DataMigration } from "./DataMigration";

// #region Classes (1)

const CURRENT_VERSION = "1.1.0";

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

            const steps = (scene.getFlag(__MODULE_ID__, "steps") ?? []) as unknown[];
            if (Array.isArray(steps) && steps.length) return true;
          } catch (err) {
            ui.notifications?.error((err as Error).message, { console: false });
            console.error(err as Error)
          }
        },
        callback: () => { }
      },
      {
        name: "BATTLETRANSITIONS.NAVIGATION.CUSTOM",
        icon: "<i class='fas fa-fw fa-hammer'></i>",
        condition: (li: JQuery<HTMLLIElement>) => {
          const scene = getScene(li);
          if (!scene) return false;
          return scene.id !== canvas?.scene?.id;
        },
        callback: () => { }
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

  // #endregion Public Static Methods (4)
}

// #endregion Classes (1)

// #region Functions (9)

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

  // Save button
  html.find(`button[type="submit"]`).on("click", () => {
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

// #endregion Functions (9)

// eslint-disable-next-line @typescript-eslint/require-await
async function saveHandler(html: JQuery<HTMLElement>, app: SceneConfig) {
  // Build our configuration
  const tab = html.find(".tab[data-tab='battle-transitions']");
  const autoTrigger = tab.find(("#auto-trigger")).val() === "on";


  const sequence: TransitionConfiguration[] = [];

  tab.find("#transition-step-list [data-transition-type]").each((index, element) => {
    const flag = element.dataset.flag ?? "";
    const step = JSON.parse(flag) as TransitionConfiguration;
    sequence.push(step);
  });

  const config: { [x: string]: unknown } = {
    autoTrigger,
    version: CURRENT_VERSION,
    sequence
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