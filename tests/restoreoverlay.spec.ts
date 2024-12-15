import { testv12 as test, expect } from "./fixtures";
import { restoreoverlay } from "./data/defaults.json";
import { openStepConfiguration } from "./configTestFunctions";
import { getSceneConfiguration, getStepConfiguration } from "./functions";

declare const BattleTransition: any;

test("UI Test", async ({ page }) => {
  await openStepConfiguration(page, "restoreoverlay");
  const stepItem = page.locator(`div.tab[data-tab="battle-transitions"] div.step-config-item[data-transition-type="restoreoverlay"]`);
  const id = await stepItem.getAttribute("data-id") ?? "";
  expect(id).toBeTruthy();

  const expected = {
    ...restoreoverlay,
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
});

test("Transition Builder Test", async ({ page }) => { });

test("API Test", async ({ page }) => {
  await page.evaluate(async () => {
    try {
      await new BattleTransition("Scene 2").showOverlay().execute();
      await new Promise(resolve => { setTimeout(resolve, 1000); });
      const scene = game.scenes?.current;
      if (scene?.name !== "Scene 2") throw new Error("Did not change scenes.");
    } finally {
      const scene = game?.scenes?.getName("Scene 1");
      if (scene) await scene.activate();
    }
  })
});