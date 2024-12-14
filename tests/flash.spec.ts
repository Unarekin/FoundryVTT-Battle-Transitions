import { testv12 as test, expect } from "./fixtures";
import { FlashConfiguration } from '../src/steps/types';
import { backgroundColorTest, backgroundImageTest, backgroundOverlayTest, defaultConfigurationTest, durationTest } from "./configTestFunctions";
import { flash } from "./data/defaults.json";

declare const BattleTransition: any;

test.describe("UI Tests", () => {
  test("Default Configuration", async ({ page }) => {
    await defaultConfigurationTest(page, {
      ...flash,
      label: ""
    });
  });

  test("Label", async ({ page }) => { });

  test.describe("Backgrounds", () => {
    test("Color", async ({ page }) => {
      await backgroundColorTest(page, {
        ...flash,
        backgroundColor: "#FFFFFFFF"
      });
    });

    test("Image", async ({ page }) => {
      await backgroundImageTest(page, {
        ...flash,
        backgroundImage: "uploads/images/TestScene1.webp"
      });
    });

    test("Overlay", async ({ page }) => {
      await backgroundOverlayTest(page, flash);
    });
  });

  test("Duration", async ({ page }) => {
    await durationTest(page, flash);
  });

  test.describe("Apply Effect To", () => {
    test("Overlay", async ({ page }) => { });
    test("Scene", async ({ page }) => { });
    test("Both", async ({ page }) => { });
  })
});

test.describe("Transition Builder Tests", () => {

})

test.describe("API Tests", () => { });

test.describe("Visual Confirmation", () => { });