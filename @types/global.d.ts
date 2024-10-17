declare var __DEV__: boolean;
declare var __MODULE_TITLE__: string;
declare var __MODULE_ID__: string;
declare var __MODULE_VERSION__: string;

declare module '*.frag' {
  const content: string;
  export default content;
}

declare module '*.vert' {
  const content: string;
  export default content;
}