import { Page } from "@playwright/test";

export async function setupWorld(page: Page, worldId: string, userId?: string) {
  await page.goto("http://localhost:30000");
  await acceptLicenseAgreement(page);
  await declineSharingUsageData(page);
  await clearPopup(page);
  await clearPopup(page);
  await selectWorld(page, worldId);
  await page.waitForURL("http://localhost:30000/join");
  await loginToWorld(page, userId);
  await page.waitForURL("http://localhost:30000/game");
  await clearPopup(page);
  await page.keyboard.press(" ")
}

export async function acceptLicenseAgreement(page: Page) {
  await page.locator(`#eula-agree`).check();
  await page.locator(`button#sign`).click();
}

export async function clearPopup(page: Page) {
  if (await page.isVisible(`a.step-button[data-action="exit"]`)) {
    await page.locator(`a.step-button[data-action="exit"]`).click();
  }
}

export async function selectWorld(page: Page, id: string) {
  await page.locator(`#worlds-list [data-package-id="${id}"] [data-action='worldLaunch']`).click();
}

export async function loginToWorld(page: Page, userId?: string, password?: string) {
  const actualId = userId ? userId : await page.locator(`select[name="userid"] option:nth-child(2)`).getAttribute("value");
  await page.selectOption(`select[name='userid']`, actualId);
  if (password) await page.locator(`input[type="password"]`).fill(password);
  await page.locator(`button[type="submit"][name="join"]`).click();
}

export async function declineSharingUsageData(page: Page) {
  // if (await page.isVisible(`div[data-appid] button[data-button="no"]`)) {
  await page.locator(`div[data-appid] button[data-button="no"]`).click();
  // }
}
