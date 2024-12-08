import { test } from "@playwright/test";
import { setupWorld } from "./testFunctions"
import { configureScene } from "./foundryFunctions";

test("Angular Wipe", async ({ page }) => {
  await setupWorld(page, "battle-transitions-v12");

  await page.evaluate(() => game?.scenes?.getName("Scene 1")?.activate())

  await configureScene(page, "Scene 1");
  // await page.evaluate(async () => {
  //   await new BattleTransition("Scene 2")
  //     .linearWipe("left")
  //     .execute();
  // });
})