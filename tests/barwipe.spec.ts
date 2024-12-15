import { testv12 as test, expect } from "./fixtures";
import { barwipe } from "./data/defaults.json";
import easings from "./data/easings.json";
import { backgroundColorTest, backgroundImageTest, backgroundOverlayTest, defaultConfigurationTest, durationTest, easingTest, labelTest, openStepConfiguration } from "./configTestFunctions";
import { generateColorSteps, getSceneConfiguration, getStepConfiguration } from "./functions";
import { BarWipeConfiguration } from "../src/steps";

declare const BattleTransition: any;

test.describe("Configuraton Tests", () => {
  test("Can set default configuration", async ({ page }) => {
    await defaultConfigurationTest(page, barwipe);
  });

  test("Can set label", async ({ page }) => {
    await labelTest(page, {
      ...barwipe,
      label: "Test Label"
    });
  });

  test("Can set Bars", async ({ page }) => {
    await openStepConfiguration(page, "barwipe");
    const bars = page.locator("input#bars");

    await bars.clear();
    await bars.fill("16");
    expect(await bars.inputValue()).toEqual("16");

    await bars.clear();
    expect(await page.locator("button[data-action='ok']").isDisabled()).toBeTruthy();

    await bars.clear();
    await bars.fill("16");
    await page.locator("button[data-action='ok']").click();

    const stepItem = page.locator(`div.tab[data-tab='battle-transitions'] div.step-config-item[data-transition-type="barwipe"]`);
    const id = await stepItem.getAttribute("data-id") ?? "";
    expect(id).toBeTruthy();

    const expected = {
      label: "",
      ...barwipe,
      bars: 16,
      id
    };

    const stepConfig = await getStepConfiguration(page, id);
    expect(stepConfig).toEqual(expected);

    await page.locator(`button[type="submit"]`).getByText("Save Changes").click();
    await page.waitForFunction(() => (game.scenes?.getName("Scene 1")?.flags["battle-transitions"] as any)?.sequence);
    const config = await getSceneConfiguration(page, "Scene 1");
    expect(config).toBeTruthy();
    expect(config?.sequence).toBeTruthy();
    expect(config?.sequence).toHaveLength(1);

    expect(config?.sequence?.[0]).toEqual(expected);
  });

  test.describe("Directions", () => {
    const directions = ["horizontal", "vertical"];

    for (const direction of directions) {
      test(direction, async ({ page }) => {
        await openStepConfiguration(page, "barwipe");

        await page.locator("#direction").selectOption(direction);
        expect(await page.locator("#direction").inputValue()).toEqual(direction);

        await page.locator("button[type='submit'][data-action='ok']").click();
        const stepItem = page.locator(`div.tab[data-tab='battle-transitions'] div.step-config-item[data-transition-type="barwipe"]`);
        const id = await stepItem.getAttribute("data-id") ?? "";
        expect(id).toBeTruthy();

        const expected = {
          label: "",
          ...barwipe,
          direction,
          id
        };

        const stepConfig = await getStepConfiguration(page, id);
        expect(stepConfig).toEqual(expected);

        await page.locator(`button[type="submit"]`).getByText("Save Changes").click();
        await page.waitForFunction(() => (game.scenes?.getName("Scene 1")?.flags["battle-transitions"] as any)?.sequence);
        const config = await getSceneConfiguration(page, "Scene 1");
        expect(config).toBeTruthy();
        expect(config?.sequence).toBeTruthy();
        expect(config?.sequence).toHaveLength(1);

        expect(config?.sequence?.[0]).toEqual(expected);

      });
    }
  });

  test("Can set duration", async ({ page }) => {
    await durationTest(page, {
      ...barwipe,
      duration: 5000
    });
  });

  test.describe("Background", () => {
    test("Color", async ({ page }) => {
      await backgroundColorTest(page, {
        ...barwipe,
        backgroundColor: "#FFFFFFFF"
      });
    });

    test("Image", async ({ page }) => {
      await backgroundImageTest(page, {
        ...barwipe,
        backgroundImage: "uploads/images/TestScene1.webp"
      });
    });

    test("Overlay", async ({ page }) => {
      await backgroundOverlayTest(page, {
        ...barwipe,
        backgroundType: "overlay"
      });
    });
  });

  test.describe("Easings", () => {
    for (const easing of easings) {
      test(easing, async ({ page }) => {
        await easingTest(page, {
          ...barwipe,
          easing
        });
      });
    }
  });


});

test.describe("API Tests", () => {
  test("No arguments", async ({ page }) => {
    await page.evaluate(async () => {
      try {
        try {
          await new BattleTransition("Scene 2").barWipe().execute();
        } catch {
          return
        }
        throw new Error("Expected test to fail.");
      } finally {
        const scene = game.scenes?.getName("Scene 1");
        if (scene) await scene.activate();
      }
    });
  });

  test("Bars", async ({ page }) => {
    await page.evaluate(async () => {
      try {
        await new BattleTransition("Scene 2").barWipe(12, "horizontal").execute();
        const scene = game.scenes?.current;
        if (scene?.name !== "Scene 2") throw new Error("Did not change scenes.");
      } finally {
        const scene = game.scenes?.getName("Scene 1");
        if (scene) await scene.activate();
      }
    })
  });

  test.describe("Directions", () => {
    const directions = ["horizontal", "vertical"];

    for (const direction of directions) {
      test(direction, async ({ page }) => {
        await page.evaluate<void, string>(async (direction) => {
          try {
            await new BattleTransition("Scene 2").barWipe(12, direction).execute();

            const scene = game.scenes?.current;
            if (scene?.name !== "Scene 2") throw new Error("Did not change scenes.");
          } finally {
            const scene = game.scenes?.getName("Scene 1");
            if (scene) await scene.activate();
          }
        }, direction);
      })
    }
  });

  test("Duration", async ({ page }) => {
    await page.evaluate(async () => {
      try {
        await new BattleTransition("Scene 2").barWipe(12, "horizontal", 2000).execute();
        const scene = game.scenes?.current;
        if (scene?.name !== "Scene 2") throw new Error("Did not change scenes.");
      } finally {
        const scene = game.scenes?.getName("Scene 1");
        if (scene) await scene.activate();
      }
    })
  });

  test.describe("Background", () => {
    test("Color", async ({ page }) => {
      await page.evaluate(async () => {
        try {
          await new BattleTransition("Scene 2").barWipe(16, "horizontal", 2000, "#000000FF").execute();

          const scene = game.scenes?.current;
          if (scene?.name !== "Scene 2") throw new Error("Did not change scenes.");
        } finally {
          const scene = game.scenes?.getName("Scene 1");
          if (scene) await scene.activate();
        }
      });
    });
    test("Image", async ({ page }) => {
      await page.evaluate(async () => {
        try {
          await new BattleTransition("Scene 2").barWipe(16, "horizontal", 2000, "uploads/images/TestScene1.webp").execute();

          const scene = game.scenes?.current;
          if (scene?.name !== "Scene 2") throw new Error("Did not change scenes.");
        } finally {
          const scene = game.scenes?.getName("Scene 1");
          if (scene) await scene.activate();
        }
      });
    });
    test("Overlay", async ({ page }) => {
      await page.evaluate(async () => {
        try {
          await new BattleTransition("Scene 2").barWipe(16, "horizontal", 2000, "overlay").execute();

          const scene = game.scenes?.current;
          if (scene?.name !== "Scene 2") throw new Error("Did not change scenes.");
        } finally {
          const scene = game.scenes?.getName("Scene 1");
          if (scene) await scene.activate();
        }
      });
    });
  });

  test.describe("Easings", () => {
    test("invalid", async ({ page }) => {
      await page.evaluate(async () => {
        try {
          await new BattleTransition("Scene 2").barWipe(16, "horizontal", 2000, "#000000FF", "invalid").execute();
          throw new Error("Expected test to throw error.")
        } catch {
          return
        } finally {
          const scene = game.scenes?.getName("Scene 1");
          if (scene) await scene.activate();
        }
      });
    });

    for (const easing of easings) {
      test(easing, async ({ page }) => {
        await page.evaluate<void, string>(async (easing) => {
          try {
            await new BattleTransition("Scene 2").barWipe(16, "horizontal", 2000, "transparent", easing).execute();

            const scene = game.scenes?.current;
            if (scene?.name !== "Scene 2") throw new Error("Did not change scenes.");
          } finally {
            const scene = game.scenes?.getName("Scene 1");
            if (scene) await scene.activate();
          }
        }, easing);
      });
    }
  });
});

test.describe("Transition Builder Tests", () => { });

test("Visual Confirmation", async ({ page }) => {
  const directions = ["horizontal", "vertical"] as const;

  const configs: BarWipeConfiguration[] = [];

  const colors = generateColorSteps(0, 0, 0, 255, 255, 255, 48);

  let i = 0;

  for (const direction of directions) {
    for (let i = 2; i < 24; i++) {
      const color = colors[i];
      i++;

      configs.push({
        id: "",
        duration: 1000,
        bars: i,
        bgSizingMode: "stretch",
        backgroundType: "color",
        backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
        type: "barwipe",
        version: "1.1.6",
        easing: "none",
        direction
      });
    }
  }

  await page.evaluate<void, BarWipeConfiguration[]>(async (configs) => {
    try {
      await BattleTransition.ExecuteSequence("Scene 2", configs);
    } finally {
      const scene = game.scenes?.getName("Scene 1");
      if (scene) await scene.activate();
    }
  }, configs);
});