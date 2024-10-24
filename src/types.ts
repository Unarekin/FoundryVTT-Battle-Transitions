export type WipeDirection = "left" | "right" | "top" | "bottom" | "bottomleft" | "bottomright" | "topleft" | "topright";
export type ClockDirection = "clockwise" | "counterclockwise";
export type RadialDirection = "inside" | "outside";

export type BilinearDirection = "horizontal" | "vertical" | "topleft" | "bottomleft" | "topright" | "bottomright";

export interface TransitionStep {
  type: string;
  [x: string]: unknown;
}

interface TransitionConfiguration {
  id?: string;
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
}

export interface WaitConfiguration extends TransitionConfiguration {
  duration: number;
}
