import { testv12 as test, expect } from "./fixtures";
import { angularwipe } from "./data/defaults.json"
import easings from "./data/easings.json";
import { backgroundColorTest, backgroundImageTest, backgroundOverlayTest, defaultConfigurationTest, durationTest, easingTest, labelTest } from "./configTestFunctions";

test.describe("Configuration Tests", () => {
  test("Can set default configuration", async ({ page }) => {
    await defaultConfigurationTest(page, angularwipe);
  });

  test("Can set label", async ({ page }) => {
    await labelTest(page, {
      ...angularwipe,
      label: "Test Label"
    });
  });

  test("Can set duration", async ({ page }) => {
    await durationTest(page, {
      ...angularwipe,
      duration: 5000
    });
  });

  test("Can set background color", async ({ page }) => {
    await backgroundColorTest(page, {
      label: "",
      ...angularwipe,
      backgroundColor: "#FFFFFFFF"
    });
  });

  test("Can set background image", async ({ page }) => {
    await backgroundImageTest(page, {
      label: "",
      ...angularwipe,
      backgroundImage: "uploads/images/TestScene1.webp"
    })
  });

  test("Can set background to overlay", async ({ page }) => {
    await backgroundOverlayTest(page, {
      label: "",
      ...angularwipe,
      backgroundType: "overlay"
    })
  });

  test.describe("Can set easing", () => {
    for (const easing of easings) {
      test(easing, async ({ page }) => {
        await easingTest(page, {
          label: "",
          ...angularwipe,
          easing
        });
      })
    }
  });

});