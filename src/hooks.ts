import { log } from './utils';
import { SceneChangeConfiguration, SceneChangeStep, TransitionConfiguration } from './steps';
import { SceneConfigMixin } from "./applications";
import { CONSTANTS, CUSTOM_HOOKS } from "./constants";
import { registerHelpers, registerTemplates } from "./templates";
import { ConfigurationHandler } from './ConfigurationHandler';
import { BattleTransition } from 'BattleTransition';
import { SocketHandler } from "./sockets";
import { SceneMixin } from "./SceneMixin";
import { DummyTransitionFilter } from 'filters';
import { _playFunction, _playOptions } from "./types";
import { BTScene } from 'interfaces';



Hooks.once("canvasReady", () => {

  BattleTransition.initialize();

  Hooks.callAll(CUSTOM_HOOKS.INITIALIZE)
})

Hooks.once("ready", () => {

  game.BattleTransitions = {
    transition: BattleTransition,
    socket: new SocketHandler()
  }
  const entries = Object.entries(CONFIG.Scene.sheetClasses.base);
  for (const [key, { cls }] of entries) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const mixed = SceneConfigMixin(cls as any);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    CONFIG.Scene.sheetClasses.base[key].cls = mixed as any;
  }
});

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
(CONFIG.Canvas as unknown as Record<string, any>).sceneTransitions[CONSTANTS.TRANSITION_TYPE] = {
  id: CONSTANTS.TRANSITION_TYPE,
  label: "BATTLETRANSITIONS.COMMON.TRANSITIONTYPE",
  defaultDoration: 0,
  filterClass: DummyTransitionFilter
};

Hooks.once("init", async () => {
  registerHelpers();
  await registerTemplates();

  CONFIG.Scene.documentClass = SceneMixin(CONFIG.Scene.documentClass);

  libWrapper.register<_playFunction>(__MODULE_ID__, "foundry.canvas.TransitionContainer.prototype._play", function (this: foundry.canvas.containers.UnboundContainer, wrapped: _playFunction, options: _playOptions) {
    if (!canvas?.scene) return Promise.resolve();

    let retPromise: Promise<void> | undefined = undefined;

    if (canvas.scene.transition.type === "battleTransition") {

      BattleTransition.HideLoadingBar = true;

      const config = (canvas.scene as BTScene).battleTransitionConfiguration;

      if (config.autoTrigger && !config.bypassTransition) {
        const sceneChange: SceneChangeConfiguration = {
          ...foundry.utils.deepClone(SceneChangeStep.DefaultSettings),
          id: foundry.utils.randomID(),
          scene: canvas.scene.id
        };
        retPromise = BattleTransition.ExecuteSequence([
          sceneChange,
          ...config.sequence
        ]);
      } else {
        retPromise = Promise.resolve();
      }
    } else {
      retPromise = wrapped(options);
    }

    retPromise ??= Promise.resolve();

    return retPromise.finally(() => {
      canvas.transition.visible = false;
      canvas.transition.removeChildren();
      BattleTransition.HideLoadingBar = false;
    });
  });
});


// eslint-disable-next-line @typescript-eslint/no-unused-vars
Hooks.on("preUpdatePlaylist", (playlist: Playlist, delta: Playlist.UpdateData, options: Playlist.Database.PreUpdateOptions, userId: string) => {
  if (delta.playing && BattleTransition.SuppressSoundUpdates)
    return false;
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
Hooks.on("preUpdatePlaylistSound", (sound: PlaylistSound, delta: PlaylistSound.UpdateData, options: PlaylistSound.Database.PreUpdateOptions, userId: string) => {
  if (delta.playing && BattleTransition.SuppressSoundUpdates)
    return false;
});


// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
(Hooks as any).on(CUSTOM_HOOKS.TRANSITION_START, (...args: unknown[]) => {
  log("Transition start:", args);
});

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
(Hooks as any).on(CUSTOM_HOOKS.TRANSITION_END, (...args: unknown[]) => {
  log("Transition end:", args);
});


// eslint-disable-next-line @typescript-eslint/no-unused-vars
Hooks.on("renderSceneDirectory", (app: foundry.applications.sidebar.tabs.SceneDirectory, html: HTMLElement, context: foundry.applications.sidebar.tabs.SceneDirectory.RenderContext, options: foundry.applications.sidebar.tabs.SceneDirectory.RenderOptions) => {
  const container = document.createElement("div");
  container.classList.add("header-actions", "action-buttons", "flexrow");

  const button = document.createElement("button");
  button.dataset.action = "openTransitionBuilder";
  button.dataset.tooltip = game.i18n?.localize("BATTLETRANSITIONS.NAVIGATION.TOOLTIPS.TRANSITIONBUILDER");

  const icon = document.createElement("i");

  icon.classList.add("fa-solid", "fa-fw", "fa-hammer");
  button.appendChild(icon);
  button.innerHTML += game.i18n?.localize("BATTLETRANSITIONS.NAVIGATION.CUSTOM");

  container.appendChild(button);

  const searchElement = html.querySelector(`search`);
  if (searchElement instanceof HTMLElement)
    searchElement.before(container);

  button.addEventListener("click", () => { BattleTransition.BuildTransition().catch(console.error); });

})

function getScene(elem: HTMLElement): Scene | undefined {
  const sceneId = elem.dataset.sceneId;
  if (!sceneId) return undefined;
  return game.scenes?.get(sceneId);
}

function hasTransition(elem: HTMLElement): boolean {
  const scene = getScene(elem);
  if (!(scene instanceof Scene)) return false;

  return ConfigurationHandler.HasTransition(scene, true);
}

function getTransition(elem: HTMLElement): TransitionConfiguration[] {
  const scene = getScene(elem);
  if (!scene) return [];

  if (!ConfigurationHandler.HasTransition(scene)) return [];
  return foundry.utils.deepClone(ConfigurationHandler.GetSceneTransition(scene));
}

Hooks.on("getSceneContextOptions" as Hooks.HookName, (app: foundry.applications.api.ApplicationV2, options: foundry.applications.ux.ContextMenu.Entry<HTMLElement>[]) => {

  if (app instanceof foundry.applications.sidebar.tabs.SceneDirectory || app instanceof foundry.applications.ui.SceneNavigation) {
    // Directory stuff
    options.push({
      label: "BATTLETRANSITIONS.NAVIGATION.TRIGGER",
      icon: `<i class="fa-solid bt-icon fa-fw bt-crossed-swords"></i>`,
      visible(li: HTMLElement) { return hasTransition(li); },
      onClick(e: PointerEvent, elem: HTMLElement) {
        // TODO: Migrate to Scene mixin
        const scene = getScene(elem);
        if (!scene) return;

        const sequence = getTransition(elem);

        if (scene !== canvas?.scene) {
          const sceneChange: SceneChangeConfiguration = {
            ...SceneChangeStep.DefaultSettings,
            id: foundry.utils.randomID(),
            scene: scene.id ?? ""
          };
          sequence.unshift(sceneChange);
        }

        BattleTransition.ExecuteSequence(sequence).catch(console.error);
      }
    }, {
      label: "BATTLETRANSITIONS.NAVIGATION.BYPASS",
      icon: `<i class="fa-solid bt-icon fa-fw bt-step-over"></i>`,
      visible(li: HTMLElement) { return hasTransition(li); },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onClick(e: PointerEvent, elem: HTMLElement) {
        // TODO: Re-implement
      }
    });


  }

  return options;
});
