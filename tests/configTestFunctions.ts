import { Page, expect } from "@playwright/test";
import { getSceneConfiguration, getStepConfiguration, openSceneConfiguration } from "./functions";
import categories from "./data/categories.json";


const categoryKeys = {
  wipe: "wipes",
  warp: "warps",
  effect: "effects",
  technical: "technical"
}

export async function openStepConfiguration(page: Page, key: string) {
  await openSceneConfiguration(page);
  await page.locator(`div.tab[data-tab='battle-transitions'] button[data-action='add-step']`).click();

  const category = categories[key];
  expect(category).toBeTruthy();
  const categoryKey = categoryKeys[category];
  expect(categoryKey).toBeTruthy();
  await page.locator(`nav.tabs[data-group='primary-tabs'] a.item[data-tab="${categoryKey}"]`).click();

  await page.locator(`button[data-transition='${key}']`).click();
}

export async function defaultConfigurationTest(page: Page, expected: Record<string, unknown>) {
  const key = expected.type as string;

  await openStepConfiguration(page, key);
  await page.locator(`button[type='submit'][data-action='ok']`).click();

  const stepItem = page.locator(`div.tab[data-tab='battle-transitions'] div.step-config-item[data-transition-type="${key}"]`);
  const id = await stepItem.getAttribute("data-id") ?? "";
  expect(id).toBeTruthy();

  const actualExpected = {
    label: "",
    ...expected,
    id
  };

  const stepConfig = await getStepConfiguration(page, id);
  expect(stepConfig).toEqual(actualExpected);

  await page.locator(`button[type='submit']`).getByText("Save Changes").click();
  await page.waitForFunction(() => (game.scenes?.getName("Scene 1")?.flags["battle-transitions"] as any)?.sequence);
  const config = await getSceneConfiguration(page, "Scene 1");
  expect(config).toBeTruthy();
  expect(config?.sequence).toBeTruthy();
  expect(config?.sequence).toHaveLength(1);

  expect(config?.sequence?.[0]).toEqual(actualExpected);
}

export async function labelTest(page: Page, expected: Record<string, unknown>) {
  const label = expected.label as string ?? "";
  expect(label).toBeTruthy();
  const key = expected.type as string ?? "";
  expect(key).toBeTruthy();

  await openStepConfiguration(page, key);


  await page.locator("#label").clear();
  await page.locator("#label").fill(label);

  await page.locator(`button[type='submit'][data-action='ok']`).click();


  const stepItem = page.locator(`div.tab[data-tab="battle-transitions"] div.step-config-item[data-transition-type="${key}"]`);
  const id = await stepItem.getAttribute("data-id") ?? "";

  const actualExpected = {
    label: "",
    ...expected,
    id
  };

  const stepConfig = await getStepConfiguration(page, id);
  expect(stepConfig).toEqual(actualExpected)

  await page.locator(`button[type="submit"]`).getByText("Save Changes").click();
  await page.waitForFunction(() => (game.scenes?.getName("Scene 1")?.flags["battle-transitions"] as any)?.sequence);

  const config = await getSceneConfiguration(page, "Scene 1");
  expect(config).toBeTruthy();
  expect(config?.sequence).toBeTruthy();
  expect(config?.sequence).toHaveLength(1);

  expect(config?.sequence?.[0]).toEqual(actualExpected);

}

export async function durationTest(page: Page, expected: Record<string, unknown>) {
  const key = expected.type as string ?? "";
  expect(key).toBeTruthy();
  const duration = expected.duration as number ?? 0;
  expect(duration).toBeTruthy();

  await openStepConfiguration(page, key);

  await page.locator("input#duration").clear();
  expect(page.locator("input#duration").fill("abcde")).rejects.toThrow();

  await page.locator("input#duration").clear();
  await page.locator("input#duration").fill(duration.toString());
  expect(await page.locator("input#duration").inputValue()).toEqual(duration.toString());

  await page.locator(`button[type='submit'][data-action='ok']`).click();
  const stepItem = page.locator(`div.tab[data-tab='battle-transitions'] div.step-config-item[data-transition-type="${key}"]`);
  const id = await stepItem.getAttribute("data-id") ?? "";

  const actualExpected = {
    label: "",
    ...expected,
    id,
    backgroundType: "color"
  };

  const stepConfig = await getStepConfiguration(page, id);
  expect(stepConfig).toEqual(actualExpected);

  await page.locator(`button[type='submit']`).getByText("Save Changes").click();
  await page.waitForFunction(() => (game.scenes?.getName("Scene 1")?.flags["battle-transitions"] as any)?.sequence);

  const config = await getSceneConfiguration(page, "Scene 1");
  expect(config).toBeTruthy();
  expect(config?.sequence).toBeTruthy();
  expect(config?.sequence).toHaveLength(1);
  expect(config?.sequence?.[0]).toEqual(actualExpected);
}

export async function backgroundColorTest(page: Page, expected: Record<string, unknown>) {
  const key = expected.type as string ?? "";
  expect(key).toBeTruthy();
  const backgroundColor = expected.backgroundColor as string ?? "";
  expect(backgroundColor).toBeTruthy();

  await openStepConfiguration(page, key);

  expect(await page.locator("#backgroundColor").inputValue()).toEqual("#00000000");
  await page.locator("input#backgroundColor").clear();
  await page.locator("input#backgroundColor").fill(backgroundColor);
  expect(await page.locator("input#backgroundColor").inputValue()).toEqual(backgroundColor);


  await page.locator(`button[type='submit'][data-action='ok']`).click();
  const stepItem = page.locator(`div.tab[data-tab='battle-transitions'] div.step-config-item[data-transition-type="${key}"]`);
  const id = await stepItem.getAttribute("data-id") ?? "";

  const actualExpected = {
    label: "",
    ...expected,
    id,
    backgroundType: "color"
  };


  const stepConfig = await getStepConfiguration(page, id);
  expect(stepConfig).toEqual(actualExpected);

  await page.locator(`button[type='submit']`).getByText("Save Changes").click();
  await page.waitForFunction(() => (game.scenes?.getName("Scene 1")?.flags["battle-transitions"] as any)?.sequence);

  const config = await getSceneConfiguration(page, "Scene 1");
  expect(config).toBeTruthy();
  expect(config?.sequence).toBeTruthy();
  expect(config?.sequence).toHaveLength(1);
  expect(config?.sequence?.[0]).toEqual(actualExpected);
}

export async function backgroundImageTest(page: Page, expected: Record<string, unknown>) {
  const key = expected.type as string ?? "";
  expect(key).toBeTruthy();
  const backgroundImage = expected.backgroundImage as string ?? "";
  expect(backgroundImage).toBeTruthy();

  await openStepConfiguration(page, key);


  expect(await page.locator("#backgroundImage input.image").inputValue()).toEqual("");
  expect(await page.locator("#backgroundType").inputValue()).toEqual("color");
  expect(page.locator("section[data-background-type='image']")).toBeHidden();
  expect(page.locator("section[data-background-type='overlay']")).toBeHidden();
  await page.locator("#backgroundType").selectOption("image");
  expect(await page.locator("#backgroundType").inputValue()).toEqual("image");

  // Verify swapping selector section
  expect(page.locator("#backgroundImagePreview")).toBeVisible();
  expect(page.locator("section[data-background-type='image']")).toBeVisible();
  expect(page.locator("section[data-background-type='overlay']")).toBeHidden();
  expect(page.locator("section[data-background-type='color']")).toBeHidden();

  // Set image
  await page.locator("#backgroundImage input").fill(backgroundImage);
  expect(await page.locator("#backgroundImage input").inputValue()).toEqual(backgroundImage)

  // Check preview
  expect(page.locator("#backgroundImagePreview img")).toBeVisible();
  expect(await page.locator("#backgroundImagePreview img").getAttribute("src")).toEqual(backgroundImage);


  await page.locator(`button[type='submit'][data-action='ok']`).click();
  const stepItem = page.locator(`div.tab[data-tab='battle-transitions'] div.step-config-item[data-transition-type="${key}"]`);
  const id = await stepItem.getAttribute("data-id") ?? "";

  const actualExpected = {
    label: "",
    ...expected,
    id,
    backgroundImage,
    backgroundType: "image"
  };


  const stepConfig = await getStepConfiguration(page, id);
  expect(stepConfig).toEqual(actualExpected);

  await page.locator(`button[type='submit']`).getByText("Save Changes").click();
  await page.waitForFunction(() => (game.scenes?.getName("Scene 1")?.flags["battle-transitions"] as any)?.sequence);

  const config = await getSceneConfiguration(page, "Scene 1");
  expect(config).toBeTruthy();
  expect(config?.sequence).toBeTruthy();
  expect(config?.sequence).toHaveLength(1);
  expect(config?.sequence?.[0]).toEqual(actualExpected);
}

export async function backgroundOverlayTest(page: Page, expected: Record<string, unknown>) {
  const key = expected.type as string ?? "";
  expect(key).toBeTruthy();

  await openStepConfiguration(page, key);


  expect(await page.locator("#backgroundImage input.image").inputValue()).toEqual("");
  expect(await page.locator("#backgroundType").inputValue()).toEqual("color");
  expect(page.locator("section[data-background-type='image']")).toBeHidden();
  expect(page.locator("section[data-background-type='overlay']")).toBeHidden();

  await page.locator("#backgroundType").selectOption("overlay");
  expect(await page.locator("#backgroundType").inputValue()).toEqual("overlay");


  await page.locator(`button[type='submit'][data-action='ok']`).click();
  const stepItem = page.locator(`div.tab[data-tab='battle-transitions'] div.step-config-item[data-transition-type="${key}"]`);
  const id = await stepItem.getAttribute("data-id") ?? "";

  const actualExpected = {
    label: "",
    ...expected,
    id,
    backgroundType: "overlay"
  };


  const stepConfig = await getStepConfiguration(page, id);
  expect(stepConfig).toEqual(actualExpected);

  await page.locator(`button[type='submit']`).getByText("Save Changes").click();
  await page.waitForFunction(() => (game.scenes?.getName("Scene 1")?.flags["battle-transitions"] as any)?.sequence);

  const config = await getSceneConfiguration(page, "Scene 1");
  expect(config).toBeTruthy();
  expect(config?.sequence).toBeTruthy();
  expect(config?.sequence).toHaveLength(1);
  expect(config?.sequence?.[0]).toEqual(actualExpected);
}

export async function easingTest(page: Page, expected: Record<string, unknown>) {
  const easing = expected.easing as string ?? "";
  expect(easing).toBeTruthy();
  const key = expected.type as string ?? "";
  expect(key).toBeTruthy();

  await openStepConfiguration(page, key);


  await page.locator("#easing").selectOption(easing);
  expect(await page.locator("#easing").inputValue()).toEqual(easing);

  await page.locator(`button[type="submit"][data-action="ok"]`).click();


  const stepItem = page.locator(`div.tab[data-tab='battle-transitions'] div.step-config-item[data-transition-type="${key}"]`);
  const id = await stepItem.getAttribute("data-id") ?? "";

  const actualExpected = {
    label: "",
    ...expected,
    id,
    easing
  };


  const stepConfig = await getStepConfiguration(page, id);
  expect(stepConfig).toEqual(actualExpected);

  await page.locator(`button[type='submit']`).getByText("Save Changes").click();
  await page.waitForFunction(() => (game.scenes?.getName("Scene 1")?.flags["battle-transitions"] as any)?.sequence);

  const config = await getSceneConfiguration(page, "Scene 1");
  expect(config).toBeTruthy();
  expect(config?.sequence).toBeTruthy();
  expect(config?.sequence).toHaveLength(1);
  expect(config?.sequence?.[0]).toEqual(actualExpected);

}