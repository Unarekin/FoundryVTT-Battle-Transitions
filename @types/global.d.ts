import * as gsapType from "gsap";

declare global {

  declare var __DEV__: boolean;
  declare var __MODULE_TITLE__: string;
  declare var __MODULE_ID__: string;
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