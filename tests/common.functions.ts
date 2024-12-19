import { Page } from "@playwright/test";
import { expect } from "./fixtures";


/** Resolves after a given amount of time */
export async function wait(ms: number): Promise<void> {
  return new Promise(resolve => { setTimeout(resolve, ms); });
}

/**
 * Opens the configuration application for a scene.
 * @param {Page} page - {@link Page}
 * @param {string} scene - ID of the {@link Scene} to configure
 */
export async function openSceneConfiguration(page: Page, scene: string) {
  // Right click navigation option
  const locator = page.locator(`li.scene.nav-item[data-scene-id="${scene}"]`);
  await locator.click({ button: "right" });
  // Open config window
  await locator.locator("nav#context-menu li.context-item").getByText("Configure").click();
  // Swap to BT tab
  await page.locator(`nav.sheet-tabs.tabs[data-group="main"] a.item[data-tab="battle-transitions"]`).click();
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

/**
 * Retrieves the configuration for a given transition step stored on the scene configuration window.
 * 
 * @remarks Will return the configuration for the FIRST step matching the key provided.
 * @param {Page} page - {@link Page}
 * @param {string} key - Key for the transition step
 * @returns 
 */
export async function getStepConfiguration(page: Page, key: string): Promise<Record<string, unknown>> {
  const locator = page.locator(`div.step-config-item[data-transition-type="${key}"]`).first();
  const flag = await locator.getAttribute("data-flag") as string;
  expect(flag).toBeTruthy();
  return JSON.parse(flag) as Record<string, unknown>;
}

