export type WipeDirection = "left" | "right" | "top" | "bottom" | "bottomleft" | "bottomright" | "topleft" | "topright";
export type ClockDirection = "clockwise" | "counterclockwise";
export type RadialDirection = "inside" | "outside";

export type TransitionStep = (container: PIXI.DisplayObject) => Promise<void>;

export type BilinearDirection = "horizontal" | "vertical" | "topleft" | "bottomleft" | "topright" | "bottomright";