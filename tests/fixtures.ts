import { test as base, expect, Page } from "@playwright/test";

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

const testv12 = base.extend({
  page: async ({ baseURL, page }, use) => {
    await joinWorld(page);
    await use(page);
  }
})

export { expect, testv12 }