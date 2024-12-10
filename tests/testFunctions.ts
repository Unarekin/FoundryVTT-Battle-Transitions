import { Page } from "@playwright/test";
import { awaitHook } from "./foundryFunctions";
import path from "path";
import { promises as fs } from "fs";

export async function setupWorld(page: Page, worldId: string, userId?: string) {
  await page.goto("http://localhost:20000");

  // Accept the license
  if (page.url() === "http://localhost:20000/license") await acceptLicenseAgreement(page);

  // Choose our world
  if (page.url() === "http://localhost:20000/setup") {
    await declineSharingUsageData(page);
    await clearPopup(page);
    await clearPopup(page);
    await selectWorld(page, worldId);
    await page.waitForURL("http://localhost:20000/join");
  }

  if (page.url() === "http://localhost:20000/join") {
    await loginToWorld(page, userId);
    await page.waitForURL("http://localhost:20000/game");
  }

  if (page.url() === "http://localhost:20000/game") {
    await clearPopup(page);
    // await awaitHook(page, "canvasReady");
    // await page.evaluate(() => {
    //   if (game.paused) game.togglePause(true);
    // });
  }
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
  await page.locator(`#worlds-list [data-package-id="${id}"] [data-action='worldLaunch']`).dispatchEvent("click");
}

export async function loginToWorld(page: Page, userId?: string, password?: string) {
  await page.waitForSelector(`select[name="userid"]`);
  const actualId = userId ? userId : await page.locator(`select[name="userid"] option:nth-child(2)`).getAttribute("value");
  await page.selectOption(`select[name='userid']`, actualId);
  if (password) await page.locator(`input[type="password"]`).fill(password);
  await page.locator(`button[type="submit"][name="join"]`).click();
  await page.waitForURL("**/game");
  await page.waitForLoadState("networkidle");
}

export async function declineSharingUsageData(page: Page) {
  if (await page.isVisible(`div[data-appid] button[data-button="no"]`)) {
    await page.locator(`div[data-appid] button[data-button="no"]`).click();
  }
}

export async function getStepDefaults(key: string): Promise<object> {
  const data = JSON.parse((await fs.readFile("./tests/data/StepDefaultSettings.json")).toString());
  if (data[key]) return data[key]
  else throw new Error(`Unknown step type: ${key}`);
}