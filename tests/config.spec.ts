import { testv12 as test, expect } from "./fixtures";
import steps from "./data/defaults.json"
import categories from "./data/categories.json";

// test.describe.configure({ mode: "serial" });

// test.describe("Default Configuration", () => {

const categoryKeys = {
  wipe: "wipes",
  warp: "warps",
  effect: "effects",
  technical: "technical"
}

const entries = Object.entries(steps);
for (const [key, json] of entries) {
  test(key, async ({ page }) => {
    const expectedJson = {
      ...json
    };

    await page.locator(`li.scene.nav-item i`).click({ button: "right" });
    await page.locator(`li.context-item`).getByText("Configure").click();
    await page.locator(`nav.tabs a.item[data-tab='battle-transitions']`).click();
    await page.locator(`div.tab[data-tab='battle-transitions'] button[data-action='add-step']`).click();

    // Change tab
    const category = categories[key];
    expect(category).toBeTruthy();
    const categoryKey = categoryKeys[category];
    expect(categoryKey).toBeTruthy();
    await page.locator(`nav.tabs[data-group='primary-tabs'] a.item[data-tab="${categoryKey}"]`).click();

    await page.locator(`button[data-transition="${key}"]`).click();

    // Set required things that aren't set by default
    // Probably ought to have a more versatile way to set this up
    if (key === "bosssplash") {
      await page.locator(`select#actor`).selectOption({ label: "Bossy McBossFace" });
      const uuid = await page.locator(`select#actor`).inputValue();
      (expectedJson as any).actor = uuid;
    }

    if (await page.locator(`button[type='submit'][data-action='ok']`).isVisible()) {
      await page.locator(`button[type='submit'][data-action='ok']`).click();
      (expectedJson as any).label = "";
    }
    const stepItem = page.locator(`div.tab[data-tab='battle-transitions'] div.step-config-item[data-transition-type="${key}"]`);
    await expect(stepItem).toBeVisible();
    expectedJson.id = await stepItem.getAttribute("data-id") ?? "";
    expect(expectedJson.id).toBeTruthy();
    const flag = await stepItem.getAttribute("data-flag");
    expect(flag).toBeTruthy();

    const flagJson = JSON.parse(flag as string);
    expect(flagJson).toEqual(expectedJson);

    await page.locator(`button[type='submit']`).getByText("Save Changes").click();
    await page.waitForFunction(() => (game.scenes?.getName("Scene 1")?.flags["battle-transitions"] as any)?.sequence);

    const configuredFlag = await page.evaluate(async () => {
      const scene = game.scenes?.getName("Scene 1");
      if (!scene) throw new Error("Scene not found.");
      const flags = scene.flags["battle-transitions"];
      if (!(flags as any).sequence) throw new Error("No sequence configured on scene.");
      return (flags as any).sequence[0];
    })
    expect(configuredFlag).toEqual(expectedJson);
  })
}
// })