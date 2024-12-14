import { testv12 as test, expect } from "./fixtures";
import { invert } from "./data/defaults.json";
import { defaultConfigurationTest } from "./configTestFunctions"

declare const BattleTransition: any;

test("UI Test", async ({ page }) => {

  await defaultConfigurationTest(page, {
    ...invert,
    label: undefined
  });
});

test("API Test", async ({ page }) => {
  await page.evaluate(async () => {
    try {
      await new BattleTransition("Scene 2").invert().execute();
      await new Promise(resolve => { setTimeout(resolve, 1000) });
    } finally {
      const scene = game?.scenes?.getName("Scene 1");
      if (scene) await scene.activate();
    }
  })
});

test("Visual Confirmation", async ({ page }) => {
  await page.evaluate(async () => {
    try {
      await new BattleTransition("Scene 2").invert().wait(2000).execute();
      await new Promise(resolve => { setTimeout(resolve, 1000); })
    } finally {
      const scene = game?.scenes?.getName("Scene 1");
      if (scene) await scene.activate();
    }
  })
});