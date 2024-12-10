import { test as base } from "@playwright/test";

export const test = base.extend<{ returnToSetup: void }>({
  returnToSetup: [async ({ page }, use) => {
    await use();

    await page.locator(`#sidebar button[data-action="setup"]`).dispatchEvent("click");
    await page.waitForURL("**/setup");
  }, { auto: true, title: "Returning to Server Setup" }]
})