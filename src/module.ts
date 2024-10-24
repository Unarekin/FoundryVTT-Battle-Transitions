/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { initializeCanvas } from './transitionUtils';
import { CUSTOM_HOOKS } from "./constants"
import { TransitionChain } from "./TransitionChain"
import { registerHelpers, registerTemplates } from "./templates"
import { ConfigurationHandler } from './config/ConfigurationHandler';

import SocketHandler from "./SocketHandler";

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
})