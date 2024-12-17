import { testv12 as test, expect } from "./fixtures";
import { diamondwipe } from "./data/defaults.json";
import { Easings } from "../src/types";
import { backgroundColorTest, backgroundImageTest, backgroundOverlayTest, defaultConfigurationTest, durationTest, easingTest, labelTest, openStepConfiguration } from "./configTestFunctions";
import { getSceneConfiguration, getStepConfiguration } from "./functions";

declare const BattleTransition: any;

test.describe("Scene Configuration Tests", () => {
  test("Can set default settings", async ({ page }) => {
    await defaultConfigurationTest(page, diamondwipe);
  });

  test("Can set label", async ({ page }) => {
    await labelTest(page, {
      ...diamondwipe,
      label: "Test Label"
    });
  });

  test("Can set duration", async ({ page }) => {
    await durationTest(page, {
      ...diamondwipe,
      duration: 5000
    })
  });

  test.describe("Size", () => {
    test("Valid", async ({ page }) => {
      await openStepConfiguration(page, "diamondwipe");
      await page.locator("#size").fill("50");
      expect(await page.locator("#size").inputValue()).toEqual("50");

      await page.locator("button[type='submit'][data-action='ok']").click();

      const stepItem = page.locator(`div.tab[data-tab="battle-transitions"] div.step-config-item[data-transition-type="diamondwipe"]`);
      const id = await stepItem.getAttribute("data-id") ?? "";
      expect(id).toBeTruthy();

      const expected = {
        ...diamondwipe,
        id: id,
        label: ""
      };

      const stepConfig = await getStepConfiguration(page, id);
      expect(stepConfig).toEqual(expected);

      await page.locator("button[type='submit']").getByText("Save Changes").click();

      await page.waitForFunction(() => (game.scenes?.getName("Scene 1")?.flags["battle-transitions"] as any)?.sequence);

      const config = await getSceneConfiguration(page, "Scene 1");
      expect(config).toBeTruthy();
      expect(config?.sequence).toBeTruthy();
      expect(config?.sequence).toHaveLength(1);

      expect(config?.sequence?.[0]).toEqual(expected);
    });

    test("Negative", async ({ page }) => {
      await openStepConfiguration(page, "diamondwipe");
      await page.locator("#size").fill("-50");
      console.log(await page.locator("#size").inputValue());
    });
  })

  test.describe("Backgrounds", () => {
    test("Can set background color", async ({ page }) => {
      await backgroundColorTest(page, {
        ...diamondwipe,
        backgroundColor: "#FFFFFFFF"
      });
    });

    test("Can set background image", async ({ page }) => {
      await backgroundImageTest(page, {
        ...diamondwipe,
        backgroundImage: "uploads/images/TestScene1.webp"
      })
    });
    test("Can set background overlay", async ({ page }) => {
      await backgroundOverlayTest(page, diamondwipe);
    });
  });

  test.describe("Easings", () => {
    for (const easing of Easings) {
      test(easing, async ({ page }) => {
        await easingTest(page, {
          ...diamondwipe,
          easing
        });
      });
    }
  });
})

test.describe("Transition Builder Tests", () => { });

test.describe("API Tests", () => { });

test.describe("Visual Confirmation", () => { });