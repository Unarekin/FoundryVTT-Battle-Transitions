import { PreparedTransitionHash } from "./interfaces";

export const COVER_ID = "transition-cover";
export const TRANSLATION_KEY = "BATTLETRANSITIONS";
export const LOG_ICON = "⚔️";

export const CUSTOM_HOOKS = {
  INITIALIZE: `${__MODULE_ID__}.init`,
  TRANSITION_START: `${__MODULE_ID__}.transitionStart`,
  TRANSITION_END: `${__MODULE_ID__}.transitionEnd`,
  SCENE_ACTIVATED: `${__MODULE_ID__}.sceneActivated`
}


export const PreparedSequences: { [x: string]: PreparedTransitionHash } = {};
