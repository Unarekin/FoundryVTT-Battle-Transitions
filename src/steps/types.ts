import { SerializedAsset } from "../interfaces";
import { Easing, BilinearDirection, RadialDirection, ClockDirection, WipeDirection, SizingMode, BackgroundType } from "../types";

export interface TransitionConfiguration {
  type: string;
  label?: string;
  id: string;
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

export interface DualTransition {
  applyToScene: boolean;
  applyToOverlay: boolean;
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
  sequence?: TransitionConfiguration[];
  delay: number;
  style: "sequence" | "previous";
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
export type ClearEffectsConfiguration = TransitionConfiguration;

export type StartPlaylistConfiguration = TransitionConfiguration;
export type ZoomBlurConfiguration = TransitionConfiguration & DurationTransition & AnimatedTransition & ({
  maxStrength: number;
  innerRadius: number;

});

export type TwistConfiguration = TransitionConfiguration & DurationTransition & AnimatedTransition & ({
  maxAngle: number;
  direction: ClockDirection;
});

export type BossSplashConfiguration = TransitionConfiguration & DurationTransition & ({
  actor: string;
  topColor: string;
  midColor: string;
  botColor: string;

  fontColor: string;
  fontShadow: string;
  subColor: string;
  subShadow: string;

  sound?: string;
  font: string;
  fontSize: string;

  subSize: string;
  message?: string;
  subText?: string;

  animationDelay: number;
  animationDuration: number;

});

export type PixelateConfiguration = TransitionConfiguration & DurationTransition & AnimatedTransition & DualTransition & ({
  maxSize: number;
})

export type HueShiftConfiguration = TransitionConfiguration & DurationTransition & AnimatedTransition & ({
  maxShift: number;
})

export type BarWipeConfiguration = WipeTransition & ({
  direction: "vertical" | "horizontal";
  bars: number;
})



export type ZoomArg = [number, number] | string | Token | TokenDocument | Tile | TileDocument | Note | NoteDocument | Drawing | DrawingDocument;

export type ZoomConfiguration = TransitionConfiguration & DurationTransition & AnimatedTransition & BackgroundTransition & ({
  amount: number;
  clampBounds: boolean;
  target: [number, number] | string;
});



export type LoadingTipSource = "string" | "rolltable";
export type LoadingTipLocation = "topleft" | "topcenter" | "topright" | "center" | "bottomright" | "bottomcenter" | "bottomleft";

export type LoadingTipConfiguration = TransitionConfiguration & ({
  message?: string;
  source: LoadingTipSource;
  table?: string;
  duration: number;
  location: LoadingTipLocation;
  style: object;
});
