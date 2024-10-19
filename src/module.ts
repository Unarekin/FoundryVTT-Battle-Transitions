/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { initializeCanvas } from './transitionUtils';
import BattleTransitions from "./BattleTransitions";
import { CUSTOM_HOOKS } from "./constants"
import { TransitionChain } from "./TransitionChain"

(window as any).BattleTransitions = BattleTransitions;
(window as any).BattleTransition = TransitionChain;


Hooks.once("canvasReady", () => {
  initializeCanvas();
  Hooks.callAll(CUSTOM_HOOKS.INITIALIZE)
})

