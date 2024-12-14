import { testv12 as test } from "./fixtures";
import { angularwipe } from "./data/defaults.json";
import easings from "./data/easings.json";
import { backgroundColorTest, backgroundImageTest, backgroundOverlayTest, defaultConfigurationTest, durationTest, easingTest, labelTest } from "./configTestFunctions";

declare const BattleTransition: any;

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

test.describe("API Tests", () => {
  test("No arguments", async ({ page }) => {
    await page.evaluate(async () => {
      try {
        await new BattleTransition("Scene 2").angularWipe().execute();
        const current = game.scenes?.active;
        if (current?.name !== "Scene 2") throw new Error("Did not change scenes");
      } finally {
        const scene = game.scenes?.getName("Scene 1");
        if (scene) await scene.activate();
      }
    });

    await new Promise(resolve => { setTimeout(resolve, 2000) });
  });

  test("Only duration", async ({ page }) => {
    await page.evaluate(async () => {
      try {
        await new BattleTransition("Scene 2").angularWipe(5000).execute();
        const current = game.scenes?.active;
        if (current?.name !== "Scene 2") throw new Error("Did not change scenes");
      } finally {
        const scene = game.scenes?.getName("Scene 1");
        if (scene) await scene.activate();
      }
    });

    await new Promise(resolve => { setTimeout(resolve, 2000) });

  });

  test("Duration and background", async ({ page }) => {
    await page.evaluate(async () => {
      try {
        await new BattleTransition("Scene 2").angularWipe(2000, "black").execute();
        const current = game.scenes?.active;
        if (current?.name !== "Scene 2") throw new Error("Did not change scenes");
      } finally {
        const scene = game.scenes?.getName("Scene 1");
        if (scene) await scene.activate();
      }
    });

    await new Promise(resolve => { setTimeout(resolve, 2000) });
  });

  test("Duration, background, easing", ({ page }) => { });
});

test.describe("Transition Builder Tests", () => { });

test("Visual Confirmation", async ({ page }) => {
  await page.evaluate(async () => {
    await new BattleTransition("Scene 2").angularWipe(2000).execute();
    const scene = game?.scenes?.getName("Scene 1");
    if (scene) await scene.activate();
  })
});