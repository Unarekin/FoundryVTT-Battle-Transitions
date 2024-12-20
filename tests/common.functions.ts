import { Page } from "@playwright/test";
import { expect } from "./fixtures";


/** Resolves after a given amount of time */
export async function wait(ms: number): Promise<void> {
  return new Promise(resolve => { setTimeout(resolve, ms); });
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

