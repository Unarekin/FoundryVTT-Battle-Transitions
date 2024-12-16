// export const WipeDirections = ["left", "right", "top", "bottom", "bottomleft", "bottomright", "topleft", "topright"] as const;
export const WipeDirections = ["top", "topright", "right", "bottomright", "bottom", "bottomleft", "left", "topleft"] as const;
export type WipeDirection = typeof WipeDirections[number];

export const ClockDirections = ["clockwise", "counterclockwise"] as const;
export type ClockDirection = typeof ClockDirections[number];

export const BilinearDirections = ["horizontal", "vertical", "topleft", "topright", "bottomleft", "bottomright"] as const;
export type BilinearDirection = typeof BilinearDirections[number];

export const RadialDirections = ["inside", "outside"] as const;
export type RadialDirection = typeof RadialDirections[number];

export const Easings = ["none",
  "power1.out", "power1.in", "power1.inOut",
  "power2.in", "power2.out", "power2.inOut",
  "power3.in", "power3.out", "power3.inOut",
  "power4.in", "power4.out", "power4.inOut",
  "back.in", "back.out", "back.inOut",
  "bounce.in", "bounce.out", "bounce.inOut",
  "circ.in", "circ.out", "circ.inOut",
  "elastic.in", "elastic.out", "elastic.inOut",
  "expo.in", "expo.out", "expo.inOut",
  "sine.in", "sine.out", "sine.inOut",
  "steps", "rough", "slow", "expoScale"
] as const;
export type Easing = typeof Easings[number];

export const BackgroundTypes = ["color", "image", "overlay"] as const;
export type BackgroundType = typeof BackgroundTypes[number];


export type TextureLike = PIXI.TextureSource | PIXI.ColorSource;

export const SizingModes = ["stretch", "contain", "cover", "center"] as const;
export type SizingMode = typeof SizingModes[number];

export enum DualStyle {
  Overlay = 0,
  Scene = 1,
  Both = 2
}