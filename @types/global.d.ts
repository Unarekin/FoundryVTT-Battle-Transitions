declare var __DEV__: boolean;
declare var __MODULE_TITLE__: string;
declare var __MODULE_ID__: string;
declare var __MODULE_VERSION__: string;

declare var BattleTransitions: {
  [x: string]: unknown,
  Filters: { [x: string]: PIXI.Filter },
  Presets: { [x: string]: uknown }
};

declare var TweenMax: any;
declare var gsap: any;

declare module '*.frag' {
  const content: string;
  export default content;
}

declare module '*.vert' {
  const content: string;
  export default content;
}
