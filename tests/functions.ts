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

export function generateColorSteps(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number, steps: number): [number, number, number][] {
  const colors: number[][] = [];
  const step = 255 / (steps - 1);
  for (let i = 0; i < 255; i += step) {
    const r = r1 + ((i * (r2 - r1)) / 255);
    const g = g1 + ((i * (g2 - g1)) / 255);
    const b = b1 + ((i * (b2 - b1)) / 255);
    colors.push([r, g, b]);
  }
  colors.push([r2, g2, b2]);
  return colors as [number, number, number][];
}

export async function activateScene(page: Page, name: string) {
  await page.evaluate<void, string>(async (name) => {
    const scene = game.scenes?.getName(name);
    if (scene) await scene.activate();
  }, name)
}