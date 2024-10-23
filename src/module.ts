/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { initializeCanvas } from './transitionUtils';
import BattleTransitions from "./BattleTransitions";
import { CUSTOM_HOOKS } from "./constants"
import { TransitionChain } from "./TransitionChain"
import { registerHelpers, registerTemplates } from "./templates"
import { ConfigurationHandler } from './config/ConfigurationHandler';

// CONFIG.debug.hooks = true;

(window as any).BattleTransitions = BattleTransitions;
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
})

