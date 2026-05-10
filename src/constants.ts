import { PreparedTransitionHash } from "./interfaces";

export const COVER_ID = "transition-cover";
export const TRANSLATION_KEY = "BATTLETRANSITIONS";
export const LOG_ICON = "⚔️";

export const CONSTANTS: Record<string, string> = Object.freeze({
  TRANSLATION_KEY: "BATTLETRANSITIONS",
  LOG_ICON: "⚔️",
  TRANSITION_TYPE: "battleTransition"
})

export const CUSTOM_HOOKS: Record<string, Hooks.HookName> = {
  INITIALIZE: `${__MODULE_ID__}.init`,
  TRANSITION_START: `${__MODULE_ID__}.transitionStart`,
  TRANSITION_END: `${__MODULE_ID__}.transitionEnd`,
  SCENE_ACTIVATED: `${__MODULE_ID__}.sceneActivated`,
  SOCKET_SEND_EVENT: `${__MODULE_ID__}.socketSent`,
  SOCKET_RECEIVE_EVENT: `${__MODULE_ID__}.socketReceived`
}


export const PreparedSequences: { [x: string]: PreparedTransitionHash } = {};
