import { Page } from "@playwright/test";
import { test, expect } from "./fixtures";
import { TransitionConfiguration } from "../src/steps";
import { Easings } from "../src/types";

export async function openSceneConfiguration(page: Page) {
  await page.locator(`li.scene.nav-item i`).click({ button: "right" });
  await page.locator(`li.context-item`).getByText("Configure").click();
  await page.locator(`nav.tabs a.item[data-tab='battle-transitions']`).click();
}


export async function openStepConfiguration(page: Page, key: string) {
  await openSceneConfiguration(page);
  await page.locator(`div.tab[data-tab="battle-transitions"] button[data-action="add-step"]`).click();

  await page.locator(`button[data-transition="${key}]`).click({ force: true });
}

export async function easingConfigTests(config: TransitionConfiguration) {
  const key = config.type;
  for (const easing of Easings) {
    test(easing, async ({ page }) => {
      await openStepConfiguration(page, key);
      await page.locator("#easing").selectOption(easing);
    })
  }
}

export async function wait(time) {
  return new Promise(resolve => { setTimeout(resolve, time); });
}