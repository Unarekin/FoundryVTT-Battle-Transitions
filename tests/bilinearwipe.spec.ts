import { expect, testv12 as test } from "./fixtures";
import { bilinearwipe } from "./data/defaults.json";
import easings from "./data/easings.json";
import { backgroundColorTest, backgroundImageTest, backgroundOverlayTest, defaultConfigurationTest, durationTest, easingTest, labelTest, openStepConfiguration } from "./configTestFunctions";
import { generateColorSteps, getSceneConfiguration, getStepConfiguration } from "./functions";
import { BilinearWipeConfiguration } from "../src/steps";
import { BilinearDirection, BilinearDirections, Easings, RadialDirection, RadialDirections } from '../src/types';
import { Page } from "@playwright/test";

declare const BattleTransition: any;

test.describe("Configuration Tests", () => {
  test("Can set default configuration", async ({ page }) => {
    await defaultConfigurationTest(page, bilinearwipe);
  });

  test("Can set label", async ({ page }) => {
    await labelTest(page, {
      ...bilinearwipe,
      label: "Test Label"
    });
  });

  test("Can set duration", async ({ page }) => {
    await durationTest(page, {
      ...bilinearwipe,
      duration: 5000
    });
  });

  test.describe("Can set direction", () => {
    test("Horizontal", async ({ page }) => {
      await bilinearDirectionTest(page, "horizontal");
    });

    test("Vertical", async ({ page }) => {
      await bilinearDirectionTest(page, "vertical");
    });

    test("Top Left", async ({ page }) => {
      await bilinearDirectionTest(page, "topleft");
    });

    test("Top Right", async ({ page }) => {
      await bilinearDirectionTest(page, "topright");
    })


  });

  test.describe("Can set radial direction", () => {

    test("Inside", async ({ page }) => {
      await openStepConfiguration(page, "bilinearwipe");

      await page.locator("#radial").selectOption("inside");
      expect(await page.locator("#radial").inputValue()).toEqual("inside");

      await page.locator("button[type='submit'][data-action='ok']").click();

      const stepItem = page.locator(`div.tab[data-tab="battle-transitions"] div.step-config-item[data-transition-type="bilinearwipe"]`);
      const id = await stepItem.getAttribute("data-id") ?? "";
      expect(id).toBeTruthy();

      const expected = {
        label: "",
        ...bilinearwipe,
        radial: "inside",
        id
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

    test("Outside", async ({ page }) => {
      await openStepConfiguration(page, "bilinearwipe");

      await page.locator("#radial").selectOption("outside");
      expect(await page.locator("#radial").inputValue()).toEqual("outside");

      await page.locator("button[type='submit'][data-action='ok']").click();

      const stepItem = page.locator(`div.tab[data-tab="battle-transitions"] div.step-config-item[data-transition-type="bilinearwipe"]`);
      const id = await stepItem.getAttribute("data-id") ?? "";
      expect(id).toBeTruthy();

      const expected = {
        label: "",
        ...bilinearwipe,
        radial: "outside",
        id
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
    })
  });


  test("Can set background color", async ({ page }) => {
    await backgroundColorTest(page, {
      ...bilinearwipe,
      backgroundColor: "#FFFFFFFF"
    });
  });

  test("Can set background image", async ({ page }) => {
    await backgroundImageTest(page, {
      ...bilinearwipe,
      backgroundImage: "uploads/images/TestScene1.webp"
    });
  });

  test("Can set background to overlay", async ({ page }) => {
    await backgroundOverlayTest(page, {
      ...bilinearwipe,
      backgroundType: "overlay"
    });
  });

  test.describe("Can set easing", () => {
    for (const easing of easings) {
      test(easing, async ({ page }) => {
        await easingTest(page, {
          ...bilinearwipe,
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
          await new BattleTransition("Scene 2").bilinearWipe();
        } catch (err) {
          return true;
        }
        throw new Error("Expected error to be thrown.");
      } finally {
        const scene = game.scenes?.getName("Scene 1");
        if (scene) await scene.activate();
      }
    });
  });

  test.describe("Directions", () => {
    test("Invalid", async ({ page }) => {
      await page.evaluate(async () => {
        try {
          try {
            await new BattleTransition("Scene 2").bilinearWipe("invalid");
          } catch (err) {
            return true;
          }

          throw new Error("Expected error to be thrown.");
        } finally {
          const scene = game.scenes?.getName("Scene 1");
          if (scene) await scene.activate();
        }
      })
    });

    for (const direction of BilinearDirections) {
      test(direction, async ({ page }) => {
        await page.evaluate<void, string>(async (direction) => {
          try {
            await new BattleTransition("Scene 2").bilinearWipe(direction, "inside");

            const current = game.scenes?.active;
            if (current?.name !== "Scene 2") throw new Error("Did not change scenes");
          } finally {
            const scene = game?.scenes?.getName("Scene 1");
            if (scene) await scene.activate();
          }
        }, direction)
      })
    }
  })

  test.describe("Radial directions", () => {
    test("Invalid", async ({ page }) => {
      await page.evaluate(async () => {
        try {
          try {
            await new BattleTransition("Scene 2").bilinearWipe("horizontal", "invalid");
          } catch (err) {
            return true;
          }
          throw new Error("Expected error to be thrown.");


        } finally {
          const scene = game.scenes?.getName("Scene 1");
          if (scene) await scene.activate();
        }
      })
    });

    for (const direction of RadialDirections) {
      test(direction, async ({ page }) => {
        await page.evaluate<void, string>(async (direction) => {
          try {
            try {
              await new BattleTransition("Scene 2").bilinearWipe("horizontal", direction);

              const current = game.scenes?.active;
              if (current?.name !== "Scene 2") throw new Error("Did not change scenes");
            } catch (err) {
              return;
            }

            const current = game.scenes?.active;
            if (current?.name !== "Scene 2") throw new Error("Did not change scenes.");
          } finally {
            const scene = game.scenes?.getName("Scene 1");
            if (scene) await scene.activate();
          }
        }, direction)
      })
    }
  });

  test.describe("Duration", () => {
    test("Non-numeric", async ({ page }) => {
      await page.evaluate(async () => {
        try {
          try {
            await new BattleTransition("Scene 2").bilinearWipe("horizontal", "inside", "invalid");
          } catch (err) {
            return
          }
          throw new Error("Expected error to be thrown.");
        } finally {
          const scene = game?.scenes?.getName("Scene 1");
          if (scene) await scene.activate();
        }
      });
    });

    test("Negative", async ({ page }) => {
      await page.evaluate(async () => {
        try {
          try {
            new BattleTransition("Scene 2").bilinearWipe("horizontal", "inside", -1000);
          } catch (err) {
            return
          }
          throw new Error("Expected error to be thrown.");
        } finally {
          const scene = game?.scenes?.getName("Scene 1");
          if (scene) await scene.activate();
        }
      });
    });

    test("Valid", async ({ page }) => {
      await page.evaluate(async () => {
        try {
          await new BattleTransition("Scene 2").bilinearWipe("horizontal", "inside", 2000).execute();

          const current = game.scenes?.active;
          if (current?.name !== "Scene 2") throw new Error("Did not change scenes");
        } finally {
          const scene = game?.scenes?.getName("Scene 1");
          if (scene) await scene.activate();
        }
      })
    })
  })

  test.describe("Backgrounds", () => {
    test("Invalid", async ({ page }) => {
      await page.evaluate(async () => {
        try {
          try {
            new BattleTransition("Scene 2").bilinearWipe("horizontal", "inside", 1000, null);
          } catch (err) {
            return;
          }
          throw new Error("Expected error to be thrown.")
        } finally {
          const scene = game?.scenes?.getName("Scene 1");
          if (scene) await scene.activate();
        }
      })
    })
  });

  test.describe("Easings", () => {
    test("Invalid", async ({ page }) => {
      await page.evaluate(async () => {
        try {
          try {
            new BattleTransition("Scene 2").bilinearWipe("horizontal", "inside", 1000, "transparent", "invalid");
          } catch (err) {
            return;
          }
          throw new Error("Expected error to be thrown.");
        } finally {
          const scene = game?.scenes?.getName("Scene 1");
          if (scene) await scene.activate();
        }
      });
    });

    for (const easing of Easings) {
      test(easing, async ({ page }) => {
        await page.evaluate<void, string>(async (easing) => {
          try {
            new BattleTransition("Scene 2").bilinearWipe("horizontal", "inside", 1000, "transparent", easing);
          } finally {
            const scene = game?.scenes?.getName("Scene 1");
            if (scene) await scene.activate();
          }
        }, easing);
      });
    }

  });

})

test("Visual Confirmation", async ({ page }) => {
  const directions: BilinearDirection[] = ["horizontal", "vertical", "topleft", "topright"];
  const radials: RadialDirection[] = ["inside", "outside"];

  const colors = generateColorSteps(0, 0, 0, 255, 255, 255, directions.length * radials.length);

  const configs: BilinearWipeConfiguration[] = [];

  let i = 0;

  for (const radial of radials) {
    for (const direction of directions) {
      const color = colors[i];
      i++;

      const config: BilinearWipeConfiguration = {
        type: "bilinearwipe",
        version: "1.1.0",
        duration: 1000,
        bgSizingMode: "stretch",
        backgroundType: "color",
        backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})`,
        id: "",
        easing: "none",
        direction,
        radial
      }
      configs.push(config);
    }
  }

  await page.evaluate<void, BilinearWipeConfiguration[]>(async (configs) => {
    await BattleTransition.ExecuteSequence("Scene 2", configs);
    await new Promise(resolve => { setTimeout(resolve, 2000) })
    const scene = game?.scenes?.getName("Scene 1");
    if (scene) await scene.activate();
  }, configs);
});


async function bilinearDirectionTest(page: Page, direction: string) {
  await openStepConfiguration(page, "bilinearwipe");

  await page.locator("#direction").selectOption(direction);
  expect(await page.locator("#direction").inputValue()).toEqual(direction);

  await page.locator("button[type='submit'][data-action='ok']").click();
  const stepItem = page.locator(`div.tab[data-tab='battle-transitions'] div.step-config-item[data-transition-type="bilinearwipe"]`);
  const id = await stepItem.getAttribute("data-id") ?? "";
  expect(id).toBeTruthy();

  const expected = {
    label: "",
    ...bilinearwipe,
    id,
    direction
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
}