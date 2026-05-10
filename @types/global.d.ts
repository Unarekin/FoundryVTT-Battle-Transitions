import * as gsapType from "gsap";
import { BTScene, SceneConfiguration, SceneTransition } from "interfaces";
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

  declare var _loc: (stringId: string, data?: Record<string, unknown>) => string;

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

  interface CONFIG {
    Canvas: {
      sceneTransitions: Record<string, {
        id: string;
        label: string;
        defaultDuration: number;
        filterClass: typeof foundry.canvas.rendering.filters.TextureTransitionFilter;
      }>
    }
    BattleTransitions: {

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

  // TODO: Remove when fvtt-types adds v14 support
  interface Scene {
    transition: SceneTransition;
  }

  interface Canvas {
    transition: foundry.canvas.containers.UnboundContainer;
    scene: BTScene;
  }

}

