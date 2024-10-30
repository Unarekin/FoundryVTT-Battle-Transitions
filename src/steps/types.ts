import { SerializedAsset } from "../interfaces";
import { Easing, BilinearDirection, RadialDirection, ClockDirection, WipeDirection } from "../types";

export interface TransitionConfiguration {
  type: string;
  id?: string;
}

interface BGImageTransition {
  backgroundType: "image";
  backgroundImage: string;
  backgroundColor?: never;
}

interface BGColorTransition {
  backgroundType: "color";
  backgroundImage?: never;
  backgroundColor: string;
}

export type BackgroundTransition = BGImageTransition | BGColorTransition & ({
  deserializedTexture?: PIXI.Texture;
  serializedTexture?: SerializedAsset
})

type DurationTransition = {
  duration: number;
}

type AnimatedTransition = DurationTransition & ({
  easing: Easing;
})

type WipeTransition = DurationTransition & BackgroundTransition & TransitionConfiguration & AnimatedTransition;

export type BilinearWipeConfiguration = WipeTransition & ({
  direction: BilinearDirection;
  radial: RadialDirection;
});


export type ClockWipeConfiguration = WipeTransition & ({
  clockDirection: ClockDirection;
  direction: WipeDirection;
});


export type DiamondWipeConfiguration = WipeTransition & ({
  size: number;
});

export type FadeConfiguration = BackgroundTransition & DurationTransition & TransitionConfiguration;

export type FireDissolveConfiguration = DurationTransition & TransitionConfiguration & ({
  burnSize: number;
});

export type LinearWipeConfiguration = WipeTransition & ({
  direction: WipeDirection;
});

export type RadialWipeConfiguration = WipeTransition & ({
  radial: RadialDirection;
});

export interface SoundConfiguration extends TransitionConfiguration {
  file: string;
  volume: number;
}

export type SpotlightWipeConfiguration = WipeTransition & ({
  direction: WipeDirection;
  radial: RadialDirection;
});

export interface TextureSwapConfiguration extends TransitionConfiguration {
  texture: string;
}

export type VideoTransition = BackgroundTransition & ({
  file: string;
  volume: number;
  clear?: boolean;
});


export type WaitConfiguration = TransitionConfiguration & DurationTransition;

export interface ParallelConfiguration extends TransitionConfiguration {
  sequences: TransitionConfiguration[][];
}

export type MeltConfiguration = BackgroundTransition & DurationTransition;


export type WaveWipeConfiguration = WipeTransition & ({
  direction: RadialDirection;
});

export type SpiralWipeConfiguration = WipeTransition & ({
  direction: ClockDirection;
  radial: RadialDirection;
});

export type InvertConfiguration = TransitionConfiguration

export type AngularWipeConfiguration = WipeTransition;

export type FlashConfiguration = BackgroundTransition & DurationTransition;

export type RepeatConfiguration = TransitionConfiguration & ({
  iterations: number;
  sequence: TransitionConfiguration[]
});

export type SceneChangeConfiguration = TransitionConfiguration & ({
  scene: string;
})

// // export interface ChromaKeyConfiguration extends TransitionWithBackground {
// //   keyColor: string;
// // }
