import { BackgroundType, BilinearDirection, ClockDirection, RadialDirection, WipeDirection } from "./types";

export interface TransitionConfigHandler<t extends object> {
  key: string;
  name: string;

  skipConfig?: boolean;
  defaultSettings: t;
  validate(flag: t): boolean;
  renderTemplate(flag: t): Promise<string>;
  createFlagFromHTML(html?: HTMLElement | JQuery<HTMLElement>): t;
  generateSummary(flag: t): string;
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



export interface TransitionStep {
  type: string;
  [x: string]: unknown;
}

export interface TransitionConfiguration {
  id?: string;
  easing?: string;
}

export interface TransitionWithBackground extends TransitionConfiguration {
  backgroundImage?: string;
  backgroundColor?: string;
  backgroundType?: BackgroundType;
  background?: string | DataURLBuffer | TextureBuffer;
  deserializedBackground?: PIXI.Texture;
}

export interface BilinearWipeConfiguration extends TransitionWithBackground {
  duration: number;
  direction: BilinearDirection;
  radial: RadialDirection;
}

export interface ChromaKeyConfiguration extends TransitionWithBackground {
  keyColor: string;
}


export interface ClockWipeConfiguration extends TransitionWithBackground {
  clockdirection: ClockDirection;
  direction: WipeDirection,
  duration: number;
}

export interface DiamondTransitionConfiguration extends TransitionWithBackground {
  size: number;
  duration: number;
}

export interface FadeConfiguration extends TransitionWithBackground {
  duration: number;
}


export interface FireDissolveConfiguration extends TransitionConfiguration {
  duration: number;
  burnSize: number;
}


export interface LinearWipeConfiguration extends TransitionWithBackground {
  direction: WipeDirection;
  duration: number;
}

export interface RadialWipeConfiguration extends TransitionWithBackground {
  duration: number;
  radial: RadialDirection;
}

export interface SoundConfiguration extends TransitionConfiguration {
  file: string;
  volume: number;
}


export interface SpotlightWipeConfiguration extends TransitionWithBackground {
  duration: number;
  direction: WipeDirection;
  radial: RadialDirection;
}

export interface TextureSwapConfiguration extends TransitionConfiguration {
  texture: string;
}

export interface VideoConfiguration extends TransitionWithBackground {
  file: string;
  volume: number;
  clear?: boolean;
}

export interface WaitConfiguration extends TransitionConfiguration {
  duration: number;
}

export interface ParallelConfiguration extends TransitionConfiguration {
  sequences: TransitionStep[][];
}

export interface MeltConfiguration extends TransitionWithBackground {
  duration: number;
}

export interface AngularWipeConfiguration extends TransitionWithBackground {
  duration: number;
}

export interface WaveWipeConfiguration extends TransitionWithBackground {
  duration: number;
  direction: RadialDirection;
}

export interface SpiralWipeConfiguration extends TransitionWithBackground {
  duration: number;
  direction: ClockDirection;
  radial: RadialDirection;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface InvertConfiguration extends TransitionConfiguration {
}