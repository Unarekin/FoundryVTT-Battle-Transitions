import { test as base, expect, Page } from "@playwright/test";
import { promises as fs } from "fs";
import stepDefaults from "./data/defaults.json";

const BASE_URL = "http://localhost:30000";
export { BASE_URL }

// @TODO: Select world

async function joinWorld(page: Page) {
  await page.goto(`${BASE_URL}/join`);

  await page
    .locator(`select[name="userid"]`)
    .selectOption({ label: "Gamemaster" });

  // Optionally put passwrod here

  await page.getByRole("button", { name: " Join Game Session" }).click();

  await expect(page).toHaveURL(`${BASE_URL}/game`);
  await page.waitForFunction(() => window["game"].ready);

  // let button = page.locator("div#notification-application a.close");
  // await expect(button).toBeVisible();
  // await button.click();
  // await expect(button).not.toBeVisible();
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

const testv12 = base.extend({
  page: async ({ page }, use) => {
    await joinWorld(page);
    await use(page);
    await clearSceneConfigurations(page);
  },
  stepDefaults
})

export { expect, testv12 }