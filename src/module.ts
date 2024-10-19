/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { initializeCanvas } from './transitionUtils';
import BattleTransitions from "./BattleTransitions";
import { ChainableTransition } from './ChainableTransition';

(window as any).BattleTransitions = BattleTransitions;
(window as any).BattleTransition = ChainableTransition;


Hooks.once("canvasReady", () => {
  initializeCanvas();
})

