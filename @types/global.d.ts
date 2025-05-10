declare var __DEV__: boolean;
declare var __MODULE_TITLE__: string;
declare var __MODULE_ID__: string;
declare var __MODULE_VERSION__: string;

declare var TweenMax: any;
declare var gsap: any;
declare var ColorPicker: any;

declare var socketlib: any;
declare var libWrapper: any;

declare module '*.frag' {
  const content: string;
  export default content;
}

declare module '*.vert' {
  const content: string;
  export default content;
}
