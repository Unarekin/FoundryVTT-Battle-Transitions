import { Page } from "@playwright/test";

/**
 * Opens the configuration application for a scene.
 * @param {Page} page - {@link Page}
 * @param {string} scene - ID of the {@link Scene} to configure
 */
export async function openSceneConfiguration(page: Page, scene: string) {
  const locator = page.locator(`li.scene[data-scene-id="${scene}"]`);
  await locator.click({ button: "right", force: true });

  await locator.locator(`li.context-item`).first().click({ force: true });
  await page.locator(`a.item[data-tab="battle-transitions"]`).click();
}

/**
 * Opens the scene configuration application and adds a step, leaving the step edit window open.
 * @param {Page} page - {@link Page}
 * @param {string} scene - ID of the {@link Scene}
 * @param {string} key - Key of the transition type to add
 */
export async function addStep(page: Page, scene: string, key: string) {
  await openSceneConfiguration(page, scene);
  await page.locator(`button[data-action="add-step"]`).click();
  await page.locator(`button[data-transition="${key}"]`).click({ force: true });
}