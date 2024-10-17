/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { initializeCanvas } from './transitionUtils';
import BattleTransitions from "./BattleTransitions";

(window as any).BattleTransitions = BattleTransitions;



Hooks.once("canvasReady", () => {
  initializeCanvas();
})

