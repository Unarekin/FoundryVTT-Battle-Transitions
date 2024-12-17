import { Page, test as setup } from "@playwright/test";
import { upAll } from "docker-compose";
import path from "path";
import waitOn from "wait-on";

const BASE_URL = "http://localhost:30000";

async function acceptLicense(page: Page) {
  if (page.url() === `${BASE_URL}/license`) {
    await page.locator("#eula-agree").check();
    await page.locator("button#sign").click();
    await page.waitForURL(`${BASE_URL}/setup`);
  }
}

async function declineSharingData(page: Page) {
  if (page.url() === `${BASE_URL}/setup`) {
    await page.locator("button[data-button='no']").click();
    // if (await locator.isVisible()) await locator.click();
  }
}

async function selectWorld(page: Page) {
  if (page.url() === `${BASE_URL}/setup`) {
    await page.locator("[data-package-id='battle-transitions-v12'] .control.play[data-action='worldLaunch']").dispatchEvent("click");
    await page.waitForURL(`${BASE_URL}/join`);
  }
}

async function closeTour(page: Page) {
  if (page.url() === `${BASE_URL}/setup`)
    await page.locator(`a.step-button[data-action='exit'] i`).click();

}

setup.describe("Setup", () => {
  setup("Start container", async () => {
    await upAll({ cwd: path.resolve(__dirname, "../.."), log: true });
    await new Promise(resolve => { setTimeout(resolve, 10000) });
    waitOn({
      resources: [BASE_URL],
      timeout: 30000
    });
  });



  setup("Set up world", async ({ context }) => {
    const page = await context.newPage();
    await page.goto(BASE_URL);
    await acceptLicense(page);
    await declineSharingData(page);
    await closeTour(page);
    await selectWorld(page);
  });
})

// setup("Start docker container", async ({ context }) => {
//   await upAll({ cwd: path.resolve(__dirname, "../.."), log: true });
//   await new Promise(resolve => { setTimeout(resolve, 10000) });
//   waitOn({
//     resources: [BASE_URL],
//     timeout: 30000
//   });
//   console.log("Server available.");

//   const page = await context.newPage();
//   await page.goto(BASE_URL);
//   await acceptLicense(page);
//   await declineSharingData(page);
//   await selectWorld(page);
// });