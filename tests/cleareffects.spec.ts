import { openStepConfiguration } from "./configTestFunctions";
import { testv12 as test, expect } from "./fixtures";

import { cleareffects } from "./data/defaults.json";
import { getSceneConfiguration, getStepConfiguration } from "./functions";

declare const BattleTransition: any;

test("UI Test", async ({ page }) => {
  await openStepConfiguration(page, "cleareffects");
  const stepItem = page.locator(`div.tab[data-tab="battle-transitions"] div.step-config-item[data-transition-type="cleareffects"]`);
  const id = await stepItem.getAttribute("data-id") ?? "";
  expect(id).toBeTruthy();

  const expected = {
    ...cleareffects,
    id
  };

  const stepConfig = await getStepConfiguration(page, id);
  expect(stepConfig).toEqual(expected);

  await page.locator(`button[type="submit"]`).getByText("Save Changes").click();
  await page.waitForFunction(() => (game.scenes?.getName("Scene 1")?.flags["battle-transitions"] as any)?.sequence);
  const config = await getSceneConfiguration(page, "Scene 1");
  expect(config).toBeTruthy();
  expect(config?.sequence).toBeTruthy();
  expect(config?.sequence).toHaveLength(1);

  expect(config?.sequence?.[0]).toEqual(expected);
})

test("API Test", async ({ page }) => {
  await page.evaluate(async () => {
    try {
      await new BattleTransition("Scene 2").clearEffects().execute();
      await new Promise(resolve => { setTimeout(resolve, 1000); });
      const scene = game.scenes?.current;
      if (scene?.name !== "Scene 2") throw new Error("Did not change scenes.");
    } finally {
      await new Promise(resolve => { setTimeout(resolve, 1000); });
      const scene = game?.scenes?.getName("Scene 1");
      if (scene) await scene.activate();
    }
  })
});
