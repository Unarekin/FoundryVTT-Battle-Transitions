/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { initializeCanvas } from './transitionUtils';
import BattleTransitions from "./BattleTransitions";
import { CUSTOM_HOOKS } from "./constants"
import { TransitionChain } from "./TransitionChain"
import { injectConfigUI } from './utils';
import { registerHelpers, registerTemplates } from "./templates"

// CONFIG.debug.hooks = true;

(window as any).BattleTransitions = BattleTransitions;
(window as any).BattleTransition = TransitionChain;


Hooks.once("canvasReady", () => {
  initializeCanvas();
  Hooks.callAll(CUSTOM_HOOKS.INITIALIZE)
})

Hooks.on("renderSceneConfig", async (app: Application, html: JQuery<HTMLElement>) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  await injectConfigUI(html, (app as any).object);
});


Hooks.once("init", async () => {
  registerHelpers();
  await registerTemplates();
})