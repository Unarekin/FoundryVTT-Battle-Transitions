/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { initializeCanvas } from './transitionUtils';
import { CUSTOM_HOOKS } from "./constants";
import { TransitionChain } from "./TransitionChain";
import { registerHelpers, registerTemplates } from "./templates";
import { ConfigurationHandler } from './config/ConfigurationHandler';

import SocketHandler from "./SocketHandler";
import { addNavigationButton } from './utils';
import { TransitionStep } from './interfaces';

(window as any).BattleTransition = TransitionChain;


Hooks.once("canvasReady", () => {
  initializeCanvas();
  Hooks.callAll(CUSTOM_HOOKS.INITIALIZE)
})

Hooks.on("renderSceneConfig", (app: Application) => {
  new ConfigurationHandler(app, (app as any).object as Scene);
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
  addNavigationButton(buttons);
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
Hooks.on("preUpdateScene", (scene: Scene, delta: Partial<Scene>, mod: unknown, userId: string) => {
  if (delta.active && !(scene.getFlag(__MODULE_ID__, "autoTriggered") as boolean ?? false)) {
    const config: any = scene.getFlag(__MODULE_ID__, "config");
    const steps: TransitionStep[] = scene.getFlag(__MODULE_ID__, "steps");

    if (config?.autoTrigger && steps?.length) {
      // SocketHandler.autoTrigger(steps);
      delta.active = false;
      SocketHandler.transition(scene.id as string, steps);
    }
  }
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
Hooks.on("updateScene", async (scene: Scene, delta: Partial<Scene>, mod: unknown, userId: string) => {
  if (delta.active && (scene.getFlag(__MODULE_ID__, "autoTriggered") as boolean ?? false)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    await (scene as any).setFlag(__MODULE_ID__, "autoTriggered", false);
  }
})