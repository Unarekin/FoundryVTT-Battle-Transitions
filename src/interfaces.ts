import { TransitionConfiguration, TransitionStep } from './steps';

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TextureBuffer {
  width: number;
  height: number;
  buffer: Uint8Array;
}

export interface DataURLBuffer {
  mimeType: string;
  buffer: Uint8Array;
}

export type SerializedAsset = TextureBuffer | DataURLBuffer | string;

export interface SocketMessage {
  id: string;
  timestamp: number;
  sender: string;
  name: string;
  users: string[];
  args: unknown[];
}

export interface TransitionSequence {
  caller: string;
  id: string;
  sequence: TransitionConfiguration[];
}

export interface PreparedTransitionSequence {
  caller: string;
  remote?: boolean;
  sequence: TransitionStep<TransitionConfiguration>[];
  sceneFilters: PIXI.Filter[];
}

export interface SceneConfiguration {
  autoTrigger: boolean;
  sequence: TransitionConfiguration[];
  version: string;
  isTriggered?: boolean;
  bypassTransition?: boolean;
}

export interface PreparedTransitionHash {
  original: TransitionSequence;
  prepared: PreparedTransitionSequence;
  overlay: PIXI.DisplayObject[];
}

export interface ExportedTransition {
  author: string;
  description?: string;
  version: number;
  sequence: TransitionConfiguration[]
}

export interface vec2 {
  x: number;
  y: number;
}

export interface vec3 {
  x: number;
  y: number;
  z: number;
}

export interface vec4 {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface BTScene extends Scene {
  battleTransitionConfiguration: SceneConfiguration;
  battleTransition: TransitionConfiguration[];
  hasBattleTransition: boolean;
}

export interface SceneTransition {
  activeOnly: boolean;
  duration: number;
  type: string;
}

export interface StepConfigurationDefinition {
  id: string;
  label: string;
  cls: typeof TransitionStep;
  default: TransitionConfiguration;
}

export interface BTTextureLoader extends foundry.canvas.TextureLoader {
  hideLoadingBar: boolean;
  isPreloading: boolean;
}