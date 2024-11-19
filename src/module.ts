/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { initializeCanvas } from './transitionUtils';
import { CUSTOM_HOOKS } from "./constants";
import { registerHelpers, registerTemplates } from "./templates";
import { ConfigurationHandler } from './ConfigurationHandler';

import SocketHandler from "./SocketHandler";
import { BattleTransition } from "./BattleTransition";
import semver from "semver";
import { awaitHook, log } from './utils';
import { libWrapper } from "./vendor/libwrapper.shim";
import { SceneChangeStep } from './steps';


(window as any).semver = semver;
(window as any).BattleTransition = BattleTransition;


Hooks.once("canvasReady", () => {
  initializeCanvas();
  Hooks.callAll(CUSTOM_HOOKS.INITIALIZE)
})


Hooks.once("init", async () => {
  registerHelpers();
  await registerTemplates();

  if (typeof libWrapper === "function") {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-function-type
    (libWrapper as any).register(__MODULE_ID__, "Scene.prototype.update", function (this: Scene, wrapped: Function, ...args: unknown[]) {

      const delta = args[0] as Partial<Scene>;
      const config = ConfigurationHandler.GetSceneConfiguration(this);

      if (delta.active && config.autoTrigger && config.sequence?.length && !(this.flags[__MODULE_ID__] as any).isTriggered) {
        delete delta.active;
        const sceneChangeStep = new SceneChangeStep({ scene: this.id ?? "" });
        void BattleTransition.executeSequence([
          {
            id: foundry.utils.randomID(),
            ...SceneChangeStep.DefaultSettings,
            ...sceneChangeStep.config
          },
          ...config.sequence
        ]);
        if (Object.keys(delta).length === 0) return false;
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return wrapped(delta);
    }, "MIXED");
  }
});

Hooks.on("renderSceneConfig", (app: SceneConfig, html: JQuery<HTMLElement>, options: any) => {
  void ConfigurationHandler.InjectSceneConfig(app, html, options);
});

Hooks.once("socketlib.ready", () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  SocketHandler.register(socketlib.registerModule(__MODULE_ID__));
});

Hooks.on("getSceneNavigationContext", (html: JQuery<HTMLElement>, buttons: any[]) => {
  ConfigurationHandler.AddToNavigationBar(buttons);
});

Hooks.on("preUpdatePlaylist", (playlist: Playlist, delta: Partial<Playlist>) => {
  if (delta.playing) {
    // log("preUpdatePlaylist:", BattleTransition.SuppressSoundUpdates, delta)
    if (BattleTransition.SuppressSoundUpdates) {
      return false;
    }
  }
});

Hooks.on("preUpdatePlaylistSound", (sound: PlaylistSound, delta: Partial<PlaylistSound>) => {
  if (delta.playing) {
    // log("preUpdatePlaylistSound:", BattleTransition.SuppressSoundUpdates, delta);
    if (BattleTransition.SuppressSoundUpdates) {
      return false;
    }

  }
})

Hooks.on(CUSTOM_HOOKS.TRANSITION_START, (...args: unknown[]) => {
  log("Transition start:", args);
})

Hooks.on(CUSTOM_HOOKS.TRANSITION_END, (...args: unknown[]) => {
  log("Transition end:", args);
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
Hooks.on("updateScene", (scene: Scene, delta: Partial<Scene>, mod: unknown, userId: string) => {
  if (delta.active) {
    if (scene.canUserModify(game.user as User, "update")) void scene.unsetFlag(__MODULE_ID__, "isTriggered");

    awaitHook("canvasReady").then(() => { Hooks.callAll(CUSTOM_HOOKS.SCENE_ACTIVATED, scene); }).catch(console.error);
  }
});