import * as gsapType from "gsap";
import { SceneConfiguration } from "interfaces";
import { libWrapper as libwrapperType } from "./libwrapper"
import { BattleTransition as BattleTransitionType } from "BattleTransition";
import { SocketHandler } from "sockets";
import { semver as semverType } from "semver";

declare global {

  declare var __DEV__: boolean;
  declare var __MODULE_TITLE__: string;
  const __MODULE_ID__ = "battle-transitions";
  declare var __MODULE_VERSION__: string;

  declare var ColorPicker: any;

  declare var libWrapper: typeof libwrapperType;

  declare var gsap: gsapType;
  declare var TweenMax: gsapType.TweenMax;
  declare var TweenLite: gsapType.TweenLite;

  declare var semver: semverType;
  declare var BattleTransition: typeof BattleTransitionType;


  declare module '*.frag' {
    const content: string;
    export default content;
  }

  declare module '*.vert' {
    const content: string;
    export default content;
  }

  declare interface Game {
    BattleTransitions: {
      transition: typeof BattleTransition;
      socket: SocketHandler;
    }
  }
}

declare module "fvtt-types/configuration" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Hooks {
    interface HookConfig {
      "battle-transitions.init": () => void;
      "battle-transitions.transitionStart": (transition: TransitionConfiguration) => void;
      "battle-transitions.transitionEnd": (transition: TransitionConfiguration) => void;
      "battle-transitions.sceneActivated": (scene: Scene) => void;
      "battle-transitions.socketSent": (message: string) => boolean;
      "battle-transitions.socketReceived": (message: string) => void;
    }
  }

  interface FlagConfig {
    Scene: {
      [__MODULE_ID__]: SceneConfiguration
    }
  }

  interface CONFIG {
    BattleTransitions: {

    }
  }
}

