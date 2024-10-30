import { TransitionConfiguration } from './steps';

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
  remote?: boolean;
  sequence: TransitionConfiguration[];
}