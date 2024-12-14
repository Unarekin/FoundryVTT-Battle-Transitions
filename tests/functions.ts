import { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { SceneConfiguration } from '../src/interfaces';


export async function openSceneConfiguration(page: Page) {
  await page.locator(`li.scene.nav-item i`).click({ button: "right" });
  await page.locator(`li.context-item`).getByText("Configure").click();
  await page.locator(`nav.tabs a.item[data-tab='battle-transitions']`).click();
}

export async function setConfigTab(page: Page, tab: string) {
  await page.locator(`nav.tabs[data-group='primary-tabs'] a.item[data-tab="${tab}"]`).click();
}

export async function getStepConfiguration(page: Page, id: string) {
  const stepItem = page.locator(`div.tab[data-tab='battle-transitions'] div.step-config-item[data-id="${id}"]`);
  await expect(stepItem).toBeVisible();
  const flag = await stepItem.getAttribute("data-flag");
  return JSON.parse(flag as string);
}

export async function getSceneConfiguration(page: Page, name: string) {
  return page.evaluate<SceneConfiguration | undefined, string>(async (name) => {
    const scene = game.scenes?.getName(name);
    if (!scene) throw new Error(`Scene not found: ${name}`);
    return scene.flags["battle-transitions"];
  }, name)
}
