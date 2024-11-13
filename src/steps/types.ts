import { SerializedAsset } from "../interfaces";
import { Easing, BilinearDirection, RadialDirection, ClockDirection, WipeDirection, SizingMode, BackgroundType } from "../types";

export interface TransitionConfiguration {
  type: string;
  id?: string;
  version: string;
}


export interface BackgroundTransition {
  deserializedTexture?: PIXI.Texture;
  serializedTexture?: SerializedAsset;
  bgSizingMode: SizingMode;
  backgroundType: BackgroundType;
  backgroundImage?: string;
  backgroundColor?: string;
}


type DurationTransition = {
  duration: number;
}

export type AnimatedTransition = DurationTransition & ({
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

export type FadeConfiguration = BackgroundTransition & DurationTransition & TransitionConfiguration & AnimatedTransition;

export type FireDissolveConfiguration = DurationTransition & TransitionConfiguration & AnimatedTransition & ({
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

export type TextureSwapConfiguration = TransitionConfiguration & BackgroundTransition;


export type VideoConfiguration = BackgroundTransition & TransitionConfiguration & ({
  file: string;
  volume: number;
  clear?: boolean;
  videoSizingMode: SizingMode;
});


export type WaitConfiguration = TransitionConfiguration & DurationTransition;

export interface ParallelConfiguration extends TransitionConfiguration {
  sequences: TransitionConfiguration[][];
}

export type MeltConfiguration = TransitionConfiguration & BackgroundTransition & DurationTransition & AnimatedTransition;


export type WaveWipeConfiguration = WipeTransition & ({
  direction: RadialDirection;
});

export type SpiralShutterConfiguration = WipeTransition & ({
  direction: ClockDirection;
  radial: RadialDirection;
});

export type SpiralWipeConfiguration = WipeTransition & ({
  clockDirection: ClockDirection;
  direction: WipeDirection;
  radial: RadialDirection;

})

export type InvertConfiguration = TransitionConfiguration

export type AngularWipeConfiguration = WipeTransition;

export type FlashConfiguration = TransitionConfiguration & BackgroundTransition & DurationTransition;

export type RepeatConfiguration = TransitionConfiguration & ({
  iterations: number;
  sequence: TransitionConfiguration[]
});

export type SceneChangeConfiguration = TransitionConfiguration & ({
  scene: string;
})

export interface MacroConfiguration extends TransitionConfiguration {
  macro: string;
}

// // export interface ChromaKeyConfiguration extends TransitionWithBackground {
// //   keyColor: string;
// // }

export type RemoveOverlayConfiguration = TransitionConfiguration;
export type RestoreOverlayConfiguration = TransitionConfiguration;

export type StartPlaylistConfiguration = TransitionConfiguration;
export type ZoomBlurConfiguration = TransitionConfiguration & DurationTransition & AnimatedTransition & ({
  maxStrength: number;
  innerRadius: number;

});

export type TwistConfiguration = TransitionConfiguration & DurationTransition & AnimatedTransition & ({
  maxAngle: number;
  direction: ClockDirection;
});