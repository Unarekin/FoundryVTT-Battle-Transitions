import { BilinearDirection, ClockDirection, RadialDirection, WipeDirection } from "./types";

export interface TransitionConfigHandler<t extends object> {
  key: string;
  name: string;

  defaultSettings: t;
  renderTemplate(flag?: t): Promise<string>;
  createFlagFromHTML(html: HTMLElement | JQuery<HTMLElement>): t;
  generateSummary(flag?: t): string;
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

interface TransitionConfiguration {
  id?: string;
  easing?: string;
}

export interface BilinearWipeConfiguration extends TransitionConfiguration {
  duration: number;
  direction: BilinearDirection;
  radial: RadialDirection;
  background: string;
}

export interface ChromaKeyConfiguration extends TransitionConfiguration {
  keyColor: string;
  background: string;
}


export interface ClockWipeConfiguration extends TransitionConfiguration {
  clockdirection: ClockDirection;
  direction: WipeDirection,
  duration: number;
  background: string;
}

export interface DiamondTransitionConfiguration extends TransitionConfiguration {
  size: number;
  background: string;
  duration: number;
}

export interface FadeConfiguration extends TransitionConfiguration {
  duration: number;
  background: string;
}


export interface FireDissolveConfiguration extends TransitionConfiguration {
  duration: number;
  background: string;
  burnSize: number;
}


export interface LinearWipeConfiguration extends TransitionConfiguration {
  direction: WipeDirection;
  duration: number;
  background: string;
}

export interface RadialWipeConfiguration extends TransitionConfiguration {
  duration: number;
  background: string;
  radial: RadialDirection;
}

export interface SoundConfiguration extends TransitionConfiguration {
  file: string;
  volume: number;
}


export interface SpotlightWipeConfiguration extends TransitionConfiguration {
  duration: number;
  direction: WipeDirection;
  radial: RadialDirection;
  background: string;
}

export interface TextureSwapConfiguration extends TransitionConfiguration {
  texture: string;
}

export interface VideoConfiguration extends TransitionConfiguration {
  file: string;
  background: string;
  volume: number;
  clear?: boolean;
}

export interface WaitConfiguration extends TransitionConfiguration {
  duration: number;
}

export interface ParallelConfiguration extends TransitionConfiguration {
  sequences: TransitionStep[][];
}

export interface MeltConfiguration extends TransitionConfiguration {
  background: string;
  duration: number;
}

export interface GlitchConfiguration extends TransitionConfiguration {
  background: string;
  duration: number;
}

export interface AngularWipeConfiguration extends TransitionConfiguration {
  duration: number;
  background: string;
}

export interface SawWipeConfiguration extends TransitionConfiguration {
  duration: number;
  background: string;
  direction: RadialDirection;
}