import { Page, expect } from "@playwright/test";
import { test } from "./fixtures";
import { addStep, getStepConfiguration } from "./common.functions";
import defaultSettings from "./data/defaults.json";

import { Easings } from "../src/types";
export type TransitionKey = keyof typeof defaultSettings;


/**
 * Performs a simple test to add a step to a given scene, then check vs. the default configuration for that step type.
 * @param {Page} page - {@link Page}
 * @param {string} scene - ID of the {@link Scene} in question
 * @param {string} key - Key of the transition type to add.
 */
export async function defaultConfigurationTest(page: Page, scene: string, key: TransitionKey) {
  if (!defaultSettings[key]) throw new Error(`Unknown transition type: ${key}`);
  const config = defaultSettings[key];
  expect(config).toBeTruthy();
  await addStep(page, scene, key);
  await page.locator(`button[type="submit"][data-action="ok"]`).click();

  const stepConfig = await getStepConfiguration(page, key);
  expect(stepConfig).toBeTruthy();

  const expected = {
    ...config,
    label: "",
    id: stepConfig.id
  }
  expect(stepConfig).toEqual(expected);

  await page.locator("button[type='submit']").getByText("Save Changes").click();
  const sceneConfig = await page.evaluate(id => (game?.scenes?.get(id)?.flags["battle-transitions"] as any)?.sequence[0], scene);
  expect(sceneConfig).toBeTruthy();
  expect(sceneConfig).toEqual(expected);
}


export function durationTests(key: TransitionKey) {
  if (!defaultSettings[key]) throw new Error(`Unknown transition type: ${key}`);
  test("Negative", async ({ page, scene }) => {
    await addStep(page, scene, key);
    await page.locator("#duration").fill("-50");
    expect(await page.locator(`button[type="submit"][data-action="ok"]`).isDisabled()).toBeTruthy();
  });

  test("Empty", async ({ page, scene }) => {
    await addStep(page, scene, key);
    await page.locator("#duration").clear();
    expect(await page.locator(`button[type="submit"][data-action="ok"]`).isDisabled()).toBeTruthy();

  });

  test("Valid", async ({ page, scene }) => {
    await addStep(page, scene, key);
    await page.locator("#duration").fill("50");
    expect(await page.locator(`button[type="submit"][data-action="ok"]`).isDisabled()).toBeFalsy();
    await page.locator(`button[type="submit"][data-action="ok"]`).click();
    const config = await getStepConfiguration(page, key);

    expect(config).toBeTruthy();

    const expected = {
      ...defaultSettings[key],
      label: "",
      id: config.id,
      duration: 50
    }

    expect(config).toEqual(expected)

    await page.locator("button[type='submit']").getByText("Save Changes").click();
    const sceneConfig = await page.evaluate(id => (game?.scenes?.get(id)?.flags["battle-transitions"] as any)?.sequence[0], scene);
    expect(sceneConfig).toBeTruthy();
    expect(sceneConfig).toEqual(expected);
  });
}

export function backgroundTests(key: TransitionKey) {
  if (!defaultSettings[key]) throw new Error(`Unknown transition type: ${key}`);
  test("Color", async ({ page, scene }) => {
    await addStep(page, scene, key);
    expect(await page.locator("section[data-background-type='color']").isVisible()).toBeTruthy();
    expect(await page.locator("section[data-background-type='image']").isVisible()).toBeFalsy();
    expect(await page.locator("section[data-background-type='overlay']").isVisible()).toBeFalsy();
    await page.locator("#backgroundType").selectOption("color");
    await page.locator("#backgroundColor").fill("#FFFFFFFF");
    await page.locator(`button[type="submit"][data-action="ok"]`).click();
    const config = await getStepConfiguration(page, key);

    expect(config).toBeTruthy();

    const expected = {
      ...defaultSettings[key],
      label: "",
      id: config.id,
      backgroundType: "color",
      backgroundImage: "",
      backgroundColor: "#FFFFFFFF"
    };

    expect(config).toEqual(expected);


    await page.locator("button[type='submit']").getByText("Save Changes").click();
    const sceneConfig = await page.evaluate(id => (game?.scenes?.get(id)?.flags["battle-transitions"] as any)?.sequence[0], scene);
    expect(sceneConfig).toBeTruthy();
    expect(sceneConfig).toEqual(expected);
  });
  test("Image", async ({ page, scene }) => {
    await addStep(page, scene, key);
    await page.locator("#backgroundType").selectOption("image");

    expect(await page.locator("section[data-background-type='color']").isVisible()).toBeFalsy();
    expect(await page.locator("section[data-background-type='image']").isVisible()).toBeTruthy();
    expect(await page.locator("section[data-background-type='overlay']").isVisible()).toBeFalsy();

    await page.locator("#backgroundImage input").fill("uploads/images/TestScene1.webp");
    await page.locator("button[type='submit'][data-action='ok']").click();
    const config = await getStepConfiguration(page, key);
    expect(config).toBeTruthy();
    const expected = {
      ...defaultSettings[key],
      label: "",
      id: config.id,
      backgroundType: "image",
      backgroundImage: "uploads/images/TestScene1.webp"
    }
    expect(config).toEqual(expected);

    await page.locator("button[type='submit']").getByText("Save Changes").click();
    const sceneConfig = await page.evaluate(id => (game?.scenes?.get(id)?.flags["battle-transitions"] as any)?.sequence[0], scene);
    expect(sceneConfig).toBeTruthy();
    expect(sceneConfig).toEqual(expected);
  });
  test("Overlay", async ({ page, scene }) => {
    await addStep(page, scene, key);
    await page.locator("#backgroundType").selectOption("overlay");

    expect(await page.locator("section[data-background-type='color']").isVisible()).toBeFalsy();
    expect(await page.locator("section[data-background-type='image']").isVisible()).toBeFalsy();
    // expect(await page.locator("section[data-background-type='overlay']").isVisible()).toBeTruthy();

    await page.locator("button[type='submit'][data-action='ok']").click();
    const config = await getStepConfiguration(page, key);
    expect(config).toBeTruthy();
    const expected = {
      ...defaultSettings[key],
      label: "",
      id: config.id,
      backgroundType: "overlay"
    }
    expect(config).toEqual(expected);

    await page.locator("button[type='submit']").getByText("Save Changes").click();
    const sceneConfig = await page.evaluate(id => (game?.scenes?.get(id)?.flags["battle-transitions"] as any)?.sequence[0], scene);
    expect(sceneConfig).toBeTruthy();
    expect(sceneConfig).toEqual(expected);
  });

}

export async function labelTest(page: Page, scene: string, key: TransitionKey) {
  await addStep(page, scene, key);
  await page.locator("#label").fill("test label");

  await page.locator("button[type='submit'][data-action='ok']").click();
  const config = await getStepConfiguration(page, key);
  expect(config).toBeTruthy();

  const expected = {
    ...defaultSettings[key],
    label: "test label",
    id: config.id
  };

  expect(config).toEqual(expected);

  await page.locator("button[type='submit']").getByText("Save Changes").click();
  const sceneConfig = await page.evaluate(id => (game?.scenes?.get(id)?.flags["battle-transitions"] as any)?.sequence[0], scene);
  expect(sceneConfig).toBeTruthy();
  expect(sceneConfig).toEqual(expected);
}

export function easingTests(key: TransitionKey) {
  for (const easing of Easings) {
    test(easing, async ({ page, scene }) => {

    });
  }
}