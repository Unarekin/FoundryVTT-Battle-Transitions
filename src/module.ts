/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { initializeCanvas } from './transitionUtils';
import { CUSTOM_HOOKS } from "./constants";
import { registerHelpers, registerTemplates } from "./templates";
import { ConfigurationHandler } from './ConfigurationHandler';

import SocketHandler from "./SocketHandler";
import { BattleTransition } from "./BattleTransition";

import semver from "semver";
import { SceneChangeConfiguration } from './steps';

(window as any).semver = semver;
(window as any).BattleTransition = BattleTransition;


Hooks.once("canvasReady", () => {
  initializeCanvas();
  Hooks.callAll(CUSTOM_HOOKS.INITIALIZE)
})



Hooks.once("init", async () => {
  registerHelpers();
  await registerTemplates();
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
Hooks.on("preUpdateScene", (scene: Scene, delta: Partial<Scene>, mod: unknown, userId: string) => {
  if (delta.active) {
    const config = ConfigurationHandler.GetSceneConfiguration(scene);
    if (!config.isTriggered && config.autoTrigger) {
      delta.active = false;
      void new BattleTransition(scene).execute({
        caller: game.user?.id ?? "",
        remote: false,
        sequence: [
          { type: "scenechange", scene: scene.id, version: "1.1.0" } as SceneChangeConfiguration,
          ...config.sequence
        ]
      })

    }

  }
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
Hooks.on("updateScene", (scene: Scene, delta: Partial<Scene>, mod: unknown, userId: string) => {
  if (delta.active) {
    Hooks.callAll(CUSTOM_HOOKS.SCENE_ACTIVATED, scene);
    if (scene.canUserModify(game.user as User, "update")) void scene.unsetFlag(__MODULE_ID__, "isTriggered");
  }

})