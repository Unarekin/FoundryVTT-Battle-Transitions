import { testv12 as test, expect } from "./fixtures";
import { clockwipe } from "./data/defaults.json";
import { backgroundColorTest, backgroundImageTest, backgroundOverlayTest, defaultConfigurationTest, durationTest, easingTest, labelTest, openStepConfiguration } from "./configTestFunctions";
import { ClockDirections, WipeDirections } from "../src/types";
import easings from "./data/easings.json";
import { executeSequence, generateColorSteps, getSceneConfiguration, getStepConfiguration } from "./functions";
import { ClockWipeConfiguration } from "../src/steps";
import { BackgroundType, Easing, SizingMode } from "../src/types";
import { promises as fs } from "fs";
import imageDataURI from "./data/imageDataUrl";

declare const BattleTransition: any;

test.describe("UI Tests", () => {
  test("Can set default settings", async ({ page }) => {
    await defaultConfigurationTest(page, {
      ...clockwipe,
      label: ""
    });
  });

  test("Can set label", async ({ page }) => {
    await labelTest(page, {
      ...clockwipe,
      label: "Test Label"
    });
  });

  test.describe("Clock Directions", () => {
    const directions = ["clockwise", "counterclockwise"];
    for (const direction of directions) {
      test(direction, async ({ page }) => { });
    }
  })

  test.describe("Directions", () => {
    const directions = ["top", "left", "right", "bottom", "topleft", "topright", "bottomleft", "bottomright"]
    for (const direction of directions) {
      test(direction, async ({ page }) => {
        await openStepConfiguration(page, "clockwipe");
        await page.locator("#direction").selectOption(direction);
        expect(await page.locator("#direction").inputValue()).toEqual(direction);

        await page.locator("button[type='submit'][data-action='ok']").click();

        const stepItem = page.locator(`div.tab[data-tab="battle-transitions"] div.step-config-item[data-transition-type="clockwipe"]`);
        const id = await stepItem.getAttribute("data-id") ?? "";
        expect(id).toBeTruthy();

        const expected = {
          ...clockwipe,
          direction,
          id,
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
      })
    }
  });

  test("Can set duration", async ({ page }) => {
    await durationTest(page, {
      ...clockwipe,
      duration: 5000
    });
  });

  test.describe("Backgrounds", () => {
    test("Can set background color", async ({ page }) => {
      await backgroundColorTest(page, {
        ...clockwipe,
        backgroundColor: "#FFFFFFFF"
      });
    });

    test("Can set background image", async ({ page }) => {
      await backgroundImageTest(page, {
        ...clockwipe,
        backgroundImage: "uploads/images/TestScene1.webp"
      })
    });
    test("Can set background overlay", async ({ page }) => {
      await backgroundOverlayTest(page, clockwipe);
    });
  });

  test.describe("Easings", () => {
    for (const easing of easings) {
      test(easing, async ({ page }) => {
        await easingTest(page, {
          ...clockwipe,
          easing
        });
      });
    }
  });

});

test.describe("Transition Builder Tests", () => { });

test.describe("API Tests", () => {
  test.describe("Clock Directions", () => {
    const directions = ["clockwise", "counterclockwise"] as const;

    test("undefined", async ({ page }) => {
      await page.evaluate(async () => {
        try {
          try {
            await new BattleTransition("Scene 2").clockWipe(undefined, "top").execute();
          } catch {
            return
          }
          throw new Error("Expected test to fail.");
        } finally {
          const scene = game?.scenes?.getName("Scene 1");
          if (scene) await scene.activate();
        }
      })
    })

    for (const direction of directions) {
      test(direction ?? typeof direction, async ({ page }) => {

        const sequence = await page.evaluate(direction => {
          const transition = new BattleTransition().clockWipe(direction, "top");
          return transition.sequence;
        }, direction);

        expect(sequence).toHaveLength(1);
        const item = sequence[0];
        delete item.serializedTexture;

        const expected: ClockWipeConfiguration = {
          ...clockwipe,
          direction: "top",
          clockDirection: direction,
          id: item.id,
          bgSizingMode: clockwipe.bgSizingMode as SizingMode,
          backgroundType: clockwipe.backgroundType as BackgroundType,
          easing: clockwipe.easing as Easing
        };

        expect(item).toEqual(expected);
        await executeSequence(page, [item]);
      });
    }

  });
  test.describe("Directions", () => {
    test("invalid", async ({ page }) => {
      expect(page.evaluate(() => new BattleTransition().clockWipe("clockwise", "invalid"))).rejects.toThrow();
    });
    for (const direction of WipeDirections) {
      test(direction, async ({ page }) => {
        const item = await page.evaluate(async direction => new BattleTransition().clockWipe("clockwise", direction).sequence[0], direction);
        expect(item).toBeTruthy();
        const expected = {
          ...clockwipe,
          clockDirection: "clockwise",
          direction,
          backgroundType: "color",
          backgroundColor: "transparent",
          backgroundImage: ""
        }
      });
    }
  });

  test.describe("Duration", () => {
    test("Negative", async ({ page }) => {
      expect(page.evaluate(() => new BattleTransition().clockWipe("clockwise", "top", -500).sequence)).rejects.toThrow();
    });
    test("Non-numeric", async ({ page }) => {
      expect(page.evaluate(() => new BattleTransition().clockWipe("clockwise", "top", "abcde").sequence)).rejects.toThrow();
    });
    test("Valid", async ({ page }) => {
      const sequence = await page.evaluate(() => new BattleTransition().clockWipe("clockwise", "top", 5000).sequence);
      expect(sequence).toBeTruthy();
      expect(sequence).toHaveLength(1);
      const item = sequence[0];

      delete item.serializedTexture;

      const expected = {
        ...clockwipe,
        id: item.id,
        duration: 5000,
        backgroundColor: "transparent",
      };


      expect(item).toEqual(expected);
      await page.evaluate(async (item) => {
        try {
          await BattleTransition.ExecuteSequence("Scene 2", [item])
        } finally {
          const scene = game?.scenes?.getName("Scene 1");
          if (scene) await scene.activate();
        }
      }, item)
    });
  })

  test.describe("Backgrounds", () => {

    test.describe("Colors", () => {
      test("Hex String", async ({ page }) => {
        const item = await page.evaluate(() => new BattleTransition().clockWipe("clockwise", "top", 1000, "#000000FF").sequence[0]);
        const expected = {
          ...clockwipe,
          id: item.id,
          clockDirection: "clockwise",
          direction: "top",
          duration: 1000,
          backgroundType: "color",
          backgroundImage: "",
          backgroundColor: "#000000ff"
        };
        delete item.serializedTexture;
        expect(item).toEqual(expected);
      });

      test("Name", async ({ page }) => {
        const item = await page.evaluate(() => new BattleTransition().clockWipe("clockwise", "top", 1000, "black").sequence[0]);
        const expected = {
          ...clockwipe,
          id: item.id,
          clockDirection: "clockwise",
          direction: "top",
          duration: 1000,
          backgroundType: "color",
          backgroundImage: "",
          backgroundColor: "#000000ff"
        };
        delete item.serializedTexture;
        expect(item).toEqual(expected);
      });

      test("Hex Integer", async ({ page }) => {
        const item = await page.evaluate(() => new BattleTransition().clockWipe("clockwise", "top", 1000, 0x000000).sequence[0]);
        const expected = {
          ...clockwipe,
          id: item.id,
          clockDirection: "clockwise",
          direction: "top",
          duration: 1000,
          backgroundType: "color",
          backgroundColor: "#000000ff"
        }
        delete item.serializedTexture;
        expect(item).toEqual(expected);
      });

      test("RGBA Object", async ({ page }) => {
        const item = await page.evaluate(() => new BattleTransition().clockWipe("clockwise", "top", 1000, { r: 0, g: 0, b: 0 }).sequence[0]);
        delete item.serializedTexture;
        const expected = {
          ...clockwipe,
          id: item.id,
          backgroundType: "color",
          backgroundImage: "",
          backgroundColor: "#000000ff"
        }
        expect(item).toEqual(expected);
      });
      test("RGBA string", async ({ page }) => {
        const item = await page.evaluate(() => new BattleTransition().clockWipe("clockwise", "top", 1000, "rgba(0,0,0,1)").sequence[0]);
        expect(item).toBeTruthy();
        delete item.serializedTexture;
        const expected = {
          ...clockwipe,
          id: item.id,
          backgroundType: "color",
          backgroundColor: "#000000ff",
          backgroundImage: ""
        };
        expect(item).toEqual(expected);
      });
      test("RGBA Array", async ({ page }) => {
        const item = await page.evaluate(() => new BattleTransition().clockWipe("clockwise", "top", 1000, [0, 0, 0, 255]).sequence[0]);
        expect(item).toBeTruthy();
        delete item.serializedTexture;
        const expected = {
          ...clockwipe,
          id: item.id,
          backgroundType: "color",
          backgroundColor: "#000000ff",
          backgroundImage: ""
        };
        expect(item).toEqual(expected);
      });
      test("HSLA Object", async ({ page }) => {
        const item = await page.evaluate(() => new BattleTransition().clockWipe("clockwise", "top", 1000, { h: 0, s: 0, l: 0, a: 255 }).sequence[0]);
        expect(item).toBeTruthy();
        delete item.serializedTexture;
        const expected = {
          ...clockwipe,
          id: item.id,
          backgroundType: "color",
          backgroundColor: "#000000ff",
          backgroundImage: ""
        };
        expect(item).toEqual(expected);
      });
      test("HSLA String", async ({ page }) => {
        const item = await page.evaluate(() => new BattleTransition().clockWipe("clockwise", "top", 1000, "hsla(0,0%,0%,1)").sequence[0]);
        expect(item).toBeTruthy();
        delete item.serializedTexture;
        const expected = {
          ...clockwipe,
          id: item.id,
          backgroundType: "color",
          backgroundColor: "#000000ff",
          backgroundImage: ""
        };
        expect(item).toEqual(expected);
      });
      test("HSVA Object", async ({ page }) => {
        const item = await page.evaluate(() => new BattleTransition().clockWipe("clockwise", "top", 1000, { h: 0, s: 0, v: 0 }).sequence[0]);
        expect(item).toBeTruthy();
        delete item.serializedTexture;
        const expected = {
          ...clockwipe,
          id: item.id,
          backgroundType: "color",
          backgroundColor: "#000000ff",
          backgroundImage: ""
        };
        expect(item).toEqual(expected);
      });
      test("PIXI.Color", async ({ page }) => {
        const item = await page.evaluate(() => new BattleTransition().clockWipe("clockwise", "top", 1000, new PIXI.Color([0, 0, 0])).sequence[0]);
        expect(item).toBeTruthy();
        delete item.serializedTexture;
        const expected = {
          ...clockwipe,
          id: item.id,
          backgroundType: "color",
          backgroundColor: "#000000ff",
          backgroundImage: ""
        };
        expect(item).toEqual(expected);
      });

    })

    test.describe("Textures", () => {
      test("Image URL", async ({ page }) => {
        const item = await page.evaluate(() => new BattleTransition().clockWipe("clockwise", "top", 1000, "uploads/images/TestScene1.webp").sequence[0]);
        expect(item).toBeTruthy();
        const expected = {
          ...clockwipe,
          id: item.id,
          backgroundType: "image",
          backgroundColor: "",
          backgroundImage: "uploads/images/TestScene1.webp",
          serializedTexture: "uploads/images/TestScene1.webp"
        };
        expect(item).toEqual(expected);
      });
      test("Data URI", async ({ page }) => {
        const item = await page.evaluate((dataURI) => new BattleTransition().clockWipe("clockwise", "top", 1000, dataURI).sequence[0], imageDataURI);
        expect(item).toBeTruthy();
        delete item.serializedTexture;

        const expected = {
          ...clockwipe,
          id: item.id,
          backgroundType: "image",
          backgroundColor: "",
          backgroundImage: imageDataURI
        };
        expect(item).toEqual(expected);
      });
      test("Image Element", async ({ page, baseURL }) => {
        const item = await page.evaluate(() => {
          const img = document.createElement("img");
          img.src = "uploads/images/TestScene1.webp";
          return new BattleTransition().clockWipe("clockwise", "top", 1000, img).sequence[0];
        })
        item.backgroundImage = "";
        const expected = {
          ...clockwipe,
          id: item.id,
          backgroundType: "image",
          backgroundColor: "",
          backgroundImage: "",
          serializedTexture: `${baseURL}/uploads/images/TestScene1.webp`
        }
        expect(item).toEqual(expected);
      });
    });

    test("Overlay", async ({ page }) => {
      const item = await page.evaluate(() => new BattleTransition().clockWipe("clockwise", "top", 1000, "overlay").sequence[0]);
      expect(item).toBeTruthy();
      delete item.serializedTexture;
      const expected = {
        ...clockwipe,
        direction: "top",
        clockDirection: "clockwise",
        backgroundType: "overlay",
        backgroundImage: "",
        backgroundColor: "",
        id: item.id
      };
      expect(item).toEqual(expected);
      await executeSequence(page, [item]);
    });
  });
  test.describe("Easings", () => {
    for (const easing of easings) {
      test(easing, async ({ page }) => {
        const item = await page.evaluate(easing => new BattleTransition().clockWipe("clockwise", "top", 1000, "transparent", easing).sequence[0], easing);
        delete item.serializedTexture;
        const expected = {
          ...clockwipe,
          id: item.id,
          backgroundType: "color",
          backgroundImage: "",
          backgroundColor: "#00000000",
          easing
        };

        expect(item).toEqual(expected);
      });
    }
  });
});

test("Visual Confirmation", async ({ page }) => {

  const sequence: ClockWipeConfiguration[] = [];

  const colors = generateColorSteps(0, 0, 0, 255, 255, 255, WipeDirections.length * ClockDirections.length);
  let i = 0;
  for (const clockDirection of ClockDirections) {
    for (const direction of WipeDirections) {
      const color = colors[i];
      i++;
      sequence.push({
        ...clockwipe,
        direction,
        clockDirection,
        bgSizingMode: "stretch",
        backgroundType: "color",
        easing: "none",
        backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})`
      });
    }
  }

  await page.evaluate(async sequence => {
    try {
      await BattleTransition.ExecuteSequence("Scene 2", sequence);
      await new Promise(resolve => { setTimeout(resolve, 1000) });
    } finally {
      const scene = game?.scenes?.getName("Scene 1");
      if (scene) await scene.activate();
    }
  }, sequence)
});