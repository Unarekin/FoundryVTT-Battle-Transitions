import { TransitionConfiguration, TransitionStep } from './steps';

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
}


export interface TransitionBuilderOptions extends ApplicationOptions {
  scene?: string;
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