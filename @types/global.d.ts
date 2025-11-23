import * as gsapType from "gsap";
import { SceneConfiguration } from "interfaces";

declare global {

  declare var __DEV__: boolean;
  declare var __MODULE_TITLE__: string;
  const __MODULE_ID__ = "battle-transitions";
  declare var __MODULE_VERSION__: string;

  declare var ColorPicker: any;

  declare var socketlib: any;
  declare var libWrapper: any;

  declare var gsap: gsapType;
  declare var TweenMax: gsapType.TweenMax;
  declare var TweenLite: gsapType.TweenLite;

  declare module '*.frag' {
    const content: string;
    export default content;
  }

  declare module '*.vert' {
    const content: string;
    export default content;
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
    }
  }

  interface FlagConfig {
    Scene: {
      [__MODULE_ID__]: SceneConfiguration
    }
  }
}

