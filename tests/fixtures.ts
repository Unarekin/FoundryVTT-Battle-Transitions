import { test as base, expect, Page } from "@playwright/test";

declare global {
  const BattleTransition: any;
}

async function joinWorld(page: Page, baseURL: string) {
  if (page.url() !== `${baseURL}/join`) await page.goto("/join");

  await page
    .locator(`select[name="userid"]`)
    .selectOption({ label: "Gamemaster" });

  await page.getByRole("button", { name: " Join Game Session" }).click();

  await expect(page).toHaveURL("/game");
  await page.waitForFunction(() => window["game"]?.ready);
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


const test = base.extend({
  page: async ({ page, baseURL }, use) => {
    await joinWorld(page, baseURL);
    await use(page);
    await clearSceneConfigurations(page);
  }
})

export { test, expect };