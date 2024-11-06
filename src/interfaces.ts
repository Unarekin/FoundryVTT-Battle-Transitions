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
  sequence: TransitionStep<any>[];
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