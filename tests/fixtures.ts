import { test as base, expect, Page } from "@playwright/test";
import { wait } from "./common.functions";

declare global {
  const BattleTransition: any;
}

async function joinWorld(page: Page, baseURL: string) {
  if (page.url() !== `${baseURL}/join`) await page.goto("/join");

  await page
    .locator(`select[name="userid"]`)
    .selectOption({ label: "Gamemaster" });

  await page.waitForFunction(() => $(`button[name="join"]`).trigger("click"));
  await page.waitForFunction(() => window["game"]?.ready);

  await wait(1000);
  if (await page.locator(`.tour-center-step.tour .step-button[data-action="exit"]`).isVisible())
    await page.locator(`.tour-center-step.tour .step-button[data-action="exit"]`).click();
}

async function clearSceneConfigurations(page: Page) {
  await page.evaluate(async () => {
    const scenes = game.scenes?.contents as Scene[] ?? [];
    for (const scene of scenes) {
      const flags = scene.flags["battle-transitions"] as any;
      for (const key in flags) {
        await scene.unsetFlag("battle-transitions", key);
      }
    }
  });
}


const test = base.extend<{ scene: string }>({
  page: async ({ page, baseURL }, use) => {
    await joinWorld(page, baseURL ?? "");
    await use(page);
    // await clearSceneConfigurations(page);
  },
  scene: async ({ page }, use) => {
    // Create scene for this test suite

    const scene = await page.evaluate(async () => {
      const id = Math.random().toString(36).substring(2, 8);
      const scene = await Scene.create({ name: `Scene ${id}` });
      if (!scene) throw new Error("Scene not created");

      // await new Promise(resolve => { setTimeout(resolve, 1000); });
      // await scene.activate();
      return scene.id;
    });

    if (!scene) throw new Error("Invalid scene");
    await use(scene);
    // Delete
    await page.evaluate(async (id) => {
      const scene = game?.scenes?.get(id ?? "");
      if (scene instanceof Scene) await scene.delete();
    }, scene);
  }
})

export { test, expect };