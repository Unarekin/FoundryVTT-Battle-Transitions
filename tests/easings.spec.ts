import { test, expect } from "@playwright/test";
import { loginToWorld, setupWorld } from "./testFunctions"
import { awaitHook, configureScene, getSceneFlag } from "./foundryFunctions";

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
  ].map(easing => [`${easing}in`, `${easing}out`, `${easing}inOut`]).flat(),
  "steps", "rough", "slow", "expoScale"
]

import { promises as fs } from "fs";
import path from 'path';

test("Angular Wipe None", async ({ page }) => {
  // Connect to world
  await test.step("Setup", async () => {
    await setupWorld(page, "battle-transitions-v12");
  });

  // Open scene configuration
  await test.step("Configuration", async () => {
    await configureScene(page, "Scene 1");
    await page.locator(`nav.tabs a[data-tab="battle-transitions"]`).click();
    // Add transition step
    await page.locator(`button[data-action="add-step"]`).click();
    await page.locator(`.transition-config button[data-transition="angularwipe"]`).click();
    await page.locator(`.step-config-item[data-transition-type="angularwipe"] select#easing`).selectOption("circin");
    await page.locator(`dialog:has(.step-config-item[data-transition-type="angularwipe"]) button[data-action="ok"]`).click();
    await page.locator(`.scene-sheet button[type='submit']`).click();
  });

  test.step("Verification", async () => {
    // Verify step JSON saved in main form
    const stepId = await page.locator(`#transition-step-list [data-transition-type='angularwipe']`).getAttribute("data-id");

    const expectedJSON = [{
      id: stepId,
      type: "angularwipe",
      easing: "circin",
      version: "1.1.0",
      bgSizingMode: "stretch",
      backgroundType: "color",
      backgroundImage: "",
      backgroundColor: "#00000000",
      label: "",
      serializedTexture: "",
      duration: 1000
    }]


    const sequence = await getSceneFlag(page, "Scene 1", "sequence");
    expect(sequence).toEqual(expectedJSON);
  });

})


// wipes.forEach(wipe => {
//   test.describe(wipe.name, () => {
//     easings.forEach(easing => {
//       test(easing, async ({ page }) => {

//       })
//     })
//   })
// })


test.afterEach(async ({ browser }) => {
  const page = await browser.newPage();
  await page.goto("http://localhost:20000")
  await page.waitForLoadState("networkidle");
  await loginToWorld(page);
  await awaitHook(page, "ready");
  await page.screenshot({ path: 'cleanup.png' });
  await page.evaluate(async name => {
    const scene = game?.scenes?.getName(name);
    if (!scene) throw new Error(`Unknown scene: ${name}`);
    await scene.unsetFlag("battle-transitions", "sequence");
  }, "Scene 1");
})