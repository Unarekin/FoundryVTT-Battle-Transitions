import { test } from "@playwright/test";
import { setupWorld } from "./testFunctions"
import { configureScene } from "./foundryFunctions";

interface WipeSpec {
  name: string;
  key: string;
}

const wipes: WipeSpec[] = [
  { name: "Angular Wipe", key: "angularwipe" },
  { name: "Bar Wipe", key: "barwipe" },
  { name: "Bilinear Wipe", key: "bilinearwipe" },
  { name: "Clock Wipe", key: "clockwipe" },
  { name: "Diamond Wipe", key: "diamondwipe" },
  { name: "Fade", key: "fade" },
  { name: "Fire Dissolve", key: "firedissolve" },
  { name: "Hue Shift", key: "hueshift" },
  { name: "Linear Wipe", key: "linearwipe" },
  { name: "Melt", key: "melt" },
  { name: "Pixelate", key: "pixelate" },
  { name: "Radial Wipe", key: "radialwipe" },
  { name: "Spiral Shutter", key: "spiralshutter" },
  { name: "Spiral Wipe", key: "spiralwipe" },
  { name: "Spotlight Wipe", key: "spotlightwipe" },
  { name: "Twist", key: "twist" },
  { name: "Wave Wipe", key: "wavewipe" },
  { name: "Zoom & Blur", key: "zoomblur" },
  { name: "Zoom", key: "zoom" }
];
const easings: string[] = [
  ...[
    "power1", "power2", "power3", "power4",
    "back", "bounce", "circ", "elastic", "expo", "sine"
  ].map(easing => [`${easing}.in`, `${easing}.out`, `${easing}.inOut`]).flat(),
  "steps", "rough", "slow", "expoScale"
]


wipes.forEach(wipe => {
  test.describe(wipe.name, () => {
    easings.forEach(easing => {
      test(easing, async ({ page }) => {

      })
    })
  })
})
