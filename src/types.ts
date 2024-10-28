export type WipeDirection = "left" | "right" | "top" | "bottom" | "bottomleft" | "bottomright" | "topleft" | "topright";
export type ClockDirection = "clockwise" | "counterclockwise";
export type RadialDirection = "inside" | "outside";

export type BilinearDirection = "horizontal" | "vertical" | "topleft" | "bottomleft" | "topright" | "bottomright";

export type Easing = "none"
  | "power1.out" | "power1.in" | "power1.inOut"
  | "power2.in" | "power2.out" | "power2.inOut"
  | "power3.in" | "power3.out" | "power3.inOut"
  | "power4.in" | "power4.out" | "power4.inOut"
  | "back.in" | "back.out" | "back.inOut"
  | "bounce.in" | "bounce.out" | "bounce.inOut"
  | "circ.in" | "circ.out" | "circ.inOut"
  | "elastic.in" | "elastic.out" | "elastic.inOut"
  | "expo.in" | "expo.out" | "expo.inOut"
  | "sine.in" | "sine.out" | "sine.inOut"
  | "steps"
  | "rough"
  | "slow"
  | "expoScale"


export type BackgroundType = "color" | "image"