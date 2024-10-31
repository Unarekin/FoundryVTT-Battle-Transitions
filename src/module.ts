/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { initializeCanvas } from './transitionUtils';
import { CUSTOM_HOOKS } from "./constants";
import { registerHelpers, registerTemplates } from "./templates";
import { ConfigurationHandler } from './ConfigurationHandler';

import SocketHandler from "./SocketHandler";
import { BattleTransition } from "./BattleTransition";
import { TransitionConfiguration } from './steps';

import semver from "semver";

(window as any).semver = semver;

(window as any).BattleTransition = BattleTransition;


Hooks.once("canvasReady", () => {
  initializeCanvas();
  Hooks.callAll(CUSTOM_HOOKS.INITIALIZE)
})

Hooks.on("renderSceneConfig", (app: Application, html: JQuery<HTMLElement>, options: any) => {
  ConfigurationHandler.InjectSceneConfig(app, html, options);
});


Hooks.once("init", async () => {
  registerHelpers();
  await registerTemplates();
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
  if (delta.active && !(scene.getFlag(__MODULE_ID__, "autoTriggered") as boolean ?? false)) {
    const config: any = scene.getFlag(__MODULE_ID__, "config");
    const steps: TransitionConfiguration[] = scene.getFlag(__MODULE_ID__, "steps");

    if (config?.autoTrigger && steps?.length) {
      // SocketHandler.autoTrigger(steps);
      delta.active = false;
      void SocketHandler.execute({
        caller: game.user?.id ?? "",
        sequence: steps
      });
    }
  }
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
Hooks.on("updateScene", async (scene: Scene, delta: Partial<Scene>, mod: unknown, userId: string) => {
  if (delta.active) Hooks.callAll(CUSTOM_HOOKS.SCENE_ACTIVATED, scene);
  if (delta.active && (scene.getFlag(__MODULE_ID__, "autoTriggered") as boolean ?? false)) {
    if (scene.canUserModify(game.users?.current as User, "update")) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      await (scene as any).setFlag(__MODULE_ID__, "autoTriggered", false);
    }
  }
})