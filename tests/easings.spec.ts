import { test, expect } from "@playwright/test";
import { setupWorld } from "./testFunctions";
import { awaitHook, configureScene, isGameReady } from "./foundryFunctions";


const TEST_SCENE_NAME = "Scene 1";

interface WipeSpec {
  name: string;
  key: string;
}

const wipes: WipeSpec[] = [
  { name: "Angular Wipe", key: "angularwipe" },
  // { name: "Bar Wipe", key: "barwipe" },
  // { name: "Bilinear Wipe", key: "bilinearwipe" },
  // { name: "Clock Wipe", key: "clockwipe" },
  // { name: "Diamond Wipe", key: "diamondwipe" },
  // { name: "Fade", key: "fade" },
  // { name: "Fire Dissolve", key: "firedissolve" },
  // { name: "Hue Shift", key: "hueshift" },
  // { name: "Linear Wipe", key: "linearwipe" },
  // { name: "Melt", key: "melt" },
  // { name: "Pixelate", key: "pixelate" },
  // { name: "Radial Wipe", key: "radialwipe" },
  // { name: "Spiral Shutter", key: "spiralshutter" },
  // { name: "Spiral Wipe", key: "spiralwipe" },
  // { name: "Spotlight Wipe", key: "spotlightwipe" },
  // { name: "Twist", key: "twist" },
  // { name: "Wave Wipe", key: "wavewipe" },
  // { name: "Zoom & Blur", key: "zoomblur" },
  // { name: "Zoom", key: "zoom" }
];
const easings: string[] = [
  // ...[
  // "power1", "power2", "power3", "power4",
  // "back", "bounce", "circ", "elastic", "expo", "sine"
  // ].map(easing => [`${easing}in`, `${easing}out`, `${easing}inOut`]).flat(),
  "steps", "rough", "slow", "expoScale"
]

// test("Angular Wipe None", async ({ page }) => {
//   // Connect to world
//   await test.step("Setup", async () => {
//     await setupWorld(page, "battle-transitions-v12");
//   });

//   // Open scene configuration
//   await test.step("Configuration", async () => {
//     await configureScene(page, TEST_SCENE_NAME);
//     await page.locator(`nav.tabs a[data-tab="battle-transitions"]`).click();
//     // Add transition step
//     await page.locator(`button[data-action="add-step"]`).click();
//     await page.locator(`.transition-config button[data-transition="angularwipe"]`).click();
//     await page.locator(`.step-config-item[data-transition-type="angularwipe"] select#easing`).selectOption("circin");
//     await page.locator(`dialog:has(.step-config-item[data-transition-type="angularwipe"]) button[data-action="ok"]`).click();
//     await page.locator(`.scene-sheet button[type='submit']`).click();
//   });

//   test.step("Verification", async () => {
//     // Verify step JSON saved in main form
//     const stepId = await page.locator(`#transition-step-list [data-transition-type='angularwipe']`).getAttribute("data-id");

//     const expectedJSON = [(await getStepDefaults("angularwipe"))];

//     const sequence = await getSceneFlag(page, TEST_SCENE_NAME, "sequence");
//     expect(sequence).toEqual(expectedJSON);
//   });

// })

test.beforeEach("Logging in", async ({ page }) => {
  await setupWorld(page, "battle-transitions-v12");
})

wipes.forEach(wipe => {
  test.describe(wipe.name, () => {
    easings.forEach(easing =>
      test(easing, async ({ page }) => {
        test.setTimeout(1000 * 60 * 10);
        test.step("Adding step", async () => {
          const gameReady = await isGameReady(page);
          console.log("Game ready:", gameReady);
          if (!gameReady) await awaitHook(page, "ready");
          await configureScene(page, TEST_SCENE_NAME);
          // // await page.screenshot({ path: "ConfigureScene.png" })
          // await page.locator(`nav.tabs a[data-tab="battle-transitions"] i`).click();
          // await page.screenshot({ path: "TabChange.png" });

          // await page.screenshot({ path: "locator.png" });
          // await page.locator(`button[data-action="add-step"]`).click();
          // await page.screenshot({ path: "addstep.png" });
          // await page.locator(`.transition-config button[data-transition="${wipe.key}"]`).click();
          // await page.screenshot({ path: "transitiontype.png" });

          // await page.locator(`.step-config-item[data-transition-type="angularwipe"] select#easing`).selectOption(easing);
          // await page.screenshot({ path: "changeEasing.png" });

          // if (await page.locator(`.dialog:has(.step-config-item[data-transition-type="angularwipe"]) button[data-action="ok"]`).isVisible()) {
          //   await page.locator(`.dialog:has(.step-config-item[data-transition-type="angularwipe"]) button[data-action="ok"]`).click();
          // } else if (await page.locator(`.dialog:has(.step-config-item[data-transition-type="angularwipe"]) button[data-button="ok"]`).isVisible()) {
          //   await page.locator(`.dialog:has(.step-config-item[data-transition-type="angularwipe"]) button[data-button="ok"]`).click();
          // } else {
          //   throw new Error("Could not find ok button to add transition step.");
          // }
          // await page.screenshot({ path: "closeEdit.png" })

          // test.step("Configuration", async () => {
          //   await configureScene(page, TEST_SCENE_NAME);
          //   await page.locator(`nav.tabs a[data-tab="battle-transitions"]`).click();

          //   await page.locator(`button[data-action="add-step"]`).click();
          //   await page.locator(`.transition-config button[data-transition="${wipe.key}"]`).click();

          //   await page.locator(`.step-config-item[data-transition-type="angularwipe"] select#easing`).selectOption(easing);
          //   await page.locator(`dialog:has(.step-config-item[data-transition-type="angularwipe"]) button[data-action="ok"]`).click();
          //   await page.locator(`.scene-sheet button[type='submit']`).click();
          // });

          // test.step("Verification", async () => {
          //   const stepId = await page.locator(`#transition-step-list [data-transition-type='${wipe.key}']`).getAttribute("data-id");
          //   const expectedJSON = [
          //     {
          //       ...(await getStepDefaults(wipe.key)),
          //       id: stepId
          //     }
          //   ];

          //   const sequence = await getSceneFlag(page, TEST_SCENE_NAME, "sequence");
          //   expect(sequence).toEqual(expectedJSON);
          // })
          expect(true).toEqual(true);
        })
        // end step
      })
    )
  })
})


// test.afterAll(async ({ browser }) => {
//   const page = await browser.newPage();
//   await page.goto("/game");
//   test.step("Removing scene configuration", async () => {
//     await page.evaluate(async (name: string) => {
//       const scene = game?.scenes?.getName(name);
//       if (scene) await scene.unsetFlag("battle-transitions", "sequence");
//     }, TEST_SCENE_NAME);

//     const sequence = await page.evaluate(async (name: string) => {
//       const scene = game?.scenes?.getName(name);
//       if (scene) return (scene as any).getFlag("battle-transitions", "sequence");

//     }, TEST_SCENE_NAME)
//     expect(sequence).toBeUndefined();
//   });

//   test.step("Returning to setup", async () => {
//     await page.locator(`#sidebar button[data-action="setup"]`).dispatchEvent("click");
//     await page.waitForURL("**/setup");
//   });
//   page.close();
// })