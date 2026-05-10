import { SerializedAsset } from "../interfaces";
import { Easing, BilinearDirection, RadialDirection, ClockDirection, WipeDirection, SizingMode, BackgroundType } from "../types";

export type TargetType = "prompt" | "point" | "oldtoken" | "newtoken" | "oldtile" | "newtile" | "oldnote" | "newnote" | "olddrawing" | "newdrawing";

export const TransitionTypes = ["angularwipe", "barwipe", "bilinearwipe", "bosssplash", "cleareffects", "clockwipe", "diamondwipe", "fade", "firedissolve", "flash", "hueshift", "invert", "linearwipe", "loadingtip", "macro", "melt", "parallel", "pixelate", "radialwipe", "removeoverlay", "restoreoverlay", "repeat", "reverse", "scenechange", "sound", "spiralshutter", "spiralwipe", "spotlightwipe", "startplaylist", "textureswap", "twist", "video", "viewscene", "wait", "wavewipe", "zoomblur", "zoom"] as const;
export type TransitionType = typeof TransitionTypes[number];

export interface TransitionConfiguration {
  type: TransitionType;
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

type WipeTransition = DurationTransition & BackgroundTransition & TransitionConfiguration & AnimatedTransition & ({
  falloff: number;
})

export type BilinearWipeConfiguration = WipeTransition & ({
  type: "bilinearwipe";
  direction: BilinearDirection;
  radial: RadialDirection;
});


export type ClockWipeConfiguration = WipeTransition & ({
  type: "clockwipe";
  clockDirection: ClockDirection;
  direction: WipeDirection;
});


export type DiamondWipeConfiguration = WipeTransition & ({
  type: "diamondwipe";
  size: number;
});

export type FadeConfiguration = BackgroundTransition & DurationTransition & TransitionConfiguration & AnimatedTransition & ({
  type: "fade";
})

export type FireDissolveConfiguration = DurationTransition & TransitionConfiguration & AnimatedTransition & ({
  type: "firedissolve";
  burnSize: number;
});

export type LinearWipeConfiguration = WipeTransition & ({
  type: "linearwipe";
  direction: WipeDirection;
});

export type RadialWipeConfiguration = WipeTransition & TargetedTransition & ({
  type: "radialwipe";
  radial: RadialDirection;
});

export interface SoundConfiguration extends TransitionConfiguration {
  type: "sound";
  file: string;
  volume: number;
}

export type SpotlightWipeConfiguration = WipeTransition & ({
  type: "spotlightwipe";
  direction: WipeDirection;
  radial: RadialDirection;
});

export type TextureSwapConfiguration = TransitionConfiguration & BackgroundTransition & DualTransition & {
  type: "textureswap";
  replace: boolean;
};


export type VideoConfiguration = BackgroundTransition & TransitionConfiguration & ({
  type: "video";
  file: string;
  volume: number;
  clear?: boolean;
  videoSizingMode: SizingMode;
  chromaKey: PIXI.ColorSource;
  chromaRange: [number, number];
  enableChromaKey: boolean;
});


export type WaitConfiguration = TransitionConfiguration & DurationTransition & ({
  type: "wait"
})


export interface ParallelConfiguration extends TransitionConfiguration {
  type: "parallel";
  sequences: TransitionConfiguration[][];
}

export type MeltConfiguration = TransitionConfiguration & BackgroundTransition & DurationTransition & AnimatedTransition & ({
  type: "melt";
});


export type WaveWipeConfiguration = WipeTransition & ({
  type: "wavewipe";
  direction: RadialDirection;
});

export type SpiralShutterConfiguration = WipeTransition & ({
  type: "spiralshutter";
  direction: ClockDirection;
  radial: RadialDirection;
});

export type SpiralWipeConfiguration = WipeTransition & ({
  type: "spiralwipe";
  clockDirection: ClockDirection;
  direction: WipeDirection;
  radial: RadialDirection;

})

export type InvertConfiguration = TransitionConfiguration & DualTransition & ({
  type: "invert";
})

export type AngularWipeConfiguration = WipeTransition & ({
  type: "angularwipe";
})

export type FlashConfiguration = TransitionConfiguration & BackgroundTransition & DurationTransition & DualTransition & ({
  type: "flash";
})

export const RepeatStyles = ["sequence", "previous"] as const;
export type RepeatStyle = typeof RepeatStyles[number];

export type RepeatConfiguration = TransitionConfiguration & ({
  type: "repeat";
  iterations: number;
  sequence?: TransitionConfiguration[];
  delay: number;
  style: RepeatStyle;
});

export type SceneChangeConfiguration = TransitionConfiguration & ({
  type: "scenechange";
  scene: string;
})

export type ViewSceneConfiguration = TransitionConfiguration & ({
  type: "viewscene";
  scene: string;
});

export interface MacroConfiguration extends TransitionConfiguration {
  type: "macro";
  macro: string;
}

// // export interface ChromaKeyConfiguration extends TransitionWithBackground {
// //   keyColor: string;
// // }

export type ReverseConfiguration = TransitionConfiguration & ({
  type: "reverse";
  delay: number;
});
export type RemoveOverlayConfiguration = TransitionConfiguration & ({
  type: "removeoverlay";
});
export type RestoreOverlayConfiguration = TransitionConfiguration & ({
  type: "restoreoverlay";
});
export type ClearEffectsConfiguration = TransitionConfiguration & DualTransition & ({
  type: "cleareffects";
});

export type StartPlaylistConfiguration = TransitionConfiguration & ({
  type: "startplaylist";
});
export type ZoomBlurConfiguration = TransitionConfiguration & DurationTransition & AnimatedTransition & DualTransition & ({
  type: "zoomblur";
  maxStrength: number;
  innerRadius: number;

});

export type TwistConfiguration = TransitionConfiguration & DurationTransition & AnimatedTransition & DualTransition & ({
  type: "twist";
  maxAngle: number;
  direction: ClockDirection;
});

export type BossSplashConfiguration = TransitionConfiguration & DurationTransition & ({
  type: "bosssplash";
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
  type: "pixelate";
  maxSize: number;
})

export type HueShiftConfiguration = TransitionConfiguration & DurationTransition & AnimatedTransition & DualTransition & ({
  type: "hueshift";
  maxShift: number;
})

export type BarWipeConfiguration = WipeTransition & ({
  type: "barwipe";
  direction: "vertical" | "horizontal";
  bars: number;
})

export type TargetedTransition = {
  target: [number, number] | string;
}

export type ZoomArg = [number, number] | string | Token | TokenDocument | Tile | TileDocument | Note | NoteDocument | Drawing | DrawingDocument;

export type ZoomConfiguration = TransitionConfiguration & DurationTransition & AnimatedTransition & BackgroundTransition & DualTransition & TargetedTransition & ({
  type: "zoom";
  amount: number;
  clampBounds: boolean;
});



export type LoadingTipSource = "string" | "rolltable";
export type LoadingTipLocation = "topleft" | "topcenter" | "topright" | "center" | "bottomright" | "bottomcenter" | "bottomleft";

export type LoadingTipConfiguration = TransitionConfiguration & ({
  type: "loadingtip";
  message?: string;
  source: LoadingTipSource;
  table?: string;
  duration: number;
  location: LoadingTipLocation;
  style: Record<string, unknown>;
});
