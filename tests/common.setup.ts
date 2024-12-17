import { Page } from "@playwright/test";

/**
 * Accepts the EULA on first launching Foundry
 * @param {Page} page - {@link Page}
 * @param {string} baseURL - Base URL
 */
export async function acceptLicense(page: Page, baseURL: string) {
  if (page.url() === `${baseURL}/license`) {
    await page.locator("#eula-agree").check();
    await page.locator("button#sign").click();
    await page.waitForURL(`${baseURL}/setup`);
  }
}

/**
 * Selects the "Decline Sharing" information for usage data
 * @param {Page} page - {@link Page}
 * @param {string} baseURL - Base URL
 */
export async function declineSharingData(page: Page, baseURL: string) {
  if (page.url() === `${baseURL}/setup`) {
    const locator = page.locator(`button[data-button="no"]`);
    if (await locator.isVisible()) await locator.click();
  }
}

/**
 * Handles selecting and launching the appropriate world
 * @param {Page} page - {@link Page}
 * @param {string} baseUrl - Base URL
 */
export async function selectWorld(page: Page, baseURL: string) {
  if (page.url() === `${baseURL}/setup`) {
    await page.locator("[data-package-id='battle-transitions'] .control.play[data-action='worldLaunch']").dispatchEvent("click");
    await page.waitForURL(`${baseURL}/join`);
  }
}

/**
 * Closes the tour pop-up
 * @param {Page} page - {@link Page}
 * @param {string} baseURL - Base URL
 */
export async function closeTour(page: Page, baseURL: string) {
  if (page.url() === `${baseURL}/setup`) {
    const locator = page.locator(`a.step-button[data-action='exit'] i`);
    if (await locator.isVisible()) await locator.click();
  }
}

