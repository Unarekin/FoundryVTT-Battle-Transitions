import { test, expect } from "../fixtures";

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
